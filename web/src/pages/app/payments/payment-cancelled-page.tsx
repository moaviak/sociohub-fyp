import { useSearchParams, useNavigate } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { XCircle, ArrowLeft, RefreshCw } from "lucide-react";

export const PaymentCancelledPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const eventId = searchParams.get("event_id");
  const paymentCancelled = searchParams.get("payment_cancelled");

  const handleGoBack = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      navigate("/explore#events");
    }
  };

  const handleRetryPayment = () => {
    if (eventId) {
      navigate(`/event/${eventId}`);
    } else {
      navigate("/explore#events");
    }
  };

  if (!paymentCancelled) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-gray-600">
              Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button
              onClick={() => navigate("/explore#events")}
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Events
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <XCircle className="w-8 h-8 text-red-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-red-600">
            Payment Cancelled
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              Your payment was cancelled and no charges were made.
            </p>
            <p className="text-sm text-gray-500">
              Your event registration has not been completed.
            </p>
          </div>

          <div className="space-y-2 pt-4">
            <Button
              onClick={handleRetryPayment}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Try Again
            </Button>

            <Button variant="outline" onClick={handleGoBack} className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Event
            </Button>
          </div>

          <div className="text-center text-xs text-gray-500 pt-2 border-t">
            <p>Need help? Contact support for assistance.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
