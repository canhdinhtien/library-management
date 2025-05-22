import { Suspense } from "react";
import PaymentSuccess from "./PaymentSuccessClient";

export default function PaymentSuccessWrapper() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          Loading...
        </div>
      }
    >
      <PaymentSuccess />
    </Suspense>
  );
}
