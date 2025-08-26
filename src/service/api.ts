import { createAPIClient, RequestContext, z } from "../lib/apiclient"

export {
  FetchAPIError,
  ParseAPIError,
  SchemaAPIError,
  ErrorResponseAPIError,
} from "../lib/apiclient"

const API_BASE_URL = "http://localhost:3001/api"

const AUTH_TOKEN_HEADER_NAME = "X-Auth-Token"

const AUTH_TOKEN_LOCALSTORAGE_KEY = "authToken"

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
  baseResponseSchema: z.object({
    status: z.number(),
    message: z.string(),
  }),
  requestContext,
  fetchOptions: {
    credentials: "include", 
  },
  endpointConfig: {
    health: {
      method: "GET",
      path: "/health",
      pathParamsSchema: z.object({}),
      requestSchema: z.object({}),
      responseSchema: z.object({}),
      errorResponseSchema: z.object({
        status: z.number(),
        message: z.string(),
      }),
    },
    loginUser: {
      method: "POST",
      path: "/user/login",
      pathParamsSchema: z.object({}),
      requestSchema: z.object({
        email: z.string(),
        password: z.string(),
      }),
      responseSchema: z.object({
        status: z.number(),
        message: z.string(),
        name: z.string(),
        email: z.string(),
      }),
      errorResponseSchema: z.object({
        status: z.number(),
        message: z.string(),
      }),
    },
    createProject: {
      method: "POST",
      path: "/project/create",
      pathParamsSchema: z.object({}),
      requestSchema: z.object({
        name: z.string(),
      }),
      responseSchema: z.object({
        status:z.number(),
        message:z.string(),
        name: z.string(),
      }),
      errorResponseSchema: z.object({
        status: z.number(),
        message: z.string(),
      }),
    }

  },
})
