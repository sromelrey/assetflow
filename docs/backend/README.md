# Backend Development Standards

This directory contains the comprehensive standards and guidelines for backend development in the ERP Orchestra project using NestJS and TypeORM.

## 📚 Standards Documentation

### Core Standards

- **[Naming Standards](./naming.md)** - File, directory, code, and database naming conventions
- **[Naming Standards](./naming.md)** - File, directory, code, and database naming conventions
- **[Import Standards](./import-standards.md)** - Import path rules and best practices
- **[Documentation Standards](./documentation-standards.md)** - Swagger and Compodoc guidelines

### Architecture & Guidelines

- **[Architecture](./architecture.md)** - Backend architecture patterns and principles
- **[Module Creation Guide](./module-creation-guide.md)** - **How to create new resources**
- **[API Guidelines](./api-guidelines.md)** - REST API design and documentation standards
- **[Folder Structure](./folder-structure.md)** - Project organization and directory layout
- **[Testing Standards](./testing.md)** - Unit, integration, and E2E testing guidelines

### Database Standards

- **[Database](./database/)** - Database design, migrations, and schema standards
  - [Entity Mapping](./database/entity-mapping.md)
  - [System ERD](./database/system-erd.md)

## 🚀 Quick Start

1. **Read Naming Standards** - Understand our naming conventions
2. **Review Import Standards** - Learn about absolute imports and avoiding nested paths
3. **Check Architecture** - Understand the overall backend structure
4. **Follow API Guidelines** - Build consistent and maintainable APIs

## 📋 Development Checklist

Before submitting code, ensure you've followed:

- [ ] **Naming Conventions** - Files, classes, methods, and database objects follow standards
- [ ] **Import Rules** - No nested relative imports, use absolute paths
- [ ] **API Standards** - Endpoints follow RESTful principles
- [ ] **Testing** - Appropriate test coverage for new features
- [ ] **Documentation** - Update relevant documentation for changes

## 🔧 Enforcement

### ESLint Rules

Our backend uses ESLint with TypeScript to enforce coding standards:

```javascript
// Key rules enforced:
'@typescript-eslint/no-relative-imports': 'error', // No nested imports
'@typescript-eslint/no-floating-promises': 'warn',
'@typescript-eslint/no-unsafe-argument': 'warn'
```

### Pre-commit Hooks

Husky pre-commit hooks ensure standards are met before code is committed.

## 🎯 Key Principles

### 1. **No Nested Imports**

Avoid relative imports like `'../../../'`. Use absolute imports with path mapping.

```typescript
// ❌ Bad
import { UserService } from "../../../services/user.service";

// ✅ Good
import { UserService } from "@/services/user.service";
```

### 2. **Consistent Naming**

Follow established naming patterns across all code and database objects.

### 3. **Clean Architecture**

Separate concerns with clear boundaries between controllers, services, and repositories.

### 4. **Type Safety**

Leverage TypeScript and TypeORM for strong typing throughout the application.

## 🤝 Contributing

When contributing to backend standards:

1. **Update Documentation** - Keep docs current with any changes
2. **Follow Existing Patterns** - Maintain consistency with established standards
3. **Test Changes** - Ensure new standards don't break existing functionality
4. **Team Communication** - Discuss significant changes with the team

## 📞 Support

For questions about backend standards:

- Review the relevant documentation in this directory
- Check existing code examples in the codebase
- Reach out to the team lead for clarification

---

**Last Updated**: January 2026  
**Version**: 1.0.0  
**Maintained by**: ERP Orchestra Development Team
