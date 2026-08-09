import { createContext, useContext } from "react";

export const AuthCharacterContext = createContext(null);

/**
 * Lets any form under AuthLayout trigger the mascot's reaction —
 * call reactCorrect()/reactWrong() only once you already know the
 * real outcome of a submit (success / server error / invalid fields).
 * Never call these from onChange — that's what made it feel twitchy before.
 */
export function useAuthCharacter() {
  const ctx = useContext(AuthCharacterContext);
  // Safe no-op fallback so a form never crashes if rendered outside AuthLayout
  // (e.g. in isolation during testing/storybook).
  return ctx || { reactCorrect: () => {}, reactWrong: () => {} };
}
