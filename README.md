# React Utils

A collection of utilities for React applications focusing on type-safe API calls, error handling, and asynchronous operations.

## Features

- **Result Pattern**: Rust-inspired Result type for elegant error handling
- **Type-Safe API Client**: Built with Zod schema validation for requests and responses
- **React Hooks**: Simplify async operations and API calls in React components
- **Authentication Utilities**: Manage auth tokens with built-in localStorage support

## Installation

Copy and paste the modules you need into your project.

## Core Utilities

### Result Pattern

The `Result` type provides a functional way to handle operations that might fail without using exceptions.

```typescript
import { ok, err, Result, wrap, wrapAsync, unwrap } from "./lib/result"

// Create successful results
const successResult = ok("Success!")

// Create error results
const errorResult = err(new Error("Something went wrong"))

// Handle results
const result: Result<string, Error> = successResult
if (result.ok) {
  console.log(result.value) // "Success!"
} else {
  console.error(result.error)
}

// Wrap functions that might throw
const wrapped = wrap(() => {
  if (Math.random() > 0.5) throw new Error("Bad luck")
  return "Good luck"
})

// Wrap async functions
const asyncResult = await wrapAsync(() => fetchSomeData())
```

### API Client

A type-safe API client with built-in schema validation and sophisticated error handling.

See the [service/api.ts](./src/service/api.ts) file for a complete example of an API client.

#### Schema Validation

Here's a basic example of how to create an API client with base URL and schemas for requests
and responses.

```typescript
import { createAPIClient, z, BodyContentType } from "./lib/apiclient"

// Create your API client
const client = createAPIClient({
  baseUrl: "https://api.example.com",
  baseResponseSchema: z.object({}),
  endpointConfig: {
    getUser: {
      method: "GET",
      path: "/users/{userId}",
      pathParamsSchema: z.object({ userId: z.string() }),
      requestSchema: z.object({}),
      responseSchema: z.object({
        id: z.string(),
        name: z.string(),
        email: z.string().email(),
      }),
      errorResponseSchema: z.object({
        message: z.string(),
      }),
    },
    createPost: {
      method: "POST",
      path: "/posts",
      pathParamsSchema: z.object({}),
      requestSchema: z.object({
        title: z.string(),
        content: z.string(),
      }),
      responseSchema: z.object({
        id: z.string(),
        title: z.string(),
        content: z.string(),
        createdAt: z.string(),
      }),
      errorResponseSchema: z.object({
        message: z.string(),
      }),
      bodyContentType: BodyContentType.json,
    },
  },
})

// Use your API client
const userResult = await client.getUser({ userId: "123" })
if (userResult.ok) {
  console.log(userResult.value.body.name)
} else {
  console.error("Failed to fetch user:", userResult.error)
}
```

#### Request Context

You can also pass a request context which allows manipulating headers accross all requests.

Could be used for authentication, logging, etc.

Here's an example of a localstorage-based authentication implementation using the request context:

```typescript
function initRequestContext() {
  const ctx = new RequestContext()
  const authToken = localStorage.getItem(AUTH_TOKEN_LOCALSTORAGE_KEY)
  if (authToken) {
    ctx.addHeader(AUTH_TOKEN_HEADER_NAME, authToken)
  }
  return ctx
}

const requestContext = initRequestContext()

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_LOCALSTORAGE_KEY, token)
  requestContext.addHeader(AUTH_TOKEN_HEADER_NAME, token)
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_LOCALSTORAGE_KEY)
  requestContext.removeHeader(AUTH_TOKEN_HEADER_NAME)
}

export default createAPIClient({
    baseUrl: API_BASE_URL,
    requestContext,  // Pass the request context here
    ...
})
```

#### Error Handling

The API client provides specialized error types:

- `FetchAPIError`: Network request failed
- `ParseAPIError`: Failed to parse response as JSON
- `SchemaAPIError`: Response doesn't match expected schema
- `ErrorResponseAPIError`: API returned an error response

### React Hooks

#### useAsyncResult

Manage loading states and results for any asynchronous operation.

```typescript
import { useAsyncResult } from './hooks/asyncresult';

function MyComponent() {
  const { call, loading, result, abort } = useAsyncResult();

  const handleClick = async () => {
    const res = await call(async (signal) => {
      // Any async operation that returns a Result
      return await wrapAsync(() => fetchData(signal));
    });

    if (res.ok) {
      console.log("Success:", res.value);
    } else {
      console.error("Error:", res.error);
    }
  };

  return (
    <div>
      <button onClick={handleClick} disabled={loading}>
        {loading ? "Loading..." : "Fetch Data"}
      </button>
      {result?.ok && <div>Data: {JSON.stringify(result.value)}</div>}
      {result && !result.ok && <div>Error: {result.error.message}</div>}
      <button onClick={abort} disabled={!loading}>Cancel</button>
    </div>
  );
}
```

#### useAPICall

Wrapper around `useAsyncResult` specifically designed for API calls.

```typescript
import { useAPICall, useAPICallOnMount } from './hooks/apicall';
import api from './service/api';

function UserProfile({ userId }) {
  const { call, loading, result } = useAPICall(api.getUser);

  // Fetch on button click
  const handleFetch = () => {
    call({ userId });
  };

  return (
    <div>
      <button onClick={handleFetch}>Refresh Profile</button>
      {loading && <div>Loading...</div>}
      {result?.ok && <div>Name: {result.value.body.name}</div>}
    </div>
  );
}

function AutoLoadingUserProfile({ userId }) {
  // Automatically fetch when component mounts
  const { result } = useAPICallOnMount(api.getUser, { userId });

  return (
    <div>
      {!result && <div>Loading...</div>}
      {result?.ok && <div>Name: {result.value.body.name}</div>}
    </div>
  );
}
```
