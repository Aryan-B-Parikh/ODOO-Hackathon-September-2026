import { LoginResponseDto } from 'shared/dto';
import { LoginInput } from 'shared/schemas';

import { JwtService } from '../../../core/security/jwt.service.js';
import { PasswordService } from '../../../core/security/password.service.js';
import { UserRepository } from '../../../infrastructure/repositories/user.repository.js';
import { UnauthorizedError } from '../../../presentation/middleware/error-handler.js';

export class LoginUseCase {
  constructor(
    private userRepository: UserRepository,
    private passwordService: PasswordService,
    private jwtService: JwtService
  ) {}

  async execute(input: LoginInput): Promise<LoginResponseDto> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user || !user.isActive) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const isPasswordValid = await this.passwordService.compare(input.password, user.passwordHash);
    if (!isPasswordValid) {
      throw new UnauthorizedError('Invalid credentials');
    }

    const token = this.jwtService.sign({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    await this.userRepository.updateLastLogin(user.id);

    return {
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        departmentId: user.departmentId,
      },
    };
  }
}
