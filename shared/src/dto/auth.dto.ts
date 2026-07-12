import { Role } from '../enums/role.enum.js';
import { LoginInput } from '../schemas/auth.schema.js';

export type LoginRequestDto = LoginInput;

export interface CurrentUserResponseDto {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  departmentId?: string;
}

export interface LoginResponseDto {
  token: string;
  user: CurrentUserResponseDto;
}
