import { Roles } from "./roles.decorator";

export const RequireLandlord = () => Roles("landlord");
