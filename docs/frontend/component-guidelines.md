# Component Guidelines

## Types of Components
- **Server Components (Default)**: Use for static or data-fetching logic that doesn't require interaction.
- **Client Components**: Mark with `'use client'` at the top. Use for interactive elements, hooks, and state.

## Organization
- Small, reusable components go directly into `components/`.
- Large, feature-specific components should be grouped in sub-directories (e.g., `components/sidebar/`).

## Guard Components
- **AuthInit**: Handles the initial session check and populates Redux.
- **Middleware (proxy.ts)**: Handles server-side route protection and role-based redirects. Avoid complex client-side guard wrappers if possible.

## Shared UI
- Use Lucide React for consistent iconography.
- Use Tailwind CSS for styling.
- Follow the design system defined in `index.css`.

## Props
- Always define interfaces for component props.
- Deconstruct props in the component signature.
