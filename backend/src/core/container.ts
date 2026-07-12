import { AllocationUseCases } from '../application/use-cases/allocation/allocation.use-cases.js';
import { AssetUseCases } from '../application/use-cases/asset/asset.use-cases.js';
import { CategoryUseCases } from '../application/use-cases/asset/category.use-cases.js';
import { GetMeUseCase } from '../application/use-cases/auth/get-me.use-case.js';
import { LoginUseCase } from '../application/use-cases/auth/login.use-case.js';
import { MaintenanceUseCases } from '../application/use-cases/maintenance/maintenance.use-cases.js';
import { DepartmentUseCases } from '../application/use-cases/organization/department.use-cases.js';
import { EmployeeUseCases } from '../application/use-cases/organization/employee.use-cases.js';
import { TransferUseCases } from '../application/use-cases/transfer/transfer.use-cases.js';
import { AllocationRepository } from '../infrastructure/repositories/allocation.repository.js';
import { AssetRepository } from '../infrastructure/repositories/asset.repository.js';
import { CategoryRepository } from '../infrastructure/repositories/category.repository.js';
import { DepartmentRepository } from '../infrastructure/repositories/department.repository.js';
import { MaintenanceRepository } from '../infrastructure/repositories/maintenance.repository.js';
import { TransferRepository } from '../infrastructure/repositories/transfer.repository.js';
import { UserRepository } from '../infrastructure/repositories/user.repository.js';
import { AllocationController } from '../presentation/controllers/allocation.controller.js';
import { AssetController } from '../presentation/controllers/asset.controller.js';
import { AuthController } from '../presentation/controllers/auth.controller.js';
import { CategoryController } from '../presentation/controllers/category.controller.js';
import { DepartmentController } from '../presentation/controllers/department.controller.js';
import { EmployeeController } from '../presentation/controllers/employee.controller.js';
import { TransferController } from '../presentation/controllers/transfer.controller.js';
import { MaintenanceController } from '../presentation/controllers/maintenance.controller.js';

import { JwtService } from './security/jwt.service.js';
import { PasswordService } from './security/password.service.js';


class Container {
  // Infrastructure
  public readonly userRepository = new UserRepository();
  public readonly departmentRepository = new DepartmentRepository();
  public readonly categoryRepository = new CategoryRepository();
  public readonly assetRepository = new AssetRepository();
  public readonly allocationRepository = new AllocationRepository();
  public readonly transferRepository = new TransferRepository();
  public readonly maintenanceRepository = new MaintenanceRepository();

  // Core Services
  public readonly passwordService = new PasswordService();
  public readonly jwtService = new JwtService();

  // Use Cases
  public readonly loginUseCase = new LoginUseCase(
    this.userRepository,
    this.passwordService,
    this.jwtService
  );
  public readonly getMeUseCase = new GetMeUseCase(this.userRepository);
  public readonly departmentUseCases = new DepartmentUseCases(this.departmentRepository);
  public readonly employeeUseCases = new EmployeeUseCases(this.userRepository, this.passwordService);
  public readonly categoryUseCases = new CategoryUseCases(this.categoryRepository);
  public readonly assetUseCases = new AssetUseCases(this.assetRepository, this.categoryRepository, this.departmentRepository);
  public readonly allocationUseCases = new AllocationUseCases(this.allocationRepository, this.assetRepository, this.userRepository);
  public readonly transferUseCases = new TransferUseCases(this.transferRepository, this.allocationRepository, this.userRepository);
  public readonly maintenanceUseCases = new MaintenanceUseCases(this.maintenanceRepository, this.assetRepository, this.userRepository);

  // Controllers
  public readonly authController = new AuthController(
    this.loginUseCase,
    this.getMeUseCase
  );
  public readonly departmentController = new DepartmentController(this.departmentUseCases);
  public readonly employeeController = new EmployeeController(this.employeeUseCases);
  public readonly categoryController = new CategoryController(this.categoryUseCases);
  public readonly assetController = new AssetController(this.assetUseCases);
  public readonly allocationController = new AllocationController(this.allocationUseCases);
  public readonly transferController = new TransferController(this.transferUseCases);
  public readonly maintenanceController = new MaintenanceController(this.maintenanceUseCases);
}

export const container = new Container();
