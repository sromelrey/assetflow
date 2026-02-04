# Backend Naming Standards

Follow these conventions for all backend development using NestJS and TypeORM.

## File and Directory Naming

- **Folders**: 
    - Use `plural-kebab-case` for resource modules (e.g., `modules/system/users`, `modules/system/roles`).
    - Use `singular-kebab-case` for concept/feature modules (e.g., `modules/system/auth`, `modules/shared/database`).
    - **Multi-word Modules**: Always use `kebab-case`. Start with the resource name.
        - **Correct**: `system-modules`, `user-profiles`.
        - **Incorrect**: `system_modules`, `systemModules`.
- **Files**: 
    - Use `singular-kebab-case` with a descriptive suffix. 
    - **Correct**: `user.entity.ts`, `user-role.entity.ts`, `system-module.entity.ts`.
    - **Incorrect**: `users.entity.ts`, `user_role.entity.ts`.

## Code Naming

- **Classes**: Use `PascalCase`. Examples: `MaterialMasterController`, `UserService`.
- **Interfaces**: Use `PascalCase` (optionally prefixed with `I`). Examples: `IUser`, `CreateUserDto`.
- **Functions/Methods**: Use `camelCase`. Examples: `findAll()`, `createMaterial()`.
- **Variables/Constants**: Use `camelCase` for variables and `UPPER_SNAKE_CASE` for global/static constants.

## Database Naming (TypeORM)

- **Table Names**: Use `plural_snake_case`. Examples: `users`, `material_masters`.
- **Column Names**: Use `snake_case`. Examples: `first_name`, `created_at`.
- **Schema**: Use descriptive names for groups of tables. Examples: `system`, `hris`, `operations`.

## Import Standards

- **No Nested Imports**: Avoid relative imports like `'../../../'`
- **Use Absolute Imports**: Prefer absolute imports with path mapping (e.g., `@/services/user.service`)
- **Shallow Relatives Only**: Use `./` or `../` for same-level or adjacent directories
- **Index Files**: Use barrel exports for related modules

_See [import-standards.md](./import-standards.md) for detailed guidelines and examples._
