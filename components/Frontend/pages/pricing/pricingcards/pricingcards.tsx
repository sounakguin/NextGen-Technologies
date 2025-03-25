"use client";
import type React from "react";
import { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { BookCallPopup } from "./BookCallPopup";
import { Loader2 } from "lucide-react";

interface TextBlock {
  text: string;
}

interface ParagraphBlock {
  type: "paragraph";
  content: TextBlock[];
}

interface BulletListItem {
  content: { content: TextBlock[] }[];
}

interface BulletListBlock {
  type: "bulletList";
  content: BulletListItem[];
}

interface ParsedContent {
  type: string;
  content?: (ParagraphBlock | BulletListBlock)[];
}

const extractPlainText = (input: string): string => {
  if (!input) return "No details available";
  try {
    const parsed: ParsedContent = JSON.parse(input);
    if (parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content
        .map((block) => {
          if (block.type === "paragraph") {
            return block.content.map((textBlock) => textBlock.text).join(" ");
          } else if (block.type === "bulletList") {
            return block.content
              .map((listItem) => {
                return listItem.content
                  .map((textGroup) =>
                    textGroup.content.map((t) => t.text).join(" ")
                  )
                  .join(" ");
              })
              .join("\n• ");
          }
          return "";
        })
        .join("\n");
    }
  } catch (e) {
    console.error("Error parsing JSON input:", e);
  }
  return input;
};

interface PricingPlan {
  id: number;
  name: string;
  description: string;
  features: string;
  price: number;
  billing_cycle: string;
  tag?: string;
}

interface RazorpayError {
  code: string;
  description: string;
  source: string;
  step: string;
  reason: string;
  metadata: Record<string, unknown>;
}

interface RazorpayResponse {
  error: RazorpayError | null;
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

interface RazorpayInstance {
  open: () => void;
  on: (event: string, callback: (response: RazorpayResponse) => void) => void;
}

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => RazorpayInstance;
  }
}

const PricingCards: React.FC = () => {
  const [pricingPlans, setPricingPlans] = useState<PricingPlan[]>([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState<number | null>(null);

  useEffect(() => {
    const fetchPricingPlans = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("pricing_plans").select("*");
      if (error) {
        console.error("Error fetching pricing plans:", error);
        return;
      }
      setPricingPlans(data as PricingPlan[]);
    };

    fetchPricingPlans();

    // Load Razorpay script
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  const handlePayment = async (plan: PricingPlan) => {
    try {
      setLoadingPayment(plan.id);

      // Convert price to paise (Razorpay requires amount in smallest currency unit)
      const amountInPaise = plan.price * 100;

      // Create order
      const response = await fetch("/api/createorder", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: amountInPaise }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create order");
      }

      const order = await response.json();

      // Initialize Razorpay
      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: "INR",
        name: "Webminis",
        description: `Payment for ${plan.name} Plan`,
        order_id: order.id,
        handler: async (response: RazorpayResponse) => {
          try {
            // Verify payment
            const verifyResponse = await fetch("/api/verifyOrder", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                orderId: response.razorpay_order_id,
                razorpayPaymentId: response.razorpay_payment_id,
                razorpaySignature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyData.isOk) {
              alert(
                `Payment Successful: You have successfully subscribed to the ${plan.name} plan.`
              );
              // Send email with invoice
              await fetch("/api/sendInvoice", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  email: options.prefill.email,
                  planName: plan.name,
                  amount: plan.price,
                }),
              });
            } else {
              alert(
                "Payment Verification Failed: Please try again or contact support."
              );
            }
          } catch (error) {
            console.error("Payment verification error:", error);
            alert(
              "Payment Verification Error: An error occurred during payment verification."
            );
          } finally {
            setLoadingPayment(null);
          }
        },
        prefill: {
          name: "", // You can prefill the name if you have it
          email: "", // Prefill with user's email if available
          contact: "", // Remove or leave empty if you don't want to ask for phone number
        },
        theme: {
          color: "#2FD31D",
        },
        modal: {
          ondismiss: () => {
            setLoadingPayment(null);
          },
        },
      };
      if (typeof window.Razorpay === "undefined") {
        throw new Error("Razorpay SDK failed to load");
      }

      const razorpay = new window.Razorpay(options);
      razorpay.open();

      // Reset loading state when Razorpay modal is opened
      razorpay.on("payment.failed", (response: RazorpayResponse) => {
        alert(
          `Payment Failed: ${response.error?.description || "Unknown error"}`
        );
        setLoadingPayment(null);
      });
    } catch (error) {
      console.error("Payment error:", error);
      alert(
        `Payment Error: ${
          error instanceof Error
            ? error.message
            : "An error occurred while processing your payment."
        }`
      );
      setLoadingPayment(null);
    }
  };

  return (
    <div className="flex justify-center flex-col lg:flex-row gap-4 w-11/12 mx-auto text-white">
      {pricingPlans.map((plan, index) => {
        const plainTextDescription = extractPlainText(plan.description);
        const plainTextFeatures = extractPlainText(plan.features);
        const isLoading = loadingPayment === plan.id;

        return (
          <div
            key={plan.id}
            className="border border-gray-300 bg-[#222222] rounded-lg p-5 w-full lg:w-72 text-center shadow-md"
          >
            <div className="flex justify-between">
              <h2 className="text-2xl font-bold mb-3">{plan.name}</h2>
              {plan.tag && index !== 2 && (
                <span
                  className={`text-center rounded text-sm inline-block mb-2 ${
                    index === 0
                      ? "bg-[#2FD31D] text-black items-center px-3 py-2"
                      : "bg-white text-black items-center px-3 py-2"
                  }`}
                >
                  {plan.tag}
                </span>
              )}
            </div>
            <p className="text-md text-left mb-4">{plainTextDescription}</p>
            <h3 className="text-3xl mb-2 text-[#2FD31D] text-left font-semibold">
              {plan.price}/m
            </h3>
            <p className="text-left text-sm mb-4">{plan.billing_cycle}</p>
            <ul className="list-disc list-inside text-sm mb-6 text-left">
              {plainTextFeatures.split("\n").map((feature, index) => (
                <li key={index}>{feature.replace("• ", "")}</li>
              ))}
            </ul>
            <div className="space-y-4">
              <button
                onClick={() => setShowPopup(true)}
                className="border-[#2FD31D] w-full border text-white rounder-2xl px-5 py-3 font-semibold hover:border hover:bg-[#2FD31D] hover:text-black"
              >
                Book A Call
              </button>
              <button
                onClick={() => handlePayment(plan)}
                disabled={isLoading}
                className="bg-[#2FD31D] w-full rounder-2xl px-5 py-3 font-semibold text-black hover:border hover:border-[#2FD31D] hover:text-white hover:bg-transparent disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  "Click to Buy"
                )}
              </button>
            </div>
          </div>
        );
      })}
      {showPopup && (
        <BookCallPopup
          onClose={() => setShowPopup(false)}
          month_plan={""}
          slug={""}
        />
      )}
    </div>
  );
};

export default PricingCards;
