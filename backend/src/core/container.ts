import { GetMeUseCase } from '../application/use-cases/auth/get-me.use-case.js';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case.js';
import { UserRepository } from '../infrastructure/repositories/user.repository.js';
import { AuthController } from '../presentation/controllers/auth.controller.js';

import { JwtService } from './security/jwt.service.js';
import { PasswordService } from './security/password.service.js';

class Container {
  // Infrastructure
  public userRepository: UserRepository;

  // Services
  public passwordService: PasswordService;
  public jwtService: JwtService;

  // Use Cases
  public loginUseCase: LoginUseCase;
  public getMeUseCase: GetMeUseCase;

  // Controllers
  public authController: AuthController;

  constructor() {
    // Instantiation (Manual DI)
    this.userRepository = new UserRepository();
    this.passwordService = new PasswordService();
    this.jwtService = new JwtService();

    this.loginUseCase = new LoginUseCase(
      this.userRepository,
      this.passwordService,
      this.jwtService
    );
    this.getMeUseCase = new GetMeUseCase(this.userRepository);

    this.authController = new AuthController(
      this.loginUseCase,
      this.getMeUseCase
    );
  }
}

export const container = new Container();
