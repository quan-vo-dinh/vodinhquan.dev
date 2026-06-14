const MISSING_RPC_ERROR_CODE = "PGRST202";

type OwnerRpcName = "is_owner" | "is_site_owner";

type OwnerRpcResult = {
  data: boolean | null;
  error: {
    code?: string;
  } | null;
};

type CallOwnerRpc = (name: OwnerRpcName) => PromiseLike<OwnerRpcResult>;

export async function checkDatabaseOwner(callOwnerRpc: CallOwnerRpc) {
  const siteOwnerResult = await callOwnerRpc("is_site_owner");

  if (!siteOwnerResult.error) {
    return siteOwnerResult.data === true;
  }

  if (siteOwnerResult.error.code !== MISSING_RPC_ERROR_CODE) {
    return false;
  }

  const legacyOwnerResult = await callOwnerRpc("is_owner");

  return !legacyOwnerResult.error && legacyOwnerResult.data === true;
}
