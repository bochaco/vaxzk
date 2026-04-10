import {
  type MidnightProviders,
  type MidnightProvider,
  type WalletProvider,
} from "@midnight-ntwrk/midnight-js-types";
import type { WalletFacade } from "@midnight-ntwrk/wallet-sdk-facade";
import { type FoundContract } from "@midnight-ntwrk/midnight-js-contracts";
import type {
  VaxZkPrivateState,
  Contract,
  Witnesses,
} from "../../contract/src/index";

/**
 * Minimal interface the adapter requires from a wallet provider passed via
 * walletMode: "provider". Any object implementing WalletProvider and
 * MidnightProvider with an accessible WalletFacade satisfies this.
 */
export interface AdapterWalletProvider
  extends WalletProvider,
    MidnightProvider {
  readonly wallet: WalletFacade;
}

export const vaxZkPrivateStateKey = "VaxZkPrivateState";
export type PrivateStateId = typeof vaxZkPrivateStateKey;

/**
 * The private states consumed throughout the application.
 */
export type PrivateStates = {
  /**
   * Key used to provide the private state for {@link VaxZkContract} deployments.
   */
  readonly VaxZkPrivateState: VaxZkPrivateState;
};

/**
 * Represents VaxZk contract and its private state.
 *
 * @public
 */
export type VaxZkContract = Contract<
  VaxZkPrivateState,
  Witnesses<VaxZkPrivateState>
>;

/**
 * The keys of the circuits exported from {@link VaxZkContract}.
 *
 * @public
 */
export type VaxZkCircuitKeys = Exclude<
  keyof VaxZkContract["impureCircuits"],
  number | symbol
>;

/**
 * The providers required by {@link VaxZkContract}.
 *
 * @public
 */
export type VaxZkProviders = MidnightProviders<
  VaxZkCircuitKeys,
  PrivateStateId,
  VaxZkPrivateState
>;

/**
 * A {@link VaxZkContract} that has been deployed to the network.
 *
 * @public
 */
export type DeployedVaxZkContract = FoundContract<VaxZkContract>;

/**
 * A certificate issuer entry derived from the ledger's issuers map.
 */
export type DerivedIssuer = {
  readonly id: Uint8Array;
  readonly name: string;
};

/**
 * A proof request entry derived from the ledger's vaccineProofReqs map.
 */
export type DerivedProofRequest = {
  readonly id: Uint8Array;
  readonly vaccine: Uint8Array;
  readonly personalId: Uint8Array;
  readonly validUntil: bigint;
  /** True when a proof has already been submitted for this request ID. */
  readonly submitted: boolean;
};

/**
 * A type that represents the derived combination of public (or ledger), and private state.
 */
export type VaxZkDerivedState = {
  readonly clinics: Array<string>;
  readonly vaccines: Array<string>;
  readonly issuers: Array<DerivedIssuer>;
  readonly vaccineProofReqs: Array<DerivedProofRequest>;
  readonly isClinic: boolean;
  readonly isAdmin: boolean;
};
