import { z } from "zod"
import { type Result, ok, err } from "./result"

const Method = {
  GET: "GET",
  POST: "POST",
  PATCH: "PATCH",
  PUT: "PUT",
  DELETE: "DELETE",
} as const
type Method = (typeof Method)[keyof typeof Method]

type APIResponse<B> = {
  status: number
  body: B
}

/**
 * Base class for all custom errors thrown by the API client.
 */
abstract class APIClientError extends Error {
  readonly apiClientError = true
  abstract readonly apiClientErrorType: string
  constructor(message: string) {
    super(message)
  }
}

class FetchAPIError extends APIClientError {
  apiClientErrorType = "FetchAPIError" as const
  constructor(message: string, public readonly fetchError: Error) {
    super(message)
  }
}

class ErrorResponseAPIError<B> extends APIClientError {
  apiClientErrorType = "ErrorResponseAPIError" as const
  constructor(
    message: string,
    public readonly status: number,
    public readonly body: B,
  ) {
    super(message)
  }
}

class ParseAPIError extends APIClientError {
  apiClientErrorType = "ParseAPIError" as const
  constructor(
    message: string,
    public readonly parseError: Error,
    public readonly bodyText?: string,
  ) {
    super(message)
  }
}

class SchemaAPIError extends APIClientError {
  apiClientErrorType = "SchemaAPIError" as const
  constructor(
    message: string,
    public readonly schemaErrors: z.ZodIssue[],
    public readonly bodyJSON?: unknown,
  ) {
    super(message)
  }
}

class RequestDataError extends APIClientError {
  apiClientErrorType = "RequestDataError" as const
  constructor(message: string) {
    super(message)
  }
}

type APIError<B> =
  | FetchAPIError
  | ParseAPIError
  | SchemaAPIError
  | ErrorResponseAPIError<B>
  | RequestDataError

class RequestContext {
  private readonly headers: Record<string, string> = {}

  addHeader(name: string, value: string): void {
    this.headers[name] = value
  }

  removeHeader(name: string): void {
    delete this.headers[name]
  }

  getHeaders(): Record<string, string> {
    return { ...this.headers }
  }
}

async function makeApiCall<TParams, TResp, TErrResp, TBaseResp>(
  method: Method,
  baseUrl: string,
  path: string,
  params: TParams,
  bodyContentType: BodyContentType,
  baseResponseSchema: z.ZodSchema<TBaseResp>,
  responseSchema: z.ZodSchema<TResp>,
  errorResponseSchema: z.ZodSchema<TErrResp>,
  requestContext: RequestContext,
  abortSignal?: AbortSignal,
  fetchOptions?: RequestInit,   
): Promise<
  Result<APIResponse<TResp & TBaseResp>, APIError<TErrResp & TBaseResp>>
> {
  path = path.replace(
    /\{([^}]+)\}/g,
    (_, paramName) => (params as any)[paramName] || "",
  )

  let body: string | FormData
  if (bodyContentType === BodyContentType.json) {
    body = JSON.stringify(params)
  } else if (bodyContentType === BodyContentType.multipart) {
    body = new FormData()
    for (const key in params) {
      if (
        params[key] instanceof Blob === false &&
        typeof params[key] !== "string"
      ) {
        return err(
          new RequestDataError(
            `Invalid multipart body data type for param ${key}. Only string and Blob are allowed.`,
          ),
        )
      }
      body.append(key, params[key] as string | Blob)
    }
  } else {
    return err(new RequestDataError(`Invalid body content type ${bodyContentType}`))
  }

  let response: Response
  try {
    let headers = {
      ...requestContext.getHeaders(),
    }
    if (bodyContentType === BodyContentType.json) {
      headers["Content-Type"] = "application/json"
    }

    response = await fetch(`${baseUrl}${path}`, {
      method,
      headers,
      body: method !== Method.GET ? body : undefined,
      signal: abortSignal,
      ...fetchOptions,
    })
  } catch (e) {
    const error = e as Error
    return err(new FetchAPIError(`Error making API call: ${error.message}`, error))
  }

  let bodyText: string
  try {
    bodyText = await response.text()
  } catch (e) {
    const error = e as Error
    return err(
      new ParseAPIError(
        `Error reading response body, failed while parsing as text: ${error.message}`,
        error,
      ),
    )
  }

  let bodyJSON: unknown
  try {
    bodyJSON = JSON.parse(bodyText)
  } catch (e) {
    const error = e as Error
    return err(
      new ParseAPIError(
        `Error parsing response body as JSON: ${error.message}`,
        error,
        bodyText,
      ),
    )
  }

  if (!response.ok) {
    let parsedError: TErrResp & TBaseResp
    try {
      parsedError = errorResponseSchema.and(baseResponseSchema).parse(bodyJSON)
    } catch (e) {
      const error = e as Error
      if (error instanceof z.ZodError) {
        return err(
          new SchemaAPIError(
            `Error validating error response body schema: ${error.message}`,
            error.issues,
            bodyJSON,
          ),
        )
      }
      throw error
    }
    return err(new ErrorResponseAPIError(response.statusText, response.status, parsedError))
  }

  let parsedBody: TResp & TBaseResp
  try {
    parsedBody = responseSchema.and(baseResponseSchema).parse(bodyJSON)
  } catch (e) {
    const error = e as Error
    if (error instanceof z.ZodError) {
      return err(
        new SchemaAPIError(
          `Error validating response body schema: ${error.message}`,
          error.issues,
          bodyJSON,
        ),
      )
    }
    throw error
  }

  return ok({ status: response.status, body: parsedBody })
}

type GenericEndpointConfig = {
  [endpt: string]: {
    method: Method
    path: string
    pathParamsSchema: z.AnyZodObject
    requestSchema: z.AnyZodObject | z.ZodEffects<z.AnyZodObject>
    responseSchema: z.AnyZodObject
    errorResponseSchema: z.AnyZodObject
    bodyContentType?: BodyContentType
  }
}

type EndpointPathParams<
  C extends GenericEndpointConfig,
  Endpt extends keyof C,
> = z.infer<C[Endpt]["pathParamsSchema"]>

type EndpointReqParams<
  C extends GenericEndpointConfig,
  Endpt extends keyof C,
> = z.infer<C[Endpt]["requestSchema"]>

type EndpointResponse<
  C extends GenericEndpointConfig,
  Endpt extends keyof C,
> = z.infer<C[Endpt]["responseSchema"]>

type EndpointErrorResponse<
  C extends GenericEndpointConfig,
  Endpt extends keyof C,
> = z.infer<C[Endpt]["errorResponseSchema"]>

type APIClientInstance<C extends GenericEndpointConfig, B> = {
  [Endpt in keyof C]: (
    params: EndpointReqParams<C, Endpt> & EndpointPathParams<C, Endpt>,
    opts?: { abortSignal?: AbortSignal },
  ) => Promise<
    Result<
      APIResponse<EndpointResponse<C, Endpt> & B>,
      APIError<EndpointErrorResponse<C, Endpt> & B>
    >
  >
}

export enum BodyContentType {
  "json",
  "multipart",
}

export const BlobSchema = z.custom<Blob>((value) => value instanceof Blob, {
  message: "Expected Blob",
})

function createAPIClient<C extends GenericEndpointConfig, B>(opts: {
  baseUrl: string
  baseResponseSchema: z.ZodSchema<B>
  endpointConfig: C
  requestContext?: RequestContext
  fetchOptions?: RequestInit 
}): APIClientInstance<C, B> {
  const {
    baseUrl,
    baseResponseSchema,
    endpointConfig,
    requestContext = new RequestContext(),
    fetchOptions, 
  } = opts

  return Object.fromEntries(
    Object.entries(endpointConfig).map(([endpt, config]) => {
      return [
        endpt,
        async (
          params: z.infer<(typeof config)["requestSchema"]> &
            z.infer<(typeof config)["pathParamsSchema"]>,
          opts: { abortSignal?: AbortSignal } = {},
        ) => {
          const bodyContentType = config.bodyContentType || BodyContentType.json
          return await makeApiCall(
            config.method,
            baseUrl,
            config.path,
            params,
            bodyContentType,
            baseResponseSchema,
            config.responseSchema,
            config.errorResponseSchema,
            requestContext,
            opts.abortSignal,
            fetchOptions,
          )
        },
      ]
    }),
  ) as APIClientInstance<C, B>
}

export {
  createAPIClient,
  FetchAPIError,
  ParseAPIError,
  SchemaAPIError,
  ErrorResponseAPIError,
  RequestContext,
  type EndpointReqParams,
  type EndpointResponse,
  type EndpointErrorResponse,
  type APIResponse,
  type APIError,
  type GenericEndpointConfig,
  type APIClientInstance,
  z,
}
