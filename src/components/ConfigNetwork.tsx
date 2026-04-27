export const networkId = "preprod";
export const urlApp = "https://preprod.vaxzk.com.br";

const STORAGE_KEY = "vaxzk_contract_id";
const DEFAULT_CONTRACT_ID = "228c6562bc105f8554275e7f72fbb9d61de2fe5a93c85e9c8dfbd2d2b7d6103f";

export function getContractId(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_CONTRACT_ID;
}

export function setContractId(id: string): void {
  localStorage.setItem(STORAGE_KEY, id);
}
