declare module "@sidaroco/auth" {
  export function generateToken(args: {
    id: string;
    email: string;
    username: string;
    role: string;
  }): string;

  export function verifyToken(token: string): any;
}
