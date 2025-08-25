import { createAPIClient, RequestContext, z } from "../lib/apiclient"

export {
  FetchAPIError,
  ParseAPIError,
  SchemaAPIError,
  ErrorResponseAPIError,
} from "../lib/apiclient"

const API_BASE_URL = "https://localhost:3000/api"

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
  },
})
