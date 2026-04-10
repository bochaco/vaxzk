import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import { pureCircuits, type VaxZkProof } from "../../contract/managed/contract/index.js";

const JUBJUB_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 =
  452312848583266388373324160190187140051835877600158453279131187530910662656n;

function randomScalar(): bigint {
  const bytes = globalThis.crypto.getRandomValues(new Uint8Array(32));
  const val = bytes.reduce((acc, b, i) => acc | (BigInt(b) << BigInt(8 * (31 - i))), 0n);
  return val % JUBJUB_ORDER;
}

export function generateKeyPair(): { sk: bigint; pk: JubjubPoint } {
  const sk = randomScalar();
  const pk = ecMulGenerator(sk);
  return { sk, pk };
}

export function getPublicKey(sk: bigint): JubjubPoint {
  return ecMulGenerator(sk);
}

/**
 * Signs vaccine certificate data using the issuer's Schnorr secret key and
 * returns a complete VaxZkProof ready to be stored in private state.
 *
 * The signed message matches what the submitVaccineProof circuit verifies via
 * schnorrVerifyVaxZk: (vaccine, personalId, expirationDate, getShieldedId(ownPublicKey().bytes))
 * All types are native Compact types — no Field-range conversions needed.
 */
export function signVaxZkCertificate(
  issuerSk: bigint,
  issuerId: Uint8Array,
  vaccine: Uint8Array,
  personalId: Uint8Array,
  expirationDate: bigint,
  userCoinPkBytes: Uint8Array,
): VaxZkProof {
  const issuerPk = ecMulGenerator(issuerSk);
  const k = randomScalar();
  const R = ecMulGenerator(k);

  // Mirror the circuit: getShieldedId(ownPublicKey().bytes)
  const userPubKey = pureCircuits.getShieldedId(userCoinPkBytes);

  // schnorrChallengeVaxZk uses transientHash over the VaxZkSchnorrHashInput
  // struct — all native Compact types, no as-Field casting.
  const cFull = pureCircuits.schnorrChallengeVaxZk(
    R, issuerPk, vaccine, personalId, expirationDate, userPubKey,
  );

  // Truncate challenge to 248 bits (mod 2^248) to match schnorrVerifyVaxZk.
  const c = cFull % TWO_248;
  // Response: s = (k + c * sk) mod JUBJUB_ORDER
  const s = (((k + c * issuerSk) % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;

  return {
    issuerId,
    vaccine,
    personalId,
    expirationDate,
    issuerSignature: {
      announcement: R,
      response: s,
    },
  };
}
