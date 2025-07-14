import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  XCircle,
  Loader2,
  ArrowLeft,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import {
  useHandlePaymentSuccessMutation,
  useGetPaymentStatusQuery,
} from "@/features/app/payments/api";
import { useNavigate, useSearchParams } from "react-router";

export const PaymentSuccessPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const sessionId = searchParams.get("session_id");
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [handlePaymentSuccess] = useHandlePaymentSuccessMutation();

  const {
    data: paymentStatus,
    isLoading: isLoadingStatus,
    error: statusError,
  } = useGetPaymentStatusQuery(sessionId || "", {
    skip: !sessionId,
  });

  useEffect(() => {
    if (!sessionId) {
      setError("No session ID provided");
      setIsProcessing(false);
      return;
    }

    const processPayment = async () => {
      try {
        setIsProcessing(true);

        // Handle payment success on backend
        const result = await handlePaymentSuccess({ sessionId }).unwrap();

        if (result.status === "COMPLETED") {
          toast.success("Payment successful! Registration confirmed.");
        } else {
          setError("Payment processing failed");
        }
      } catch (err) {
        console.error("Payment processing error:", err);
        setError("Failed to process payment confirmation");
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
  }, [sessionId, handlePaymentSuccess]);

  const handleGoBack = () => {
    navigate("/explore#events");
  };

  const handleViewTicket = () => {
    if (paymentStatus?.ticketId) {
      navigate(`/tickets/${paymentStatus.ticketId}`);
    }
  };

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              Invalid Payment Session
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              No payment session found. Please try again.
            </p>
            <Button onClick={handleGoBack} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isProcessing || isLoadingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-primary-600">
              <Loader2 className="w-6 h-6 animate-spin" />
              Processing Payment...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-primary-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-gray-600">
                  Confirming payment
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-400">
                  Completing registration
                </span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
                <span className="text-sm text-gray-400">Generating ticket</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error || statusError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="w-6 h-6" />
              Payment Error
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-4">
              {error || "Failed to verify payment status"}
            </p>
            <div className="space-y-2">
              <Button onClick={handleGoBack} className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Events
              </Button>
              <Button
                variant="outline"
                onClick={() => window.location.reload()}
                className="w-full"
              >
                Retry
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Success state
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-emerald-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-emerald-600">
            Payment Successful!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Your payment has been processed successfully.
            </p>
            <p className="text-sm text-gray-500">
              Registration ID: {paymentStatus?.registrationId}
            </p>
          </div>

          <div className="flex justify-center">
            <Badge
              variant="secondary"
              className="bg-green-100 text-emerald-800 border-green-200"
            >
              {paymentStatus?.status || "COMPLETED"}
            </Badge>
          </div>

          <div className="space-y-2 pt-4">
            {paymentStatus?.ticketId && (
              <Button
                onClick={handleViewTicket}
                className="w-full bg-primary-600 hover:bg-primary-700"
              >
                <Calendar className="w-4 h-4 mr-2" />
                View Ticket
              </Button>
            )}

            <Button variant="outline" onClick={handleGoBack} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-2">
            Session ID: {sessionId}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
