import { toHex } from "@midnight-ntwrk/midnight-js-utils";

/**
 * Generates a buffer of random bytes.
 */
export const randomBytes = (length: number): Uint8Array => {
  const bytes = new Uint8Array(length);
  crypto.getRandomValues(bytes);
  return bytes;
};

/**
 * Generates a random hex-encoded 32-byte coin public key that is a valid
 * BLS12-381 scalar field element. The contract casts ownPublicKey().bytes as
 * Field, so the value must be < field modulus (~0x73...×2^248). Zeroing the
 * first byte guarantees the value is < 2^248 < field modulus.
 */
export const randomCoinPublicKeyHex = (): string => {
  const key = randomBytes(32);
  // Compact casts ownPublicKey().bytes as Field using little-endian byte order,
  // so bytes[31] is the most significant byte. Zeroing it keeps the value < 2^248
  // which is safely below the BLS12-381 scalar field modulus (~0x73... × 2^248).
  key[31] = 0;
  return toHex(key);
};

/**
 * Generates a random bigint timestamp (seconds since epoch with some jitter).
 */
export const randomTimestamp = (): bigint => {
  return BigInt(Math.floor(Date.now() / 1000) + Math.floor(Math.random() * 1_000_000));
};

/**
 * Encodes a string to a zero-padded 20-byte Uint8Array — the same encoding
 * used by addVaccine, requestVaccineProof, etc.
 */
export const encodeBytes20 = (value: string): Uint8Array => {
  const out = new Uint8Array(20);
  out.set(new TextEncoder().encode(value).slice(0, 20));
  return out;
};
