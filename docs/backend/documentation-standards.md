# Documentation Standards

This document establishes the standards for documenting the backend codebase (NestJS). We believe in "code as documentation" but require explicit documentation for public APIs (Swagger) and complex internal logic (Compodoc/JSDoc).

## 1. Philosophy

- **Code First**: Clear variable names, small functions, and strong typing are the primary documentation.
- **Why over What**: Comments should explain *why* something is done, not *what* the code is doing (unless it's complex regex or math).
- **API Contracts**: Every public endpoint MUST have a clear contract defined via Swagger decorators.

## 2. Tools

We use two primary tools for documentation:

1.  **Swagger (OpenAPI)**: For external API consumers (Frontend, 3rd parties).
2.  **Compodoc**: For internal static analysis and documentation of modules, services, and classes.

---

## 3. Swagger (OpenAPI) Standards

All Controllers and DTOs must be decorated to generate accurate OpenAPI specifications.

### Controllers

-   **@ApiTags**: Every controller must have an `@ApiTags('ResourceName')` decorator.
-   **@ApiOperation**: Every endpoint method must have an `@ApiOperation` decorator with a `summary` and optionally a `description`.

```typescript
@ApiTags('Tenants') // Grouping
@Controller('tenants')
export class TenantsController {

  @ApiOperation({ 
    summary: 'List all tenants', 
    description: 'Retrieve a paginated list of tenants using cursor-based pagination.' 
  })
  @Get()
  findAll() { ... }
}
```

### Responses

-   **@ApiResponse**: Define at least the success (200/201) and common error (400/404) responses.
-   Use `type` to reference the Return Entity/DTO for schema generation.

```typescript
@ApiResponse({ status: 201, description: 'The tenant has been successfully created.', type: Tenant })
@ApiResponse({ status: 400, description: 'Validation failed.' })
```

### DTOs (Data Transfer Objects)

-   **@ApiProperty**: All properties in a DTO class likely need `@ApiProperty`.
-   **@ApiPropertyOptional**: Use this for optional fields.
-   **Metadata**: Provide `example`, `description`, and `enum` values where applicable.

```typescript
export class CreateTenantDto {
  @ApiProperty({ example: 'Acme Corp', description: 'The display name of the tenant' })
  name: string;

  @ApiPropertyOptional({ example: 'US', description: 'Country code', default: 'US' })
  country?: string;
}
```

---

## 4. Compodoc (JSDoc) Standards

Internal documentation follows JSDoc format `/** ... */`. Compodoc uses these comments to generate static sites.
JSDoc comments must be placed **immediately above** the class, method, or property they describe.

### Classes and Services

-   Provide a top-level description of what the class/service is responsible for.

```typescript
/**
 * Service responsible for managing tenant lifecycles.
 * Handles creation, updates, and soft-deletion of Tenant entities.
 */
@Injectable()
export class TenantsService { ... }
```

### Methods

-   Public methods **SHOULD** have JSDoc comments.
-   **@param**: Document all parameters.
-   **@returns**: Document what the method returns (especially if it returns a Promise or Observable).
-   **@throws**: Document potential exceptions thrown by the method.

```typescript
  /**
   * soft-deletes a tenant by ID.
   * 
   * @param id - The unique identifier of the tenant
   * @returns Void promise
   * @throws {NotFoundException} If the tenant does not exist
   */
  async remove(id: number): Promise<void> { ... }
```

### Properties/Constants

-   Document complex configurations or enumerations.
-   Use `@deprecated` if a property/method is planned for removal.

### Private/Internal Members

-   Documentation is optional for private methods unless they contain complex business logic that justifies explanation.
