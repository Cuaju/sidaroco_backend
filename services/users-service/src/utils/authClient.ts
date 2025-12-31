type CreateAccountReq = { email: string; username: string; password: string };
type CreateAccountRes = { accountId: string };
type AdminUserType = "RouteManager" | "FinanceManager" | "Cashier";

export async function authCreateAdminAccount(
  authHeader: string,
  payload: { email: string; username: string; password: string; userType: AdminUserType }
): Promise<{ accountId: string }> {
  const baseUrl = process.env.AUTH_SERVICE_URL;
  if (!baseUrl) throw new Error("AUTH_SERVICE_URL is missing");

  const r = await fetch(`${baseUrl}/api/internal/admin/accounts`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify({
      newEmail: payload.email,
      newUsername: payload.username,
      newPassword: payload.password,
      userType: payload.userType,
    }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || `authCreateAdminAccount failed: ${r.status}`);
  return data;
}

export async function authGetAdminAccounts(authHeader: string): Promise<{
  accounts: { id: string; email: string; username: string; userType: string; isActive: boolean }[];
}> {
  const baseUrl = process.env.AUTH_SERVICE_URL;
  if (!baseUrl) throw new Error("AUTH_SERVICE_URL is missing");

  const r = await fetch(`${baseUrl}/api/internal/admin/accounts`, {
    method: "GET",
    headers: { Authorization: authHeader },
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || `authGetAdminAccounts failed: ${r.status}`);
  return data;
}

export async function authSetAdminActive(
  authHeader: string,
  accountId: string,
  isActive: boolean
) {
  const baseUrl = process.env.AUTH_SERVICE_URL;
  if (!baseUrl) throw new Error("AUTH_SERVICE_URL is missing");

  const r = await fetch(`${baseUrl}/api/internal/admin/accounts/${accountId}/active`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: authHeader },
    body: JSON.stringify({ isActive }),
  });

  const data = await r.json().catch(() => ({}));
  if (!r.ok) throw new Error(data.message || `authSetAdminActive failed: ${r.status}`);
  return data;
}

//this shi is for the microservice orchesstation so yeah
export async function authCreateAccount(payload: CreateAccountReq): Promise<CreateAccountRes> {
  const baseUrl = process.env.AUTH_SERVICE_URL;
  if (!baseUrl) throw new Error("AUTH_SERVICE_URL is missing");

  const r = await fetch(`${baseUrl}/api/internal/newAccount`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      newEmail: payload.email,
      newUsername: payload.username,
      newPassword: payload.password,
    }),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`authCreateAccount failed: ${r.status} ${text}`);
  }

  return (await r.json()) as CreateAccountRes;
}

export async function authPatchAccount(
  accountId: string,
  authHeader: string,
  patch: Partial<{ email: string; username: string; isActive: boolean; userType: string }>
) {
  const baseUrl = process.env.AUTH_SERVICE_URL;
  if (!baseUrl) throw new Error("AUTH_SERVICE_URL is missing");

  const r = await fetch(`${baseUrl}/api/internal/accounts/${accountId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader, 
    },
    body: JSON.stringify(patch),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`authPatchAccount failed: ${r.status} ${text}`);
  }

  return r.json();
}

export async function authCreateAccountHashed(payload: {
  email: string;
  username: string;
  passwordHash: string;
}) {
  const res = await fetch(`${process.env.AUTH_SERVICE_URL}/api/internal/newAccountHashed`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      newEmail: payload.email,
      newUsername: payload.username,
      passwordHash: payload.passwordHash
    })
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "auth create account failed");
  return data; // { accountId }
}

export async function authPatchPassword(
  accountId: string,
  authHeader: string,
  payload: { currentPassword?: string; newPassword: string; adminReset?: boolean }
) {
  const baseUrl = process.env.AUTH_SERVICE_URL;
  if (!baseUrl) throw new Error("AUTH_SERVICE_URL is missing");

  const r = await fetch(`${baseUrl}/api/internal/accounts/${accountId}/password`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: authHeader,
    },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const text = await r.text();
    throw new Error(`authPatchPassword failed: ${r.status} ${text}`);
  }

  return r.json();
}
