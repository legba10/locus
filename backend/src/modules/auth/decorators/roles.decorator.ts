import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export type AllowedRole = "guest" | "host" | "admin";
export const Roles = (...roles: Array<AllowedRole>) => SetMetadata(ROLES_KEY, roles);

