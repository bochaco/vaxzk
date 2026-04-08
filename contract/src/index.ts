import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { type WitnessContext } from "@midnight-ntwrk/compact-runtime";
import {
  Contract,
  type Ledger,
  type Witnesses,
} from "../managed/contract/index.js";

export * from "../managed/contract/index.js";

export interface VaxZkPrivateState {
  readonly secretKey: Uint8Array;
}

export const createVaxZkPrivateState = (
  secretKey?: Uint8Array,
): VaxZkPrivateState => ({
  secretKey: secretKey ?? crypto.getRandomValues(new Uint8Array(32)),
});

export const witnesses: Witnesses<VaxZkPrivateState> = {
  localSk: ({
    privateState,
  }: WitnessContext<Ledger, VaxZkPrivateState>): [
    VaxZkPrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
};

export const CompiledVaxZkContract = CompiledContract.make<
  Contract<VaxZkPrivateState, Witnesses<VaxZkPrivateState>>
>("VaxZk", Contract<VaxZkPrivateState, Witnesses<VaxZkPrivateState>>).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(window.location.origin),
);
