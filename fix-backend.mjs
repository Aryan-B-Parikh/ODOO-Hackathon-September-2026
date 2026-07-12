import fs from 'fs';
import path from 'path';

function replaceInFile(filePath, searchRegex, replacement) {
  const fullPath = path.resolve(process.cwd(), filePath);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(fullPath, content);
}

// 1. Fix imports in backend files
const backendFilesToFix = [
  'backend/src/application/use-cases/organization/department.use-cases.ts',
  'backend/src/application/use-cases/organization/employee.use-cases.ts',
  'backend/src/infrastructure/repositories/department.repository.ts',
  'backend/src/presentation/controllers/department.controller.ts',
  'backend/src/presentation/controllers/employee.controller.ts',
  'backend/src/presentation/routes/department.routes.ts',
  'backend/src/presentation/routes/employee.routes.ts'
];

backendFilesToFix.forEach(file => {
  const fullPath = path.resolve(process.cwd(), file);
  let content = fs.readFileSync(fullPath, 'utf8');
  content = content.replace(/from 'shared\/dto\/[^']+'/g, "from 'shared/dto'");
  content = content.replace(/from 'shared\/schemas\/[^']+'/g, "from 'shared/schemas'");
  content = content.replace(/from 'shared\/enums\/[^']+'/g, "from 'shared/enums'");
  fs.writeFileSync(fullPath, content);
});

// 2. Add ConflictError to error-handler.ts
const errHandlerPath = 'backend/src/presentation/middleware/error-handler.ts';
let errContent = fs.readFileSync(errHandlerPath, 'utf8');
if (!errContent.includes('class ConflictError')) {
  errContent = errContent.replace(
    'export class ForbiddenError extends AppError {',
    `export class ConflictError extends AppError {
  constructor(message = 'Conflict') {
    super(message, 409, 'ConflictError');
  }
}

export class ForbiddenError extends AppError {`
  );
  fs.writeFileSync(errHandlerPath, errContent);
}

// 3. Add create method to UserRepository
const userRepoPath = 'backend/src/infrastructure/repositories/user.repository.ts';
let userRepoContent = fs.readFileSync(userRepoPath, 'utf8');
if (!userRepoContent.includes('async create(')) {
  userRepoContent = userRepoContent.replace(
    'async findByEmail',
    `async create(data: any): Promise<UserEntity> {
    const doc = new UserModel(data);
    await doc.save();
    return this.mapToEntity(doc);
  }

  async findByEmail`
  );
  fs.writeFileSync(userRepoPath, userRepoContent);
}

// 4. Fix authRouter / healthRouter in app.ts
const appTsPath = 'backend/src/presentation/app.ts';
let appContent = fs.readFileSync(appTsPath, 'utf8');
appContent = appContent.replace(/import \{ authRoutes \} from '\.\/routes\/auth\.routes\.js';/, "import { authRouter as authRoutes } from './routes/auth.routes.js';");
appContent = appContent.replace(/import \{ healthRoutes \} from '\.\/routes\/health\.js';/, "import { healthRouter as healthRoutes } from './routes/health.js';");
fs.writeFileSync(appTsPath, appContent);

console.log('Backend fixed');
