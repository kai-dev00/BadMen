import { router, type Href } from "expo-router";

const LOCK_MS = 600;
let lockedUntil = 0;

/** `router.push` that ignores repeated calls fired within a short window (rapid taps). */
export function safePush(href: Href) {
  const now = Date.now();
  if (now < lockedUntil) return;
  lockedUntil = now + LOCK_MS;
  router.push(href);
}
