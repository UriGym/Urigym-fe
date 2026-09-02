import { loadTossPayments as loadSdk } from "@tosspayments/payment-sdk";
import type { TossPaymentsInstance } from "@tosspayments/payment__types";

/**
 * Falls back to Toss's own publicly documented sandbox client key, so purchases work
 * out of the box in test mode without anyone having a Toss merchant account yet. Swap
 * in a live client key before accepting real payments.
 */
const SANDBOX_CLIENT_KEY = "test_ck_D5GePWvyJnrK0W0k6q8gLzN97Eoq";

let instancePromise: Promise<TossPaymentsInstance> | null = null;

export function getTossClientKey(): string {
  return import.meta.env.VITE_TOSS_CLIENT_KEY || SANDBOX_CLIENT_KEY;
}

export function isTossSandbox(): boolean {
  return getTossClientKey() === SANDBOX_CLIENT_KEY;
}

export function loadTossPayments(): Promise<TossPaymentsInstance> {
  if (!instancePromise) {
    instancePromise = loadSdk(getTossClientKey());
  }
  return instancePromise;
}
