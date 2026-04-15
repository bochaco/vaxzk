import { describe, it, expect } from 'vitest';
import { VaxZkSimulator } from "./vaxzk-simulator.js";

describe('Invite Contract', () => {
  let simulator: VaxZkSimulator;

    // Mock nonce (32 bytes) returned by the witness
  const mockNonce = new Uint8Array(32).fill(42);
  const mockSecret = new Uint8Array(32).fill(7);
  const differentSecret = new Uint8Array(32).fill(99);

  // Mock witnesses
  const mockWitnesses = {
    inviteNonce: () => mockNonce,
  };

  it('registerInvite stores and returns the commitment hash', () => {
    const contract = new Contract(mockWitnesses);
    const ctx = createTestContext(); // use your test context helper

    const result = contract.circuits.registerInvite(ctx, mockSecret);

    // The circuit returns a Bytes<32> (Uint8Array)
    expect(result.result).toBeInstanceOf(Uint8Array);
    expect(result.result).toHaveLength(32);

    // The ledger state should be updated with the hash
    expect(result.context.currentLedgerState.inviteAdminHash).toEqual(result.result);
  });

  it('isValidInvite returns true for the correct secret', () => {
    const contract = new Contract(mockWitnesses);
    const ctx = createTestContext();

    // First, register the invite
    const registerResult = contract.circuits.registerInvite(ctx, mockSecret);

    // Use the updated context (with ledger state) for the next call
    const updatedCtx = registerResult.context;

    const validResult = contract.circuits.isValidInvite(updatedCtx, mockSecret);

    expect(validResult.result).toBe(true);
  });

  it('isValidInvite returns false for a different secret', () => {
    const contract = new Contract(mockWitnesses);
    const ctx = createTestContext();

    // Register with mockSecret
    const registerResult = contract.circuits.registerInvite(ctx, mockSecret);
    const updatedCtx = registerResult.context;

    // Validate with a different secret
    const invalidResult = contract.circuits.isValidInvite(updatedCtx, differentSecret);

    expect(invalidResult.result).toBe(false);
  });

  it('registerInvite produces a deterministic hash for the same inputs', () => {
    const contract1 = new Contract(mockWitnesses);
    const contract2 = new Contract(mockWitnesses);
    const ctx1 = createTestContext();
    const ctx2 = createTestContext();

    const result1 = contract1.circuits.registerInvite(ctx1, mockSecret);
    const result2 = contract2.circuits.registerInvite(ctx2, mockSecret);

    expect(result1.result).toEqual(result2.result);
  });

  it('registerInvite produces different hashes for different secrets', () => {
    const contract = new Contract(mockWitnesses);
    const ctx1 = createTestContext();
    const ctx2 = createTestContext();

    const result1 = contract.circuits.registerInvite(ctx1, mockSecret);
    const result2 = contract.circuits.registerInvite(ctx2, differentSecret);

    expect(result1.result).not.toEqual(result2.result);
  });
});