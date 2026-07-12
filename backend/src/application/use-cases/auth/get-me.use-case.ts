import { CurrentUserResponseDto } from 'shared/dto';

import { UserRepository } from '../../../infrastructure/repositories/user.repository.js';
import { NotFoundError } from '../../../presentation/middleware/error-handler.js';

export class GetMeUseCase {
  constructor(private userRepository: UserRepository) {}

  async execute(userId: string): Promise<CurrentUserResponseDto> {
    const user = await this.userRepository.findById(userId);
    if (!user) throw new NotFoundError('User not found');
    
    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      departmentId: user.departmentId,
    };
  }
}
