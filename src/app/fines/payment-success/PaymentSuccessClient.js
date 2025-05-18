"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  CheckCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
} from "@heroicons/react/solid";
import Navbar from "@/components/Navbar";

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [updatedBookStatus, setUpdatedBookStatus] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPaymentStatus = async () => {
      try {
        const response = await fetch(
          `/api/fines/payment-success?${searchParams.toString()}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${localStorage.getItem("authToken")}`,
            },
          }
        );
        const result = await response.json();

        if (result.success) {
          setPaymentStatus(result.paymentStatus);
        } else {
          setPaymentStatus("error");
        }
      } catch (error) {
        console.error("Error fetching payment status:", error);
        setPaymentStatus("error");
      } finally {
        setLoading(false);
      }
    };

    const fetchUpdatedBookStatus = async (borrowId) => {
      try {
        const response = await fetch(`/api/fines/update-status`, {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("authToken")}`,
          },
          body: JSON.stringify({ borrowId }),
        });
        const result = await response.json();

        if (result.success) {
          setUpdatedBookStatus(result.updatedBookStatus);
        } else {
          setUpdatedBookStatus("error");
        }
      } catch (error) {
        console.error("Error updating book status:", error);
        setUpdatedBookStatus("error");
      }
    };

    const borrowId = localStorage.getItem("borrowId");
    fetchUpdatedBookStatus(borrowId);
    fetchPaymentStatus();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 overflow-hidden">
        <div className="text-lg font-medium text-gray-600">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-200 overflow-hidden">
      <Navbar />
      <div className="min-h-screen flex flex-col items-center justify-center">
        <div className="bg-white shadow-lg rounded-lg p-8 max-w-md text-center">
          {paymentStatus === "success" ? (
            <>
              <CheckCircleIcon className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-green-600 mb-2">
                Payment Successful!
              </h1>
              <p className="text-gray-600">
                Thank you for your payment. Your transaction has been completed
                successfully.
              </p>
            </>
          ) : paymentStatus === "failed" ? (
            <>
              <XCircleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-red-600 mb-2">
                Payment Failed
              </h1>
              <p className="text-gray-600">
                Unfortunately, your payment could not be processed. Please try
                again.
              </p>
            </>
          ) : (
            <>
              <ExclamationCircleIcon className="h-16 w-16 text-orange-500 mx-auto mb-4" />
              <h1 className="text-2xl font-bold text-orange-600 mb-2">
                Error Occurred
              </h1>
              <p className="text-gray-600">
                An error occurred while processing your payment. Please contact
                support.
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
