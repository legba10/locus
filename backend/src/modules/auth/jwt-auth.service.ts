import { Injectable, UnauthorizedException } from "@nestjs/common";

const JWT_SECRET = process.env.JWT_SECRET ?? process.env.SUPABASE_JWT_SECRET ?? "locus-dev-secret-change-in-production";
const ACCESS_EXP = "1h";
const REFRESH_EXP = "30d";

export type JwtPayload = { sub: string; type: "access" | "refresh" };

@Injectable()
export class JwtAuthService {
  private secret: string;
  private accessExp: string;
  private refreshExp: string;

  constructor() {
    this.secret = JWT_SECRET;
    this.accessExp = process.env.JWT_ACCESS_EXP ?? ACCESS_EXP;
    this.refreshExp = process.env.JWT_REFRESH_EXP ?? REFRESH_EXP;
  }

  signAccess(userId: string): string {
    return this.sign({ sub: userId, type: "access" }, this.accessExp);
  }

  signRefresh(userId: string): string {
    return this.sign({ sub: userId, type: "refresh" }, this.refreshExp);
  }

  verify(token: string): JwtPayload {
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      if (!decoded?.sub) throw new Error("Invalid payload");
      return decoded;
    } catch {
      throw new UnauthorizedException("Invalid or expired token");
    }
  }

  /** Returns true if the token is our JWT (valid signature). Does not throw. */
  isOurToken(token: string): boolean {
    if (!token?.trim()) return false;
    try {
      const jwt = require("jsonwebtoken");
      const decoded = jwt.verify(token, this.secret) as JwtPayload;
      return Boolean(decoded?.sub);
    } catch {
      return false;
    }
  }

  private sign(payload: JwtPayload, expiresIn: string): string {
    const jwt = require("jsonwebtoken");
    return jwt.sign(payload, this.secret, { expiresIn });
  }
}
