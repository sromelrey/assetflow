# Import Standards

Follow these conventions for all imports across the ERP Orchestra project to maintain clean, maintainable, and scalable code.

## No Nested Relative Imports

**Rule**: Avoid using nested relative imports like `'../../../'` in your code.

### Why This Matters
- **Readability**: Deep nested imports make it difficult to understand the file structure
- **Maintainability**: Moving files becomes error-prone when many relative paths need updating
- **Refactoring**: Hard to track dependencies and refactor code safely
- **Scalability**: As the project grows, nested imports become unmanageable

### What to Avoid
```typescript
// ❌ BAD - Nested relative imports
import { UserService } from '../../../services/user.service';
import { UserEntity } from '../../entities/user.entity';
import { CreateUserDto } from '../../../dto/create-user.dto';
```

### What to Use Instead

#### 1. Absolute Imports (Recommended)
Use absolute imports from the project root or configured paths:

```typescript
// ✅ GOOD - Absolute imports
import { UserService } from '@/services/user.service';
import { UserEntity } from '@/entities/user.entity';
import { CreateUserDto } from '@/dto/create-user.dto';
```

#### 2. Shallow Relative Imports
For files in the same or adjacent directories:

```typescript
// ✅ GOOD - Shallow relative imports
import { HelperService } from './helper.service';
import { SharedComponent } from '../shared/shared.component';
```

#### 3. Index Files (Barrel Exports)
Create index files to group related exports:

```typescript
// ✅ GOOD - Using index files
import { UserService, AuthService } from '@/services';
import { UserEntity, ProfileEntity } from '@/entities';
```

## Project-Specific Guidelines

### Backend (NestJS)
```typescript
// ✅ GOOD - Backend absolute imports
import { Controller, Get } from '@nestjs/common';
import { UserService } from '@/user/user.service';
import { UserEntity } from '@/user/entities/user.entity';
```

### Frontend (Next.js)
```typescript
// ✅ GOOD - Frontend absolute imports
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/use-auth';
import { apiClient } from '@/lib/api-client';
```

## Configuration

### ESLint Enforcement
This rule is enforced via ESLint in all projects:
- `@typescript-eslint/no-relative-imports: 'error'`

### TypeScript Path Mapping
Configure paths in `tsconfig.json` for absolute imports:

```json
{
  "compilerOptions": {
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/services/*": ["./src/services/*"],
      "@/entities/*": ["./src/entities/*"]
    }
  }
}
```

## Migration Strategy

When refactoring existing code with nested imports:

1. **Identify** all files using nested relative imports
2. **Configure** TypeScript path mapping if not already done
3. **Replace** nested imports with absolute imports
4. **Test** to ensure all imports resolve correctly
5. **Run** ESLint to verify compliance

## Benefits

- **Cleaner Code**: Easier to read and understand import paths
- **Better IDE Support**: Improved autocomplete and navigation
- **Easier Refactoring**: Move files without breaking imports
- **Consistent Structure**: Enforces good architectural patterns
- **Team Collaboration**: Clear import conventions across the team

## Examples

### Before (Bad)
```typescript
// src/modules/user/user.controller.ts
import { UserService } from '../../../services/user.service';
import { UserEntity } from '../../entities/user.entity';
import { CreateUserDto } from '../../../dto/user/create-user.dto';
```

### After (Good)
```typescript
// src/modules/user/user.controller.ts
import { UserService } from '@/services/user.service';
import { UserEntity } from '@/entities/user.entity';
import { CreateUserDto } from '@/dto/user/create-user.dto';
```
