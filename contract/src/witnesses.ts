import { type WitnessContext } from "@midnight-ntwrk/compact-runtime";
import {
  type VaxZkProof,
  type Ledger,
  type Witnesses,
} from "../managed/contract/index.js";

export interface VaxZkPrivateState {
  readonly secretKey: Uint8Array;
  readonly vaxZkProof: VaxZkProof;
  readonly inviteSecret: Uint8Array;
  readonly inviteNonce: Uint8Array;
}

export const createVaxZkPrivateState = (
  secretKey?: Uint8Array,
  inviteSecret?: Uint8Array,
  inviteNonce?: Uint8Array,
): VaxZkPrivateState => ({
  secretKey: secretKey ?? crypto.getRandomValues(new Uint8Array(32)),
  vaxZkProof: {
    issuerId: new Uint8Array(),
    vaccine: new Uint8Array(),
    personalId: new Uint8Array(),
    expirationDate: 0n,
    issuerSignature: {
      announcement: { x: 0n, y: 0n },
      response: 0n,
    },
  },
  inviteSecret: inviteSecret ?? crypto.getRandomValues(new Uint8Array(32)),
  inviteNonce: inviteNonce ?? crypto.getRandomValues(new Uint8Array(32)),
});

export type SchnorrSignatureJs = {
  announcement: { x: bigint; y: bigint };
  response: bigint;
};

const TWO_248 =
  452312848583266388373324160190187140051835877600158453279131187530910662656n;

export const witnesses: Witnesses<VaxZkPrivateState> = {
  localSk: ({
    privateState,
  }: WitnessContext<Ledger, VaxZkPrivateState>): [
    VaxZkPrivateState,
    Uint8Array,
  ] => [privateState, privateState.secretKey],
  getAttestedCertProofWitness: ({
    privateState,
  }: WitnessContext<Ledger, VaxZkPrivateState>): [
    VaxZkPrivateState,
    VaxZkProof,
  ] => [privateState, privateState.vaxZkProof],
  getSchnorrReduction: (
    { privateState }: WitnessContext<Ledger, VaxZkPrivateState>,
    challengeHash: bigint,
  ): [VaxZkPrivateState, [bigint, bigint]] => {
    const q = challengeHash / TWO_248;
    const r = challengeHash % TWO_248;
    return [privateState, [q, r]];
  },
  inviteSecret: ({
    privateState,
  }: WitnessContext<Ledger, VaxZkPrivateState>): [
    VaxZkPrivateState,
    Uint8Array,
  ] => [privateState, privateState.inviteSecret],
  inviteNonce: ({
    privateState,
  }: WitnessContext<Ledger, VaxZkPrivateState>): [
    VaxZkPrivateState,
    Uint8Array,
  ] => [privateState, privateState.inviteNonce],
};
