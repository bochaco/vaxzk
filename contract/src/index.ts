import { CompiledContract } from "@midnight-ntwrk/compact-js";
import { Contract, type Witnesses } from "../managed/contract/index.js";
import { witnesses, type VaxZkPrivateState } from "./witnesses.js";

export * from "../managed/contract/index.js";
export * from "./witnesses.js";

export const CompiledVaxZkContract = CompiledContract.make<
  Contract<VaxZkPrivateState, Witnesses<VaxZkPrivateState>>
>("VaxZk", Contract<VaxZkPrivateState, Witnesses<VaxZkPrivateState>>).pipe(
  CompiledContract.withWitnesses(witnesses),
  CompiledContract.withCompiledFileAssets(window.location.origin),
);
