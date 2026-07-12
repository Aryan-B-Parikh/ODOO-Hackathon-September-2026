import { Role } from '../enums/role.enum.js';

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}
