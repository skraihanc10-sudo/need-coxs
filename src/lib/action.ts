import { unstable_rethrow } from "next/navigation"
import { AppError, errorText } from "./errors"
import { getLocale } from "./auth"

export type ActionState = { ok?: boolean; error?: string; message?: string; at?: number }

/**
 * Wrap a server action body for `useActionState`. Known errors come back as a
 * message in the page's language; redirects and notFound still work.
 */
export async function run(fn: () => Promise<string | void>): Promise<ActionState> {
  try {
    const message = await fn()
    return { ok: true, message: message ?? undefined, at: Date.now() }
  } catch (error) {
    unstable_rethrow(error)
    if (!(error instanceof AppError)) console.error(error)
    return { ok: false, error: errorText(error, await getLocale()), at: Date.now() }
  }
}
