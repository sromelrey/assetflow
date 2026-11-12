# State Management

We use **Redux Toolkit (RTK)** for global state management.

## Store Configuration
- The store is configured in `store/index.ts`.
- RTK Query middlewares must be added to the store.

## Slices
- Slices handle synchronous state transitions and are stored in `store/slices/`.
- Use `isInitialized` to track if the application has finished its first authentication check.

## Authentication Flow
1. **Login**: `setCredentials` is dispatched with user data.
2. **Rehydration**: `AuthInit` calls `/auth/me` on app load and dispatches `initialize`.
3. **Logout**: `logout` reducer resets the state.

## Selectors
- Export selectors from slice files for easy access to state (e.g., `selectCurrentUser`, `selectIsAuthenticated`).
- Use selectors in components with `useSelector`.

## Best Practices
- Use local React state (`useState`) for UI-only state (e.g., modal visibility, form temporary values).
- Use Redux for data that needs to be shared across many components or persists during navigation.
