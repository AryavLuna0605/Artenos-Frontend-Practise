/**
 * Rust-like result type for handling errors.
 */

export type Ok<T> = { ok: true; value: T }

export type Err<E> = { ok: false; error: E }

export type Result<T, E> = Ok<T> | Err<E>

/**
 * Utility function for creating an Ok result.
 */
export function ok<T>(value: T): Ok<T> {
  return { ok: true, value }
}

/**
 * Utility function for creating an Err result.
 */
export function err<E>(error: E): Err<E> {
  return { ok: false, error }
}

/**
 * Utility function for wrapping a function that may throw an error.
 */
export function wrap<T>(fn: () => T): Result<T, unknown> {
  try {
    return ok(fn())
  } catch (e) {
    return err(e)
  }
}

/**
 * Utility function for wrapping an async function that may throw an error.
 */
export async function wrapAsync<T>(
  fn: () => Promise<T>,
): Promise<Result<T, unknown>> {
  try {
    return ok(await fn())
  } catch (e) {
    return err(e)
  }
}

/**
 * Utility function for unwrapping a result. Throws an error if the result is an Err.
 */
export function unwrap<T>(result: Result<T, unknown>): T {
  if (result.ok) {
    return result.value
  } else {
    throw result.error
  }
}
