import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
export type JwtPayload = {
  sub: string;      // accountId
  userType: string; // enum value
};


export function signAccessToken(payload: JwtPayload): string {
  const secret = process.env.JWT_SECRET as Secret | undefined;
  if (!secret) throw new Error("JWT_SECRET is missing");

  const expiresInEnv = process.env.JWT_EXPIRES_IN ?? "1h";

  const options: SignOptions = {
    expiresIn: expiresInEnv as SignOptions["expiresIn"],
  };

  return jwt.sign(payload, secret, options);
}

