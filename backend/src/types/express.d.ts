export {};

declare global {
  namespace Express {
    interface Request {
      userClaims?: { id: string; email?: string | null };
      staffId?: number;
    }
  }
}
