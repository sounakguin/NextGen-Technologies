"use client";

import { useState } from "react";
import { ChevronRight } from "lucide-react";
import { useParams } from "next/navigation";
import Link from "next/link";
import TextFormatter from "../../TextFormatter"; // Import the TextFormatter component
import { BookCallPopup } from "../../../Frontend/pages/pricing/pricingcards/BookCallPopup"; //

interface DesignServicesProps {
  service: {
    title: string;
    description: string;
  };
  plans: {
    id: number;
    title: string;
    description: string;
    features: string; // Assuming features is a JSON string
  }[];
}

export default function DesignServices({
  service,
  plans,
}: DesignServicesProps) {
  const params = useParams();
  const slug = params?.slug as string;
  const [showPopup, setShowPopup] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);

  const handleBookServiceClick = (planTitle: string) => {
    setSelectedPlan(planTitle);
    setShowPopup(true);
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Breadcrumbs */}
      <div className="text-sm flex items-center text-gray-600 mb-4">
        <Link href="/" className="hover:text-blue-600">
          Home
        </Link>
        <span className="mx-1">
          <ChevronRight className="h-4 w-4" />
        </span>
        <span className="text-[#2FD31D]">
          {slug
            .replace(/-/g, " ")
            .toLowerCase()
            .replace(/\b\w/g, (char) => char.toUpperCase())}
        </span>
      </div>

      {/* Service Header */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mt-4 mb-6">{service.title}</h1>
        <TextFormatter description={service.description} />
      </div>

      {/* Plans */}
      <div className="space-y-0">
        {plans.map((plan) => (
          <div key={plan.id} className="border-t py-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">{plan.title}</h3>
                <TextFormatter description={plan.description} />
              </div>
            </div>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
              <div className="w-full md:w-auto">
                <TextFormatter description={JSON.parse(plan.features)} />
              </div>

              {/* Buttons */}
              <div className="flex gap-2 self-end justify-end mt-4 md:mt-0">
                <button className="px-4 py-2 text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 transition-colors">
                  View Portfolio
                </button>
                <button
                  onClick={() => handleBookServiceClick(plan.title)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  Book a Service
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* BookCallPopup */}
      {showPopup && (
        <BookCallPopup
          onClose={() => setShowPopup(false)}
          month_plan={selectedPlan || ""}
          slug={slug}
        />
      )}
    </div>
  );
}
