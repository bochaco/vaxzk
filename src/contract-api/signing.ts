import {
  ecMulGenerator,
  type JubjubPoint,
} from "@midnight-ntwrk/compact-runtime";
import { pureCircuits, type VaxZkProof } from "../../contract/managed/contract/index.js";
import * as crypto from "crypto";

type SchnorrSignature = {
  announcement: JubjubPoint;
  response: bigint;
};

const JUBJUB_ORDER =
  6554484396890773809930967563523245729705921265872317281365359162392183254199n;
const TWO_248 =
  452312848583266388373324160190187140051835877600158453279131187530910662656n;

function randomScalar(): bigint {
  const bytes = crypto.randomBytes(32);
  const val = BigInt("0x" + bytes.toString("hex"));
  return val % JUBJUB_ORDER;
}

// Compact's `as Field` cast for Bytes<N> uses little-endian byte order
// (convertBytesToField), so byte[0] is the least significant byte.
function uint8ArrayToBigInt(bytes: Uint8Array): bigint {
  return bytes.reduce((acc, byte, i) => acc + (BigInt(byte) << BigInt(8 * i)), 0n);
}

export function generateKeyPair(): { sk: bigint; pk: JubjubPoint } {
  const sk = randomScalar();
  const pk = ecMulGenerator(sk);
  return { sk, pk };
}

export function getPublicKey(sk: bigint): JubjubPoint {
  return ecMulGenerator(sk);
}

export function sign(sk: bigint, msg: bigint[]): SchnorrSignature {
  const pk = ecMulGenerator(sk);
  const k = randomScalar();
  const R = ecMulGenerator(k);
  // schnorrChallenge returns the full transientHash output.
  // The circuit truncates it to 248 bits (mod 2^248) before using in EC ops.
  const cFull = pureCircuits.schnorrChallenge(R, pk, msg);
  const c = cFull % TWO_248;
  // Compute response: s = (k + c * sk) mod JUBJUB_ORDER
  const s = (((k + c * sk) % JUBJUB_ORDER) + JUBJUB_ORDER) % JUBJUB_ORDER;
  return { announcement: R, response: s };
}

/**
 * Signs vaccine certificate data using the issuer's Schnorr secret key and
 * returns a complete VaxZkProof ready to be stored in private state.
 *
 * The signed message matches what the submitVaccineProof circuit verifies:
 *   [vaccine as Field, personalId as Field, expirationDate as Field, userCoinPkBytes as Field]
 */
export function signVaxZkCertificate(
  issuerSk: bigint,
  issuerId: Uint8Array,
  vaccine: Uint8Array,
  personalId: Uint8Array,
  expirationDate: bigint,
  userCoinPkBytes: Uint8Array,
): VaxZkProof {
  const msg: bigint[] = [
    uint8ArrayToBigInt(vaccine),
    uint8ArrayToBigInt(personalId),
    expirationDate,
    uint8ArrayToBigInt(userCoinPkBytes),
  ];

  const sig = sign(issuerSk, msg);

  return {
    issuerId,
    vaccine,
    personalId,
    expirationDate,
    issuerSignature: {
      announcement: sig.announcement,
      response: sig.response,
    },
  };
}
