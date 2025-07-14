/**
 * Redirects to Stripe Checkout
 */
export const redirectToCheckout = (checkoutUrl: string) => {
  if (typeof window !== "undefined") {
    window.location.href = checkoutUrl;
  }
};

/**
 * Generates success URL for Stripe Checkout
 */
export const generateSuccessUrl = (baseUrl?: string): string => {
  const base = baseUrl || window.location.origin;
  return `${base}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
};

/**
 * Generates cancel URL for Stripe Checkout
 */
export const generateCancelUrl = (
  eventId: string,
  baseUrl?: string
): string => {
  const base = baseUrl || window.location.origin;
  return `${base}/payment-cancel?event_id=${eventId}&payment_cancelled=true`;
};

/**
 * Extracts session ID from URL params
 */
export const extractSessionId = (url: string): string | null => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("session_id");
  } catch {
    return null;
  }
};

/**
 * Checks if payment was cancelled from URL params
 */
export const isPaymentCancelled = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get("payment_cancelled") === "true";
  } catch {
    return false;
  }
};

/**
 * Validates checkout session response
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const validateCheckoutResponse = (response: any): boolean => {
  return (
    response &&
    typeof response === "object" &&
    "checkoutUrl" in response &&
    "sessionId" in response &&
    typeof response.checkoutUrl === "string" &&
    typeof response.sessionId === "string"
  );
};

/**
 * Handles checkout errors and provides user-friendly messages
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const handleCheckoutError = (error: any): string => {
  if (error?.data?.message) {
    return error.data.message;
  }

  if (error?.message) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "Failed to start checkout process. Please try again.";
};

/**
 * Creates checkout session data
 */
export const createCheckoutSessionData = (
  eventId: string,
  registrationId: string,
  eventTitle?: string
) => {
  const successUrl = generateSuccessUrl();
  const cancelUrl = generateCancelUrl(eventId);

  return {
    eventId,
    registrationId,
    successUrl,
    cancelUrl,
    metadata: {
      eventTitle,
      timestamp: new Date().toISOString(),
    },
  };
};

/**
 * Formats payment amount for display
 */
export const formatPaymentAmount = (
  amount: number,
  currency = "PKR"
): string => {
  return `${currency} ${amount.toLocaleString()}`;
};

/**
 * Checks if checkout is supported in current environment
 */
export const isCheckoutSupported = (): boolean => {
  return typeof window !== "undefined" && window.location !== undefined;
};

/**
 * Logs checkout events for debugging
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const logCheckoutEvent = (event: string, data?: any) => {
  if (process.env.NODE_ENV === "development") {
    console.log(`[Checkout] ${event}`, data);
  }
};
