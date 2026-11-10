type CashfreeMode = "sandbox" | "production";

type CashfreeCheckout = {
  checkout: (opts: { paymentSessionId: string; redirectTarget?: string }) => Promise<unknown>;
};

declare global {
  interface Window {
    Cashfree?: (opts: { mode: CashfreeMode }) => CashfreeCheckout;
  }
}

let scriptLoad: Promise<void> | null = null;

function loadCashfreeSdk() {
  if (typeof window === "undefined") return Promise.reject(new Error("Cashfree checkout runs in the browser only."));
  if (window.Cashfree) return Promise.resolve();
  if (scriptLoad) return scriptLoad;
  scriptLoad = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-cashfree-sdk="v3"]');
    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener("error", () => reject(new Error("Could not load Cashfree.")), { once: true });
      return;
    }
    const script = document.createElement("script");
    script.src = "https://sdk.cashfree.com/js/v3/cashfree.js";
    script.async = true;
    script.dataset.cashfreeSdk = "v3";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Cashfree checkout."));
    document.head.appendChild(script);
  });
  return scriptLoad;
}

/** Opens hosted checkout for API version 2023-08-01 (session id from Create Order). */
export async function openCashfreeCheckout(paymentSessionId: string, mode: CashfreeMode) {
  await loadCashfreeSdk();
  if (!window.Cashfree) throw new Error("Cashfree SDK did not initialize.");
  const cashfree = window.Cashfree({ mode });
  await cashfree.checkout({ paymentSessionId, redirectTarget: "_self" });
}
