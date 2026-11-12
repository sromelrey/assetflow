# API Guidelines (RTK Query)

We use **Redux Toolkit Query (RTK Query)** for all data fetching and caching.

## API Definition
All APIs are defined in `store/api/`.

### Configuration
- Base URL should be configured via environment variables (`process.env.NEXT_PUBLIC_API_URL`).
- `fetchBaseQuery` must include `credentials: 'include'` to support session cookies for cross-origin requests.

### Endpoints
- Define endpoints using `builder.query` for fetching data and `builder.mutation` for creating/updating/deleting data.
- Use meaningful names for endpoints (e.g., `getMe`, `logout`).

### Cache Invalidation (Tags)
- Use `tagTypes` to define entities (e.g., `['User']`).
- Use `providesTags` on queries and `invalidatesTags` on mutations to handle automatic cache refreshing.

## Error Handling
- Use the `error` property returned by the hook to display messages.
- Centralize common error handling in the component layer or using middleware if necessary.

## Best Practices
- Avoid using `fetch` or `axios` directly; always prefer RTK Query hooks.
- Prefix hooks correctly: `use[EndpointName][Query/Mutation]`.
