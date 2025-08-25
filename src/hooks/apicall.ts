import { useEffect } from "react"
import { useAsyncResult } from "./asyncresult"

type Method = (
  params: any,
  opts?: { abortSignal?: AbortSignal },
) => Promise<any>

/**
 * Convenience wrapper around `useAsyncResult` for making API calls.
 *
 * The returned `result` state and `call` function mirror the method
 * signature of the API method.
 */
function useAPICall<M extends Method>(method: M) {
  const {
    result,
    loading,
    call: _call,
    abort,
  } = useAsyncResult<Awaited<ReturnType<M>>>()

  async function call(
    params: Parameters<M>[0],
  ): Promise<Awaited<ReturnType<M>>> {
    return await _call(async (abortSignal) => {
      return await method(params, { abortSignal })
    })
  }

  return { loading, result, call, abort }
}

/**
 * Convenience wrapper around `useAPICall` for making API calls automatically
 * when the component is mounted.
 *
 * ```ts
 * const result = useAPICallOnMount(method, params)
 * ```
 *
 * is equivalent to:
 *
 * ```ts
 * const { result, call } = useAPICall(method)
 *
 * useEffect(() => {
 *  call(params)
 * }, [])
 * ```
 *
 */
function useAPICallOnMount<M extends Method>(
  method: M,
  params: Parameters<M>[0],
) {
  const { result, call } = useAPICall(method)

  useEffect(() => {
    call(params)
  }, [])

  return result
}

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

type AnyFunc = (...args: any[]) => any

type MockOpts = {
  delayMs?: number
}

/**
 * Mock an async function.
 *
 * Returns a function with the same signature as the original function,
 * but it calls the mock function instead of the original.
 *
 * Additionally, it can simulate a delay by setting the `delayMs` option.
 *
 * @param _fn The original function to mock.
 * @param mockFn The mock function.
 * @param opts Options for the mock.
 * @returns A function that calls the mock function.
 */
function mock<F extends AnyFunc>(_fn: F, mockFn: F, opts?: MockOpts): F {
  return (async (...args: any[]) => {
    await sleep(opts?.delayMs || 0)
    return await mockFn(...args)
  }) as F
}

export { useAPICall, useAPICallOnMount, mock }

export { ok, err, type Result } from "./asyncresult"
