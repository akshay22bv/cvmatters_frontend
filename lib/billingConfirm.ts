import { ApiError, confirmCashfreeOrder } from "./api";

/** Cashfree can return before status is PAID; poll until fulfilled or timeout. */
export async function confirmCashfreeWithRetry(orderId: string, attempts = 15, waitMs = 2000) {
  let lastError: unknown;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      return await confirmCashfreeOrder(orderId);
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError && error.status === 202 && attempt < attempts - 1) {
        await new Promise((resolve) => window.setTimeout(resolve, waitMs));
        continue;
      }
      throw error;
    }
  }
  throw lastError instanceof Error ? lastError : new Error("Payment is still processing.");
}
