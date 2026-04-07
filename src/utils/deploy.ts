/**
 * VaxZK contract deployment, joining, and circuit call utilities.
 *
 * NOTE: The contract must be compiled before this file is fully functional:
 *   compact compile contract/src/vaxzk.compact dist/managed/vaxzk 
 *
 * After compilation the managed output will contain:
 *   dist/managed/vaxzk/contract/index.cjs  – TypeScript bindings
 *   dist/managed/vaxzk/keys/               – Verifier keys (served as static assets)
 *   dist/managed/vaxzk/zkir/               – ZK IR files (served as static assets)
 *
 * The keys/ and zkir/ directories must be reachable from window.location.origin so that
 * FetchZkConfigProvider can load them at runtime.
 */

import { CompiledContract } from '@midnight-ntwrk/compact-js';
import { type WitnessContext } from '@midnight-ntwrk/compact-runtime';
import { deployContract, findDeployedContract } from '@midnight-ntwrk/midnight-js/contracts';
import type { ContractAddress } from '@midnight-ntwrk/compact-runtime';
import type { ConnectedAPI } from '@midnight-ntwrk/dapp-connector-api';
import { FetchZkConfigProvider } from '@midnight-ntwrk/midnight-js-fetch-zk-config-provider';
import { setNetworkId } from '@midnight-ntwrk/midnight-js-network-id';
import { httpClientProofProvider } from '@midnight-ntwrk/midnight-js-http-client-proof-provider';
import { indexerPublicDataProvider } from '@midnight-ntwrk/midnight-js-indexer-public-data-provider';
import type { PrivateStateProvider } from '@midnight-ntwrk/midnight-js-types';
import { fromHex, toHex } from '@midnight-ntwrk/midnight-js-utils';
import {
  Transaction,
  type FinalizedTransaction,
} from '@midnight-ntwrk/ledger-v8';
import type {
  MidnightProviders,
  UnboundTransaction,
} from '@midnight-ntwrk/midnight-js-types';

// ---------------------------------------------------------------------------
// Private state
// ---------------------------------------------------------------------------

export interface VaxZkPrivateState {
  readonly secretKey: Uint8Array;
}

export const createVaxZkPrivateState = (secretKey: Uint8Array): VaxZkPrivateState => ({
  secretKey,
});

// ---------------------------------------------------------------------------
// Circuit keys — one entry per exported impure circuit
// ---------------------------------------------------------------------------

export type VaxZkCircuitKeys =
  | 'addAdmin'
  | 'revokeAdmin'
  | 'adminOnlyAction'
  | 'addClinic'
  | 'revokeClinic'
  | 'clinicOnlyAction';

export type ClinicPrivateState = VaxZkPrivateState;

export const VAXZK_PRIVATE_STATE_ID = 'vaxzk-private-state' as const;

// ---------------------------------------------------------------------------
// Witnesses
// Compact declaration: witness localSk(): Bytes<32>;
// The implementation reads the secret key from private state.
// ---------------------------------------------------------------------------

 
export const witnesses = {
  localSk: (
    { privateState }: WitnessContext<unknown, VaxZkPrivateState>,
  ): [VaxZkPrivateState, Uint8Array] => [privateState, privateState.secretKey],
};

// ---------------------------------------------------------------------------
// Compiled contract (lazy — requires the managed output to be present)
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let _compiledContract: any = null;

async function getCompiledContract() {
  if (!_compiledContract) {
    // Dynamic import so the module loads only when needed and doesn't crash
    // at startup if the contract hasn't been compiled yet.
    const VaxZk = await import('./managed/vaxzk/contract/index.js');

    _compiledContract = CompiledContract.make('vaxzk', VaxZk.Contract).pipe(
      CompiledContract.withWitnesses(witnesses),
      // ZK assets (keys/ and zkir/) must be served from the same origin.
      CompiledContract.withCompiledFileAssets(window.location.origin),
    );
  }
  return _compiledContract;
}

// ---------------------------------------------------------------------------
// Providers
// ---------------------------------------------------------------------------

export type VaxZkProviders = MidnightProviders<
  VaxZkCircuitKeys,
  typeof VAXZK_PRIVATE_STATE_ID,
  VaxZkPrivateState
>;

// ---------------------------------------------------------------------------
// In-memory private state provider (browser-compatible)
// ---------------------------------------------------------------------------

function inMemoryPrivateStateProvider(): PrivateStateProvider<typeof VAXZK_PRIVATE_STATE_ID, VaxZkPrivateState> {
  const states = new Map<string, VaxZkPrivateState>();
  const signingKeys = new Map<string, Uint8Array>();

  const noop = () => Promise.resolve();

  return {
    setContractAddress: () => { /* scoping not needed for in-memory */ },
    get: (id) => Promise.resolve(states.get(id) ?? null),
    set: (id, state) => { states.set(id, state); return Promise.resolve(); },
    remove: (id) => { states.delete(id); return Promise.resolve(); },
    clear: () => { states.clear(); return Promise.resolve(); },
    setSigningKey: (addr, key) => { signingKeys.set(addr, key as unknown as Uint8Array); return Promise.resolve(); },
    getSigningKey: (addr) => Promise.resolve((signingKeys.get(addr) ?? null) as never),
    removeSigningKey: (addr) => { signingKeys.delete(addr); return Promise.resolve(); },
    clearSigningKeys: () => { signingKeys.clear(); return Promise.resolve(); },
    exportPrivateStates: noop as never,
    importPrivateStates: noop as never,
    exportSigningKeys: noop as never,
    importSigningKeys: noop as never,
  };
}

/**
 * Build all providers required by midnight-js from an already-connected
 * Midnight Lace wallet (DApp Connector API v4).
 *
 * @param connectedAPI - The ConnectedAPI obtained from window.midnight.<wallet>.connect()
 */
export async function buildProviders(connectedAPI: ConnectedAPI, networkId: string): Promise<VaxZkProviders> {
  setNetworkId(networkId);

  const config = await connectedAPI.getConfiguration();
  const shieldedAddresses = await connectedAPI.getShieldedAddresses();

  const zkConfigProvider = new FetchZkConfigProvider<VaxZkCircuitKeys>(
    window.location.origin,
    fetch.bind(window),
  );

  return {
    privateStateProvider: inMemoryPrivateStateProvider(),

    publicDataProvider: indexerPublicDataProvider(config.indexerUri, config.indexerWsUri),

    zkConfigProvider,

    proofProvider: httpClientProofProvider(config.proverServerUri!, zkConfigProvider),

    walletProvider: {
      getCoinPublicKey(): string {
        return shieldedAddresses.shieldedCoinPublicKey;
      },
      getEncryptionPublicKey(): string {
        return shieldedAddresses.shieldedEncryptionPublicKey;
      },
      async balanceTx(tx: UnboundTransaction, _ttl?: Date): Promise<FinalizedTransaction> {
        const serialized = toHex(tx.serialize());
        const { tx: balanced } = await connectedAPI.balanceUnsealedTransaction(serialized);
        return Transaction.deserialize(
          'signature',
          'proof',
          'binding',
          fromHex(balanced),
        );
      },
    },

    midnightProvider: {
      async submitTx(tx: FinalizedTransaction): Promise<string> {
        await connectedAPI.submitTransaction(toHex(tx.serialize()));
        // Return the first transaction identifier
        return tx.identifiers()[0];
      },
    },
  };
}

// ---------------------------------------------------------------------------
// Deploy
// ---------------------------------------------------------------------------

/**
 * Deploy a new VaxZK contract.
 *
 * @param providers - Providers built from {@link buildProviders}
 * @param secretKey - The deployer's 32-byte secret key; its public key becomes
 *                    the first admin on the contract's ledger.
 */
export async function deployVaxZkContract(
  providers: VaxZkProviders,
  secretKey: Uint8Array,
) {
  const compiledContract = await getCompiledContract();
  return deployContract(providers, {
    compiledContract,
    args: [],
    privateStateId: VAXZK_PRIVATE_STATE_ID,
    initialPrivateState: createVaxZkPrivateState(secretKey),
  });
}

// ---------------------------------------------------------------------------
// Join
// ---------------------------------------------------------------------------

/**
 * Join an existing VaxZK contract that was deployed by someone else.
 *
 * @param providers       - Providers built from {@link buildProviders}
 * @param contractAddress - On-chain address of the deployed contract
 * @param secretKey       - The joining user's 32-byte secret key
 */
export async function joinVaxZkContract(
  providers: VaxZkProviders,
  contractAddress: ContractAddress,
  secretKey: Uint8Array,
) {
  const compiledContract = await getCompiledContract();
  return findDeployedContract(providers, {
    compiledContract,
    contractAddress,
    privateStateId: VAXZK_PRIVATE_STATE_ID,
    initialPrivateState: createVaxZkPrivateState(secretKey),
  });
}

// ---------------------------------------------------------------------------
// Circuit call helpers
// Each function wraps the corresponding exported Compact circuit.
// The returned promise resolves with FinalizedTxData once the transaction is
// confirmed on-chain.
// ---------------------------------------------------------------------------

type DeployedVaxZkContract = Awaited<ReturnType<typeof deployVaxZkContract>>;

/**
 * Add a new admin to the contract.
 * Caller must already be an admin (enforced by the isAdmin() guard circuit).
 *
 * @param contract  - Deployed contract handle
 * @param adminSk   - 32-byte secret key of the account to promote to admin
 */
export function addAdmin(contract: DeployedVaxZkContract, adminSk: Uint8Array) {
  return contract.callTx.addAdmin(adminSk);
}

/**
 * Remove an existing admin from the contract.
 * Caller must already be an admin.
 *
 * @param contract  - Deployed contract handle
 * @param adminSk   - 32-byte secret key of the admin to remove
 */
export function revokeAdmin(contract: DeployedVaxZkContract, adminSk: Uint8Array) {
  return contract.callTx.revokeAdmin(adminSk);
}

/**
 * Execute adminOnlyAction — a placeholder circuit that asserts admin status.
 *
 * @param contract   - Deployed contract handle
 * @param someParam  - A Uint<16> value (passed as bigint)
 */
export function adminOnlyAction(contract: DeployedVaxZkContract, someParam: bigint) {
  return contract.callTx.adminOnlyAction(someParam);
}

/**
 * Add a new clinic to the contract.
 * Caller must be an admin.
 *
 * @param contract  - Deployed contract handle
 * @param clinicSk  - 32-byte secret key of the account to register as a clinic
 */
export function addClinic(contract: DeployedVaxZkContract, clinicSk: Uint8Array) {
  return contract.callTx.addClinic(clinicSk);
}

/**
 * Remove a clinic from the contract.
 * Caller must be an admin.
 *
 * @param contract  - Deployed contract handle
 * @param clinicSk  - 32-byte secret key of the clinic to remove
 */
export function revokeClinic(contract: DeployedVaxZkContract, clinicSk: Uint8Array) {
  return contract.callTx.revokeClinic(clinicSk);
}

/**
 * Execute clinicOnlyAction — a circuit that asserts clinic status.
 *
 * @param contract   - Deployed contract handle
 */
export function clinicOnlyAction(contract: DeployedVaxZkContract) {
  return contract.callTx.clinicOnlyAction();
}

/**
 * Check if the current user is a clinic by attempting to call clinicOnlyAction locally.
 *
 * @param contract - Deployed contract handle
 * @returns true if the user is a clinic, false otherwise.
 */
export async function isClinic(contract: DeployedVaxZkContract): Promise<boolean> {
  try {
    // We attempt to "call" the circuit. In midnight-js, calling an impure circuit
    // performs local proof generation. If the assertion fails (e.g. not a clinic),
    // it will throw an error before even trying to submit.
    await contract.callTx.clinicOnlyAction();
    return true;
  } catch (err) {
    if (err instanceof Error && err.message.includes("You are not an clinic")) {
      return false;
    }
    // For other errors, we might want to log them or rethrow, but for UI check,
    // assuming not a clinic is safer.
    console.warn('Clinic check failed:', err);
    return false;
  }
}
