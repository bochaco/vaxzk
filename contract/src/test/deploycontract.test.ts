import { describe, it, expect, beforeEach } from "vitest";
import {
  setNetworkId,
  type NetworkId,
} from "@midnight-ntwrk/midnight-js-network-id";
import { pureCircuits } from "../../managed/contract/index.js";
import { VaxZkSimulator, type TestUser } from "./vaxzk-simulator.js";
import {
  randomBytes,
  randomCoinPublicKeyHex,
  encodeBytes20,
} from "./utils.js";

setNetworkId("undeployed" as NetworkId);

// ── Helpers ───────────────────────────────────────────────────────────────────

const randomUser = (): TestUser => ({
  secretKey: randomBytes(32),
  pk: randomCoinPublicKeyHex(),
});

/** Shielded admin ID — mirrors getShieldedId(ownPublicKey().bytes) in the circuit. */
const adminId = (user: TestUser): Uint8Array =>
  pureCircuits.getShieldedId(Buffer.from(user.pk, "hex"));

// ── Deploy contract tests ─────────────────────────────────────────────────────

describe("VaxZk contract – deploy", () => {
  let deployer: TestUser;
  let simulator: VaxZkSimulator;

  beforeEach(() => {
    deployer = randomUser();
    simulator = new VaxZkSimulator(deployer);
  });

  // ── Deployer is registered as first admin ───────────────────────────────────

  describe("initial admin registration", () => {
    it("registers the deployer as the sole admin", () => {
      const ledger = simulator.getLedger();
      expect(ledger.admins.member(adminId(deployer))).toBe(true);
    });

    it("starts with exactly one admin", () => {
      expect(simulator.getLedger().admins.size()).toBe(1n);
    });

    it("does not register a random user as admin", () => {
      const stranger = randomUser();
      expect(
        simulator.getLedger().admins.member(adminId(stranger))
      ).toBe(false);
    });
  });

  // ── Built-in vaccines ───────────────────────────────────────────────────────

  describe("initial vaccine registry", () => {
    it("seeds HepB as a registered vaccine", () => {
      expect(
        simulator.getLedger().vaccines.member(encodeBytes20("HepB"))
      ).toBe(true);
    });

    it("seeds PCV as a registered vaccine", () => {
      expect(
        simulator.getLedger().vaccines.member(encodeBytes20("PCV"))
      ).toBe(true);
    });

    it("seeds Tdap as a registered vaccine", () => {
      expect(
        simulator.getLedger().vaccines.member(encodeBytes20("Tdap"))
      ).toBe(true);
    });

    it("starts with exactly three vaccines", () => {
      expect(simulator.getLedger().vaccines.size()).toBe(3n);
    });

    it("does not contain an unregistered vaccine", () => {
      expect(
        simulator.getLedger().vaccines.member(encodeBytes20("MMR"))
      ).toBe(false);
    });
  });

  // ── Empty collections ───────────────────────────────────────────────────────

  describe("empty initial collections", () => {
    it("starts with no registered clinics", () => {
      expect(simulator.getLedger().clinics.isEmpty()).toBe(true);
    });

    it("starts with no registered certificate issuers", () => {
      expect(simulator.getLedger().issuers.isEmpty()).toBe(true);
    });

    it("starts with no pending vaccine proof requests", () => {
      expect(simulator.getLedger().vaccineProofReqs.isEmpty()).toBe(true);
    });

    it("starts with no submitted vaccine proofs", () => {
      expect(simulator.getLedger().vaccineProofs.isEmpty()).toBe(true);
    });
  });

  // ── Independent deployers ───────────────────────────────────────────────────

  describe("independent deployments", () => {
    it("two deployments have independent admin sets", () => {
      const deployerA = randomUser();
      const deployerB = randomUser();

      const simA = new VaxZkSimulator(deployerA);
      const simB = new VaxZkSimulator(deployerB);

      // Each contract only knows about its own deployer.
      expect(simA.getLedger().admins.member(adminId(deployerA))).toBe(true);
      expect(simA.getLedger().admins.member(adminId(deployerB))).toBe(false);

      expect(simB.getLedger().admins.member(adminId(deployerB))).toBe(true);
      expect(simB.getLedger().admins.member(adminId(deployerA))).toBe(false);
    });
  });
});
