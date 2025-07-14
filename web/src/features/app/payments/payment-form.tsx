// components/payments/PaymentProcessing.tsx
import { useState } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CreditCard, Loader2, AlertCircle, X } from "lucide-react";
import { toast } from "sonner";
import { Event } from "@/types";
import {
  useCancelPaymentIntentMutation,
  useConfirmPaymentMutation,
} from "./api";

// Initialize Stripe
const stripePromise = loadStripe(
  import.meta.env.VITE_REACT_APP_STRIPE_PUBLISHABLE_KEY || "",
  {}
);

interface PaymentFormProps {
  event: Event;
  clientSecret?: string;
  paymentIntentId: string;
  onSuccess: (registrationId: string, ticketId: string) => void;
  onCancel: () => void;
}

const PaymentForm = ({
  event,
  clientSecret,
  paymentIntentId,
  onSuccess,
  onCancel,
}: PaymentFormProps) => {
  const stripe = useStripe();
  const elements = useElements();
  const [confirmPayment] = useConfirmPaymentMutation();
  const [cancelPayment] = useCancelPaymentIntentMutation();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements || !clientSecret) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Confirm payment with Stripe using the new Payment Element
      const { error: stripeError, paymentIntent } = await stripe.confirmPayment(
        {
          elements,
          confirmParams: {
            return_url: `${window.location.origin}/payment-success`,
          },
          redirect: "if_required",
        }
      );

      if (stripeError) {
        setError(stripeError.message || "Payment failed");
        setIsProcessing(false);
        return;
      }

      if (paymentIntent?.status === "succeeded") {
        // Confirm payment with our backend
        const confirmation = await confirmPayment({
          paymentIntentId: paymentIntent.id,
        }).unwrap();

        if (!("error" in confirmation)) {
          if (
            confirmation.status === "COMPLETED" &&
            confirmation.ticketId &&
            confirmation.registrationId
          ) {
            toast.success("Payment successful! Registration confirmed.");
            onSuccess(confirmation.registrationId, confirmation.ticketId);
          } else {
            setError("Payment succeeded but registration failed");
          }
        }
      }
    } catch (error) {
      setError("Payment processing failed");
      console.error("Payment error:", error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = async () => {
    setIsCancelling(true);
    setError(null);

    try {
      if (stripe && paymentIntentId) {
        // Cancel the payment intent directly with Stripe
        const { error } = await stripe.retrievePaymentIntent(clientSecret!);

        if (!error) {
          await cancelPayment({ paymentIntentId });
        }

        toast.info("Payment cancelled");
      }
      onCancel();
    } catch (error) {
      console.error("Cancel error:", error);
      // Even if cancellation fails, we should still close the modal
      onCancel();
    } finally {
      setIsCancelling(false);
    }
  };

  return (
    <div className="relative">
      <Card className="w-md max-w-lg max-h-[90vh] overflow-y-auto custom-scrollbar shadow-2xl border-0">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-gray-800">
              <CreditCard className="w-5 h-5 text-blue-600" />
              Complete Payment
            </CardTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCancel}
              disabled={isProcessing || isCancelling}
              className="h-8 w-8 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          <CardDescription className="text-gray-600">
            <div className="font-medium text-gray-800">{event.title}</div>
            <div className="text-xl font-bold text-green-600 mt-1">
              PKR {event.ticketPrice?.toLocaleString()}
            </div>
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Payment Element - Stripe's pre-built component */}
            <div className="space-y-4">
              <PaymentElement
                options={{
                  layout: "tabs",
                  paymentMethodOrder: ["card"],
                }}
              />
            </div>

            {error && (
              <Alert
                variant="destructive"
                className="animate-in slide-in-from-top-1"
              >
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isProcessing || isCancelling}
                className="flex-1 h-12"
              >
                {isCancelling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Cancelling...
                  </>
                ) : (
                  "Cancel"
                )}
              </Button>
              <Button
                type="submit"
                disabled={!stripe || isProcessing || isCancelling}
                className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : (
                  `Pay PKR ${event.ticketPrice?.toLocaleString()}`
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

interface PaymentProcessingProps {
  event: Event;
  paymentIntentId: string;
  clientSecret?: string;
  onSuccess: (registrationId: string, ticketId: string) => void;
  onCancel: () => void;
}

export const PaymentProcessing = ({
  event,
  paymentIntentId,
  clientSecret,
  onSuccess,
  onCancel,
}: PaymentProcessingProps) => {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-in fade-in-0">
      <Elements
        stripe={stripePromise}
        options={{
          clientSecret: clientSecret ?? undefined,
          appearance: {
            theme: "stripe",
            variables: {
              colorPrimary: "#2563eb",
              colorBackground: "#ffffff",
              colorText: "#1f2937",
              colorDanger: "#dc2626",
              fontFamily: "system-ui, sans-serif",
              spacingUnit: "4px",
              borderRadius: "8px",
            },
          },
        }}
      >
        <PaymentForm
          event={event}
          paymentIntentId={paymentIntentId}
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </div>
  );
};
