type CreateAccountReq = { email: string; username: string; password: string };
type CreateAccountRes = { accountId: string };


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
