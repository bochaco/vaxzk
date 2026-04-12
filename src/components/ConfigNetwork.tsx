export const CONTRACT_STORAGE_KEY = "vaxzk_contract_address";

/** Returns the active contract address: localStorage first, then falls back to empty. */
export function getContractId(): string {
  return localStorage.getItem(CONTRACT_STORAGE_KEY) ?? "";
}

/** Persists a newly deployed contract address so all views pick it up on reload. */
export function saveContractId(address: string): void {
  localStorage.setItem(CONTRACT_STORAGE_KEY, address);
}

/** Clears the stored contract address (useful when re-deploying). */
export function clearContractId(): void {
  localStorage.removeItem(CONTRACT_STORAGE_KEY);
}

/**
 * CONTRACTID is kept for backwards-compatibility with components that import
 * it as a module-level constant. At module load time we read localStorage so
 * the value is fresh after a page reload triggered by the deploy flow.
 */
export const CONTRACTID: string = getContractId();

export const networkId = "preprod";
