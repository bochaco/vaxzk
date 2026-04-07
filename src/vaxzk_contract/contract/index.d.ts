import type * as __compactRuntime from '@midnight-ntwrk/compact-runtime';

export type Witnesses<PS> = {
  localSk(context: __compactRuntime.WitnessContext<Ledger, PS>): [PS, Uint8Array];
}

export type ImpureCircuits<PS> = {
  addAdmin(context: __compactRuntime.CircuitContext<PS>, _adminSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAdmin(context: __compactRuntime.CircuitContext<PS>,
              _adminSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  adminOnlyAction(context: __compactRuntime.CircuitContext<PS>,
                  someParam_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  addClinic(context: __compactRuntime.CircuitContext<PS>,
            _clinicSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeClinic(context: __compactRuntime.CircuitContext<PS>,
               _clinicSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type ProvableCircuits<PS> = {
  addAdmin(context: __compactRuntime.CircuitContext<PS>, _adminSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAdmin(context: __compactRuntime.CircuitContext<PS>,
              _adminSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  adminOnlyAction(context: __compactRuntime.CircuitContext<PS>,
                  someParam_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  addClinic(context: __compactRuntime.CircuitContext<PS>,
            _clinicSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeClinic(context: __compactRuntime.CircuitContext<PS>,
               _clinicSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type PureCircuits = {
  publicKey(_sk_0: Uint8Array): Uint8Array;
}

export type Circuits<PS> = {
  publicKey(context: __compactRuntime.CircuitContext<PS>, _sk_0: Uint8Array): __compactRuntime.CircuitResults<PS, Uint8Array>;
  addAdmin(context: __compactRuntime.CircuitContext<PS>, _adminSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeAdmin(context: __compactRuntime.CircuitContext<PS>,
              _adminSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  adminOnlyAction(context: __compactRuntime.CircuitContext<PS>,
                  someParam_0: bigint): __compactRuntime.CircuitResults<PS, []>;
  addClinic(context: __compactRuntime.CircuitContext<PS>,
            _clinicSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
  revokeClinic(context: __compactRuntime.CircuitContext<PS>,
               _clinicSk_0: Uint8Array): __compactRuntime.CircuitResults<PS, []>;
}

export type Ledger = {
  admins: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
  clinics: {
    isEmpty(): boolean;
    size(): bigint;
    member(elem_0: Uint8Array): boolean;
    [Symbol.iterator](): Iterator<Uint8Array>
  };
}

export type ContractReferenceLocations = any;

export declare const contractReferenceLocations : ContractReferenceLocations;

export declare class Contract<PS = any, W extends Witnesses<PS> = Witnesses<PS>> {
  witnesses: W;
  circuits: Circuits<PS>;
  impureCircuits: ImpureCircuits<PS>;
  provableCircuits: ProvableCircuits<PS>;
  constructor(witnesses: W);
  initialState(context: __compactRuntime.ConstructorContext<PS>): __compactRuntime.ConstructorResult<PS>;
}

export declare function ledger(state: __compactRuntime.StateValue | __compactRuntime.ChargedState): Ledger;
export declare const pureCircuits: PureCircuits;
