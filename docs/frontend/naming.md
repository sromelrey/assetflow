# Naming Conventions

Consistency in naming ensures that the codebase remains readable and maintainable.

## Files and Directories
- **Directories**: Use `kebab-case` (e.g., `user-profile`, `data-table`).
- **Components**: Use `PascalCase` and `.tsx` extension (e.g., `Sidebar.tsx`, `Header.tsx`).
- **Hooks**: Use `camelCase`, prefixed with `use` (e.g., `useLogout.ts`).
- **Standard Types/Utils**: Use `camelCase` (e.g., `authApi.ts`, `authSlice.ts`).

## Variables and Functions
- **Variables**: Use `camelCase` (e.g., `userData`, `isAuthenticated`).
- **Functions**: Use `camelCase` (e.g., `handleSubmit`, `fetchData`).
- **Constants**: Use `UPPER_SNAKE_CASE` (e.g., `API_BASE_URL`, `DEFAULT_PAGE_SIZE`).

## Components
- Components should be named after their primary purpose.
- Group related components in a directory matching the component name (e.g., `components/sidebar/Sidebar.tsx`).

## Redux/RTK Query
- **Slices**: Named with `Slice` suffix (e.g., `authSlice`).
- **APIs**: Named with `Api` suffix (e.g., `authApi`).
- **Reducers**: Exported as `default` and named `*Reducer`.
