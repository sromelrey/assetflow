# Folder Structure

The Admin Portal follows a standard Next.js 16 (App Router) structure with organized subdirectories for clarity and scalability.

## Root Directory
- `app/`: Contains the actual application routes, layouts, and pages (App Router).
- `components/`: Shared UI components used across the application.
- `hooks/`: Custom React hooks for shared logic.
- `store/`: Redux Toolkit store configuration, slices, and RTK Query APIs.
- `public/`: Static assets such as images and fonts.
- `proxy.ts`: Custom middleware for route protection and role-based redirects.

## Sub-directory Details

### `app/`
Routes are organized by feature:
- `app/(auth)/login/`: Authentication-related routes.
- `app/dashboard/`: The main application dashboard.
- `layout.tsx`: Root layout for the application.

### `components/`
Grouped by type or feature:
- `components/sidebar/`: Sidebar navigation components.
- `components/AuthInit.tsx`: App initialization component for session rehydration.
- `components/Providers.tsx`: Context and state providers.

### `store/`
- `api/`: RTK Query service definitions (e.g., `authApi.ts`).
- `slices/`: Redux state slices (e.g., `authSlice.ts`).
- `index.ts`: The central store configuration.

### `hooks/`
- `useLogout.ts`: Hook for handling logout logic across the app.
- `useSignInForm.ts`: Hook for managing sign-in form state and submission.
