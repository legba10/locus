import { SetMetadata } from "@nestjs/common";

export const ROLES_KEY = "roles";
export type AllowedRole = "user" | "landlord";
export const Roles = (...roles: Array<AllowedRole>) => SetMetadata(ROLES_KEY, roles);

