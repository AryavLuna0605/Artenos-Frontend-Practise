import { useState, useRef, useEffect } from "react"

import { Result, ok, err, wrap, wrapAsync, unwrap } from "../lib/result"

export { type Result, ok, err, wrap, wrapAsync, unwrap }

type AsyncResultHookReturn<R extends Result<unknown, unknown>> = {
  call: (fn: (abortSignal?: AbortSignal) => Promise<R>) => Promise<R>
  abort: () => void
  loading: boolean
  result: R | undefined
}

/**
 * A hook that manages result and loading states and cancellation for
 * arbitrary async operations.
 *
 * The `call` function takes a function that returns a promise. The promise
 * should resolve to a `Result<T, E>`. The `call` function will set the
 * `loading` state to `true` and then call the function, set the `result`
 * state to the resolved `Result<T, E>` and then set `loading` state to `false`.
 * The result is also returned from the `call` function.
 * The function can optionally take an `AbortSignal` as an argument, which can
 * be used to abort the async operation.
 *
 * The `abort` function will abort the async operation if it is still running.
 *
 * The `abort` function is called automatically when the component is unmounted.
 */

export function useAsyncResult<
  R extends Result<any, any>,
>(): AsyncResultHookReturn<R> {
  const [getResult, setResult] = useRefState<R | undefined>(undefined)
  const [getLoading, setLoading] = useRefState(false)
  const abortControllerRef = useRef<AbortController | null>(null)

  function abort(reason?: string) {
    abortControllerRef.current?.abort(reason)
  }

  async function call(
    fn: (abortSignal?: AbortSignal) => Promise<R>,
  ): Promise<R> {
    if (getLoading()) {
      abort("new request started")
      // HACK:
      // wait one tick for the abort error to be thrown,
      // so loading and result states are set correctly
      await new Promise((resolve) => setTimeout(resolve))
      if (getLoading()) {
        throw new Error("abort still not completed after one tick")
      }
    }
    abortControllerRef.current = new AbortController()
    setResult(undefined)
    setLoading(true)
    try {
      const result = await fn(abortControllerRef.current.signal)
      setResult(result)
      return result
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    return () => {
      abort("component unmounted")
    }
  }, [])

  return {
    call,
    abort,
    loading: getLoading(),
    result: getResult(),
  }
}

/**
 * Like useState, but the state accessed via a getter to avoid stale state
 * in closures.
 */
function useRefState<T>(initialValue: T) {
  const ref = useRef(initialValue)
  // keep a state variable so we can trigger a re-render
  const [, setState] = useState(0)
  function getRefState() {
    return ref.current
  }
  function setRefState(value: T) {
    ref.current = value
    // trigger a re-render
    setState((s) => s + 1)
  }
  return [getRefState, setRefState] as const
}
