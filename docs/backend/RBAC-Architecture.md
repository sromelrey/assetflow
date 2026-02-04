# RBAC & Multi-Tenancy Backend Architecture

## 1. System Goals & Design Philosophy

The Orchestrator ERP RBAC (Role-Based Access Control) system is designed with four non-negotiable goals:

### 1.1 Strict Multi-Tenancy Isolation
**Goal:** Ensure that no tenant can ever access, modify, or even view data belonging to another tenant.
**Implementation:** 
- All standard resources (Users, Roles) are inextricably linked to a `tenant_id`.
- Service-layer methods (`findOne`, `findAll`) enforce `tenantId` filters by default.
- Controllers infer context from the authenticated user's session, preventing ID-spoofing attacks (e.g., changing a URL parameter to access another tenant's user).

### 1.2 "Double-Gated" Security
**Goal:** Prevent users from accessing features their organization hasn't paid for, even if they have "Admin" rights.
**Implementation:** Access is granted only if **both** conditions are met:
1.  **Feature Gate:** The Tenant's active `Plan` includes the required system `Module` (e.g., HRIS, Payroll).
2.  **Permission Gate:** The User's assigned `Role` has the specific permission slug (e.g., `hris.employee.create`).
*This is enforced via the `@RequireAccess` decorator and `CombinedAccessGuard`.*

### 1.3 Secure & Controllable Sessions
**Goal:** Provide administrators with real-time visibility and control over user access.
**Implementation:**
- **Stateful Sessions**: We use server-side sessions (Redis/Database backed) rather than stateless JWTs for core access.
- **Instant Revocation**: Admins can revoke specific sessions or "Log Out All Devices" instantly.
- **Active Status Check**: Sessions are validated against the user's current status (Active/Suspended) on every deserialization.

### 1.4 Hierarchical & Composite Permissions
**Goal:** Allow flexible role definitions without code changes.
**Implementation:**
- Permissions are defined as granular slugs (`resource.action`) in the database.
- Roles are collections of these permissions.
- Users can have multiple Roles, and the system aggregates all unique permissions at runtime.

---

## 2. Core Architecture Components

### 2.1 The Guard Layer
We utilize a layered Guard approach in NestJS:
1.  **`AuthenticatedGuard`**: Verifies the session exists and the user is logged in.
2.  **`CombinedAccessGuard`**: The heavy lifter. Reads metadata from `@RequireAccess`, checks the Tenant's Plan features, and then checks the User's permissions.

### 2.2 Entity Relationship Model
- **Tenant** (1) ↔ (M) **User**: A user belongs to exactly one tenant.
- **User** (M) ↔ (M) **Role**: A user can handle multiple responsibilities.
- **Role** (M) ↔ (M) **Permission**: Roles are composed of atomic permissions.
- **Tenant** (1) ↔ (1) **Plan** (M) ↔ (M) **SystemModule**: Defines the "Feature Gate".

### 2.3 Scoped Services
To prevent data leakage, we implemented "Tenant-Aware Services".
- **Bad Practice**: `userRepo.findOne({ id })`
- **Standard Practice**: `userRepo.findOne({ id, tenantId })`
*This pattern is strictly enforced in `UserService` and `RoleService`.*

---

## 3. Developer Guidelines

### Adding Protected Endpoints
When creating a new endpoint that requires specific access:

```typescript
@Get()
@UseGuards(AuthenticatedGuard, CombinedAccessGuard)
@RequireAccess({
  feature: 'INVENTORY',           // 1. Tenant must have INVENTORY module
  permission: 'inventory.item.read' // 2. User must have read permission
})
async getItems(@Req() req: AuthenticatedRequest) {
  // 3. Always filter by tenantId in the service
  return this.itemsService.findAll(req.user.tenantId);
}
```

### Managing System vs. Custom Roles
- **System Roles**: `tenant_id` is `NULL`. These are seeded default roles (e.g., "Super Admin", "Standard User") available to all tenants. They cannot be modified by tenants.
- **Custom Roles**: `tenant_id` is set. These are created by Tenant Admins and are only visible to that specific tenant.
