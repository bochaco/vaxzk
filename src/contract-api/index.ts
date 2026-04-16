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
import type { UserProfile, ClinicProfile, CertIssuerInfo, VaccineProofRequest } from "../../contract/managed/contract/index.js";
import { vaxZkPrivateStateKey } from "./common-types.js";
import { signVaxZkCertificate } from "./signing.js";
import type { VaxZkPrivateState } from "../../contract/src/index";
import {
  CompiledVaxZkContract,
  createVaxZkPrivateState,
  type VaxZkProof,
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

  addCertificateIssuer: (issuerInfo: CertIssuerInfo) => Promise<Uint8Array>;
  addClinic: (id: Uint8Array, clinic: ClinicProfile) => Promise<void>;
  addVaccine: (name: string) => Promise<void>;
  delVaccine: (name: string) => Promise<void>;
  registerInviteAdmin: (key: string) => Promise<void>;
  acceptInviteAdmin: (key: string) => Promise<void>;
  getProfile: () => Promise<UserProfile>;
  revokeClinic: (id: Uint8Array) => Promise<void>;
  requestVaccineProof: (req: VaccineProofRequest) => Promise<Uint8Array>;
  revokeAdmin: (id: Uint8Array) => Promise<void>;
  submitVaccineProof: (
    proofReqId: Uint8Array,
    issuerId: Uint8Array,
    vaccine: Uint8Array,
    personalId: Uint8Array,
  ) => Promise<void>;
  signAndSetVaxZkProof: (
    vaccine: string,
    personalId: string,
    expirationDate: bigint,
  ) => Promise<void>;
}

/**
 * Provides an implementation of {@link DeployedVaxZkAPI} by adapting a deployed VaxZk
 * contract.
 */
export class VaxZkAPI implements DeployedVaxZkAPI {
  readonly deployedContractAddress: ContractAddress;
  readonly state$: Observable<VaxZkDerivedState>;
  readonly deployedContract: DeployedVaxZkContract;
  private readonly providers: VaxZkProviders;

  /** @internal */
  private constructor(
    deployedContract: DeployedVaxZkContract,
    providers: VaxZkProviders,
  ) {
    this.providers = providers;
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
                `ledger state changed: clinics: ${ledgerState.clinics.size()}, vaccines: ${ledgerState.vaccines.size()}`,
              ),
            ),
          ),
        from(
          providers.privateStateProvider.get(
            vaxZkPrivateStateKey,
          ) as Promise<VaxZkPrivateState>,
        ),
      ],
      (ledgerState, _) => {
        const dec = new TextDecoder();
        const decodeBytes = (b: Uint8Array) => dec.decode(b).replace(/\0/g, "").trim();

        const clinics = [];
        for (const [id, profile] of ledgerState.clinics) {
          clinics.push({
            id,
            ownerId: profile.ownerId,
            name: decodeBytes(profile.name),
            urlImage: decodeBytes(profile.urlImage),
            address: decodeBytes(profile.address),
            latitud: decodeBytes(profile.latitud),
            longitud: decodeBytes(profile.longitud),
            isOnline: profile.isOnline,
          });
        }

        const vaccines = new Array<string>();
        for (const vaccineBytes of ledgerState.vaccines) {
          vaccines.push(
            new TextDecoder().decode(vaccineBytes).replace(/\0/g, "").trim(),
          );
        }

        const issuers = [];
        for (const [id, info] of ledgerState.issuers) {
          issuers.push({ id, name: info.name, uri: info.uri, verificationEndpoint: info.verificationEndpoint });
        }

        const vaccineProofReqs = [];
        for (const [id, req] of ledgerState.vaccineProofReqs) {
          vaccineProofReqs.push({
            id,
            vaccine: req.vaccine,
            personalId: req.personalId,
            validUntil: req.validUntil,
            submitted: ledgerState.vaccineProofs.member(id),
          });
        }

        return { clinics, vaccines, issuers, vaccineProofReqs };
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

  async getProfile(): Promise<UserProfile> {
    const txData = await this.deployedContract.callTx.getProfile();
    console.log({
      transactionAdded: {
        circuit: "getProfile",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
    return txData.private.result as UserProfile;
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

  async addClinic(id: Uint8Array, clinic: ClinicProfile): Promise<void> {
    console.log(`adding Clinic with ID ${toHex(id)}`);
    if (id.length !== 32) {
      throw new Error(
        `Clinic ID shall be 32 bytes long but it is ${id.length}`,
      );
    }
    const txData = await this.deployedContract.callTx.addClinic(id, clinic);
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

  async delVaccine(name: string): Promise<void> {
    console.log(`removing Vaccine ${name}`);
    const nameBytes = new TextEncoder().encode(name);
    const padded = new Uint8Array(20);
    padded.set(nameBytes.slice(0, 20));

    const txData = await this.deployedContract.callTx.delVaccine(padded);
    console.log({
      transactionAdded: {
        circuit: "delVaccine",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async registerInviteAdmin(inviteCode: string): Promise<void> {
    console.log(`registerInviteAdmin`);
    const padded = new Uint8Array(32);
    const uuidBytes = new TextEncoder().encode(inviteCode);
    padded.set(uuidBytes.slice(0, 32));
    const txData = await this.deployedContract.callTx.registerInviteAdmin(padded);
    console.log({
      transactionAdded: {
        circuit: "registerInviteAdmin",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async acceptInviteAdmin(uuid: string): Promise<void> {
    console.log(`acceptInviteAdmin`);
    const padded = new Uint8Array(32);
    const uuidBytes = new TextEncoder().encode(uuid);
    padded.set(uuidBytes.slice(0, 32));
    const txData =
      await this.deployedContract.callTx.acceptInviteAdmin(padded);
    console.log({
      transactionAdded: {
        circuit: "acceptInviteAdmin",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async addCertificateIssuer(issuerInfo: CertIssuerInfo): Promise<Uint8Array> {
    console.log(`adding certificate issuer: ${issuerInfo.name}`);
    const txData =
      await this.deployedContract.callTx.addCertificateIssuer(issuerInfo);
    console.log({
      transactionAdded: {
        circuit: "addCertificateIssuer",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
    return txData.private.result as Uint8Array;
  }

//  async addSelfAsClinic(): Promise<void> {
//    const privateState = await this.providers.privateStateProvider.get(vaxZkPrivateStateKey);
//    if (!privateState) throw new Error("Private state not found");
//    const clinicId = VaxZk.pureCircuits.getShieldedId(privateState.secretKey);
//    await this.addClinic(clinicId);
//  }

  async requestVaccineProof(req: VaccineProofRequest): Promise<Uint8Array> {
    console.log(`requesting vaccine proof for vaccine ${toHex(req.vaccine)}`);
    const txData = await this.deployedContract.callTx.requestVaccineProof(req);
    console.log({
      transactionAdded: {
        circuit: "requestVaccineProof",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
    return txData.private.result as Uint8Array;
  }

  async submitVaccineProof(
    proofReqId: Uint8Array,
    issuerId: Uint8Array,
    vaccine: Uint8Array,
    personalId: Uint8Array,
  ): Promise<void> {
    const HARDCODED_ISSUER_SK =
      1234567890123456789012345678901234567890123456789012345678901234n;
    // 1/1/2031 00:00:00 UTC
    const expirationDate = 1924992000n;

    const pkHex = this.providers.walletProvider.getCoinPublicKey();
    const userCoinPkBytes = fromHex(pkHex);

    const proof = signVaxZkCertificate(
      HARDCODED_ISSUER_SK,
      issuerId,
      vaccine,
      personalId,
      expirationDate,
      userCoinPkBytes,
    );

    const existing = await this.providers.privateStateProvider.get(vaxZkPrivateStateKey);
    const currentState = existing ?? createVaxZkPrivateState();
    await this.providers.privateStateProvider.set(vaxZkPrivateStateKey, {
      ...currentState,
      vaxZkProof: proof,
    });

    console.log(`submitting vaccine proof for request ${toHex(proofReqId)}`);
    const txData = await this.deployedContract.callTx.submitVaccineProof(proofReqId);
    console.log({
      transactionAdded: {
        circuit: "submitVaccineProof",
        txHash: txData.public.txHash,
        blockHeight: txData.public.blockHeight,
      },
    });
  }

  async signAndSetVaxZkProof(
    vaccine: string,
    personalId: string,
    expirationDate: bigint,
  ): Promise<void> {
    // TODO: replace with a proper mechanism to obtain the issuer secret key
    // once that is defined (e.g. fetched from an attestation server or derived
    // from a wallet key).
    const HARDCODED_ISSUER_SK =
      1234567890123456789012345678901234567890123456789012345678901234n;

    // TODO: replace with the real issuer ID once the mechanism to obtain it
    // is defined (e.g. looked up from the on-chain issuers map or provided
    // by an attestation server).
    const HARDCODED_ISSUER_ID = new Uint8Array(32).fill(1);

    // Encode vaccine and personalId the same way requestVaccineProof does (UTF-8,
    // zero-padded to 20 bytes), so bytes match when submitVaccineProof compares
    // proof.vaccine == vaccineProofReq.vaccine and proof.personalId == vaccineProofReq.personalId.
    const enc = new TextEncoder();
    const vaccineBytes = new Uint8Array(20);
    vaccineBytes.set(enc.encode(vaccine).slice(0, 20));
    const personalIdBytes = new Uint8Array(20);
    personalIdBytes.set(enc.encode(personalId).slice(0, 20));

    // ownPublicKey() in the circuit resolves to the ZSwap coin public key of the
    // transaction submitter. We obtain the same key here so the signed message matches.
    const pkHex = this.providers.walletProvider.getCoinPublicKey();
    const userCoinPkBytes = fromHex(pkHex);

    const proof: VaxZkProof = signVaxZkCertificate(
      HARDCODED_ISSUER_SK,
      HARDCODED_ISSUER_ID,
      vaccineBytes,
      personalIdBytes,
      expirationDate,
      userCoinPkBytes,
    );

    const existing =
      await this.providers.privateStateProvider.get(vaxZkPrivateStateKey);
    const currentState = existing ?? createVaxZkPrivateState();
    await this.providers.privateStateProvider.set(vaxZkPrivateStateKey, {
      ...currentState,
      vaxZkProof: proof,
    });
    console.log("VaxZkProof signed and stored in private state");
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
