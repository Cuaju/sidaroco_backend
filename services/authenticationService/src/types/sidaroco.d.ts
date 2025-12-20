declare module "@sidaroco/auth" {
  export function generateToken(args: {
    id: string;
    email: string;
    username: string;
    role: string;
  }): string;

  export function verifyToken(token: string): any;
}

declare module "@sidaroco/auth/claimTypes" {
  const ClaimTypes: {
    NameIdentifier: string;
    Name: string;
    GivenName: string;
    Role: string;
  };
  export = ClaimTypes;
}

export {};

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        username: string;
        role: string;
      };
    }
  }
}
