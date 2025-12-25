import { prisma } from "../db/prisma";
import bcrypt from "bcrypt";
import { sendVerificationEmail } from "../utils/mailClient";
import { authCreateAccountHashed} from "../utils/authClient";

function gen6Digits() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export async function requestCode(email: string, username: string, password: string) {
  const code = gen6Digits();

  const passwordHash = await bcrypt.hash(password, 10);
  const codeHash = await bcrypt.hash(code, 10);

  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); 

  await prisma.emailVerification.upsert({
    where: { email },
    update: {
      username,
      passwordHash,
      codeHash,
      expiresAt,
      attempts: 0,
      verifiedAt: null,
      accountId: null,
    },
    create: {
      email,
      username,
      passwordHash,
      codeHash,
      expiresAt,
    },
  });

  await sendVerificationEmail(email, code);

  return { ok: true };
}

export async function verifyCodeAndCreateAccount(email: string, code: string) {
  const row = await prisma.emailVerification.findUnique({ where: { email } });
  if (!row){
    throw new Error("no verification request for this email");
  }
  
  if (row.verifiedAt){ 
    return { accountId: row.accountId };
  }

  if (row.attempts >= 5){
    throw new Error("too many attempts");
  }
  
  if (row.expiresAt.getTime() < Date.now()) {
    throw new Error("code expired");
  }
  const ok = await bcrypt.compare(code, row.codeHash);
  if (!ok) {
    await prisma.emailVerification.update({
      where: { email },
      data: { attempts: { increment: 1 } },
    });
    throw new Error("invalid code");
  }

  const created = await authCreateAccountHashed({
    email: row.email,
    username: row.username,
    passwordHash: row.passwordHash,
  });

  await prisma.emailVerification.update({
    where: { email },
    data: {
      verifiedAt: new Date(),
      accountId: created.accountId,
    },
  });

  return { accountId: created.accountId };
}
