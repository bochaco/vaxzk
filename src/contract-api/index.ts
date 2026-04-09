import * as VaxZk from "../../contract/managed/contract/index.js";

import { setNetworkId } from "@midnight-ntwrk/midnight-js-network-id";
import { FetchZkConfigProvider } from "@midnight-ntwrk/midnight-js-fetch-zk-config-provider";
import { indexerPublicDataProvider } from "@midnight-ntwrk/midnight-js-indexer-public-data-provider";
import { httpClientProofProvider } from "@midnight-ntwrk/midnight-js-http-client-proof-provider";
import {
  Transaction,
  type FinalizedTransaction,
} from "@midnight-ntwrk/ledger-v8";
import { fromHex, toHex } from "@midnight-ntwrk/midnight-js-utils";
import type { UnboundTransaction } from "@midnight-ntwrk/midnight-js-types";
import type { ConnectedAPI } from "@midnight-ntwrk/dapp-connector-api";
import { type ContractAddress } from "@midnight-ntwrk/compact-runtime";
import type {
  VaxZkDerivedState,
  VaxZkContract,
  VaxZkProviders,
  DeployedVaxZkContract,
  VaxZkCircuitKeys,
} from "./common-types.js";
import { vaxZkPrivateStateKey } from "./common-types.js";
import type { VaxZkPrivateState } from "../../contract/src/index";
import {
  CompiledVaxZkContract,
  createVaxZkPrivateState,
} from "../../contract/src/index";
import {
  deployContract,
  findDeployedContract,
} from "@midnight-ntwrk/midnight-js-contracts";
import {
  combineLatest,
  map,
  tap,
  from,
  shareReplay,
  type Observable,
} from "rxjs";
import { createInMemoryPrivateStateProvider } from "./in-memory-private-state.js";

/**
 * An API for a deployed VaxZk.
 */
export interface DeployedVaxZkAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VaxZkDerivedState>;

  addAdmin: (id: Uint8Array) => Promise<void>;
  revokeAdmin: (id: Uint8Array) => Promise<void>;
  addClinic: (id: Uint8Array) => Promise<void>;
  revokeClinic: (id: Uint8Array) => Promise<void>;
  addVaccine: (name: string) => Promise<void>;
}

/**
 * Provides an implementation of {@link DeployedVaxZkAPI} by adapting a deployed VaxZk
 * contract.
 */
export class VaxZkAPI implements DeployedVaxZkAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VaxZkDerivedState>;
  readonly deployedContract: DeployedVaxZkContract;

  /** @internal */
  private constructor(
    deployedContract: DeployedVaxZkContract,
    providers: VaxZkProviders,
  ) {
    this.deployedContract = deployedContract;
    this.deployedContractAddress =
      deployedContract.deployTxData.public.contractAddress;
    this.state$ = combineLatest(
      [
        providers.publicDataProvider
          .contractStateObservable(this.deployedContractAddress, {
            type: "latest",
          })
          .pipe(
            map((contractState) => VaxZk.ledger(contractState.data)),
            tap((ledgerState) =>
              console.log(
                `ledger state changed: admins ${ledgerState.totalAdmins}, clinics: ${ledgerState.clinics.size()}, vaccines: ${ledgerState.vaccines.size()}`,
              ),
            ),
          ),
        from(
          providers.privateStateProvider.get(
            vaxZkPrivateStateKey,
          ) as Promise<VaxZkPrivateState>,
        ),
      ],
      (ledgerState, privateState) => {
        const clinics = new Array<string>();
        for (const clinic of ledgerState.clinics) {
          clinics.push(toHex(clinic));
        }
        const vaccines = new Array<string>();
        for (const vaccineBytes of ledgerState.vaccines) {
          vaccines.push(new TextDecoder().decode(vaccineBytes).replace(/\0/g, '').trim());
        }

        const myId = privateState
          ? VaxZk.pureCircuits.getShieldedId(privateState.secretKey)
          : null;
        const isClinic = myId ? ledgerState.clinics.member(myId) : false;

        return { clinics, vaccines, isClinic };
      },
    ).pipe(shareReplay({ bufferSize: 1, refCount: false }));
  }

  /**
   * Deploys a new VaxZk contract to the network.
   */
  static async deploy(
    providers: VaxZkProviders,
    secretKey?: Uint8Array,
  ): Promise<VaxZkAPI> {
    console.log("deploying VaxZk contract...");

    const deployedVaxZkContract = await deployContract(providers, {
      compiledContract: CompiledVaxZkContract,
      privateStateId: vaxZkPrivateStateKey,
      initialPrivateState: createVaxZkPrivateState(secretKey),
    });

    return new VaxZkAPI(
      deployedVaxZkContract as unknown as DeployedVaxZkContract,
      providers,
    );
  }

  /**
   * Finds an already deployed VaxZk contract and joins it.
   */
  static async join(
    providers: VaxZkProviders,
    contractAddress: ContractAddress,
    secretKey?: Uint8Array,
  ): Promise<VaxZkAPI> {
    console.log(`joining VaxZk contract at: ${contractAddress}`);

    providers.privateStateProvider.setContractAddress(contractAddress);

    const deployedVaxZkContract = await findDeployedContract<VaxZkContract>(
      providers,
      {
        contractAddress,
        compiledContract: CompiledVaxZkContract,
        privateStateId: vaxZkPrivateStateKey,
        initialPrivateState: await VaxZkAPI.getPrivateState(
          providers,
          secretKey,
        ),
      },
    );

    return new VaxZkAPI(deployedVaxZkContract, providers);
  }

  private static async getPrivateState(
    providers: VaxZkProviders,
    secretKey?: Uint8Array,
  ): Promise<VaxZkPrivateState> {
    const existingPrivateState =
      await providers.privateStateProvider.get(vaxZkPrivateStateKey);
    return existingPrivateState ?? createVaxZkPrivateState(secretKey);
  }

  async addAdmin(id: Uint8Array): Promise<void> {
    console.log(`adding Admin with ID ${toHex(id)}`);
    if (id.length !== 32) {
      throw new Error(`Admin ID shall be 32 bytes long but it is ${id.length}`);
    }
    const txData = await this.deployedContract.callTx.addAdmin(id);
    console.log({
      transactionAdded: {
        circuit: "addAdmin",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async revokeAdmin(id: Uint8Array): Promise<void> {
    console.log(`revoking Admin with ID ${toHex(id)}`);
    if (id.length !== 32) {
      throw new Error(`Admin ID shall be 32 bytes long but it is ${id.length}`);
    }
    const txData = await this.deployedContract.callTx.revokeAdmin(id);
    console.log({
      transactionAdded: {
        circuit: "revokeAdmin",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async addClinic(id: Uint8Array): Promise<void> {
    console.log(`adding Clinic with ID ${toHex(id)}`);
    if (id.length !== 32) {
      throw new Error(
        `Clinic ID shall be 32 bytes long but it is ${id.length}`,
      );
    }
    const txData = await this.deployedContract.callTx.addClinic(id);
    console.log({
      transactionAdded: {
        circuit: "addClinic",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async revokeClinic(id: Uint8Array): Promise<void> {
    console.log(`revoking Clinic with ID ${toHex(id)}`);
    if (id.length !== 32) {
      throw new Error(
        `Clinic ID shall be 32 bytes long but it is ${id.length}`,
      );
    }
    const txData = await this.deployedContract.callTx.revokeClinic(id);
    console.log({
      transactionAdded: {
        circuit: "revokeClinic",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async addVaccine(name: string): Promise<void> {
    console.log(`adding Vaccine ${name}`);
    const nameBytes = new TextEncoder().encode(name);
    const padded = new Uint8Array(20);
    padded.set(nameBytes.slice(0, 20));
    
    const txData = await this.deployedContract.callTx.addVaccine(padded);
    console.log({
      transactionAdded: {
        circuit: "addVaccine",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

}

/**
 * Build all providers required by midnight-js from an already-connected
 * Midnight Lace wallet (DApp Connector API v4).
 */
export async function buildProviders(
  connectedAPI: ConnectedAPI,
  networkId: string,
): Promise<VaxZkProviders> {
  setNetworkId(networkId);

  const config = await connectedAPI.getConfiguration();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();

  const zkConfigProvider = new FetchZkConfigProvider<VaxZkCircuitKeys>(
    window.location.origin,
    fetch.bind(window),
  );

  return {
    privateStateProvider: createInMemoryPrivateStateProvider() as never,

    publicDataProvider: indexerPublicDataProvider(
      config.indexerUri,
      config.indexerWsUri,
    ),

    zkConfigProvider,

    proofProvider: httpClientProofProvider(
      config.proverServerUri!,
      zkConfigProvider,
    ),

    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      async balanceTx(
        tx: UnboundTransaction,
        _ttl?: Date,
      ): Promise<FinalizedTransaction> {
        const serialized = toHex(tx.serialize());
        const { tx: balanced } =
          await connectedAPI.balanceUnsealedTransaction(serialized);
        return Transaction.deserialize(
          "signature",
          "proof",
          "binding",
          fromHex(balanced),
        );
      },
    },

    midnightProvider: {
      async submitTx(tx: FinalizedTransaction): Promise<string> {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        return tx.identifiers()[0];
      },
    },
  };
}

export * from "./common-types.js";
