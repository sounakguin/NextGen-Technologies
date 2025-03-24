"use client";

import { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X } from "lucide-react";

interface ViewThirdPartyProps {
  serviceId: number;
  onClose: () => void;
}

interface ThirdPartyService {
  id: number;
  title: string;
  description: string;
  created_at: string;
  categories: string[];
}

interface ServiceAppDetail {
  title: string;
  full_description: string;
  image_gallery: string[];
  views: string;
  preview_link: string;
}

interface WhyServiceCard {
  title: string;
  card_title: string;
  card_description: string;
  card_image: string;
}

interface HowItWorksCard {
  title: string;
  card_title: string;
  card_description: string;
  card_image: string;
}

interface DesignService {
  description: string;
  service_title: string;
  service_description: string;
}

export default function ViewThirdParty({
  serviceId,
  onClose,
}: ViewThirdPartyProps) {
  const [service, setService] = useState<ThirdPartyService | null>(null);
  const [appDetails, setAppDetails] = useState<ServiceAppDetail | null>(null);
  const [whyServiceCards, setWhyServiceCards] = useState<WhyServiceCard[]>([]);
  const [howItWorksCards, setHowItWorksCards] = useState<HowItWorksCard[]>([]);
  const [designService, setDesignService] = useState<DesignService | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchService = async () => {
      setIsLoading(true);
      try {
        // Fetch basic service info
        const { data: serviceData, error: serviceError } = await supabase
          .from("thirdparty_services")
          .select("*")
          .eq("id", serviceId)
          .single();

        if (serviceError) throw serviceError;

        // Fetch categories
        const { data: categoryRelations, error: categoryError } = await supabase
          .from("thirdparty_service_category")
          .select("category_id")
          .eq("service_id", serviceId);

        if (categoryError) throw categoryError;

        const categoryIds = categoryRelations.map((rel) => rel.category_id);

        let categories: string[] = [];
        if (categoryIds.length > 0) {
          const { data: categoryData, error: categoryNameError } =
            await supabase
              .from("thirdparty_categories")
              .select("name")
              .in("id", categoryIds);

          if (categoryNameError) throw categoryNameError;
          categories = categoryData.map((cat) => cat.name);
        }

        setService({
          ...serviceData,
          categories,
        });

        // Fetch app details
        const { data: appData, error: appError } = await supabase
          .from("thirdparty_service_app_details")
          .select("*")
          .eq("service_id", serviceId)
          .single();

        if (!appError && appData) {
          setAppDetails({
            title: appData.title,
            full_description: appData.full_description,
            image_gallery: appData.image_gallery || [],
            views: appData.views,
            preview_link: appData.preview_link,
          });
        }

        // Fetch why service cards
        const { data: whyData, error: whyError } = await supabase
          .from("why_thirdparty_service")
          .select("*")
          .eq("service_id", serviceId);

        if (!whyError && whyData) {
          setWhyServiceCards(
            whyData.map((card) => ({
              title: card.title,
              card_title: card.card_title,
              card_description: card.card_description,
              card_image: card.card_image,
            }))
          );
        }

        // Fetch how it works cards
        const { data: howData, error: howError } = await supabase
          .from("how_it_works_thirdparty_service")
          .select("*")
          .eq("service_id", serviceId);

        if (!howError && howData) {
          setHowItWorksCards(
            howData.map((card) => ({
              title: card.title,
              card_title: card.card_title,
              card_description: card.card_description,
              card_image: card.card_image,
            }))
          );
        }

        // Fetch design service
        const { data: designData, error: designError } = await supabase
          .from("design_thirdparty_service")
          .select("*")
          .eq("service_id", serviceId)
          .single();

        if (!designError && designData) {
          setDesignService({
            description: designData.description,
            service_title: designData.service_title,
            service_description: designData.service_description,
          });
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchService();
  }, [serviceId, supabase]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="text-center mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  if (!service) {
    return (
      <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
        <div className="bg-white p-6 rounded-2xl shadow-xl">
          <p className="text-center">Service not found.</p>
          <CustomButton
            onClick={onClose}
            variant="primary"
            className="mt-4 w-full"
          >
            Close
          </CustomButton>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            View Third-Party Service
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-6">
          {/* Basic Information */}
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Title
                </label>
                <p className="text-gray-800">{service.title}</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <p className="text-gray-800">{service.description}</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Categories
                </label>
                <p className="text-gray-800">{service.categories.join(", ")}</p>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Created At
                </label>
                <p className="text-gray-800">
                  {new Date(service.created_at).toLocaleString()}
                </p>
              </div>
            </div>
          </div>

          {/* App Details */}
          {appDetails && (
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-4">App Details</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Title
                  </label>
                  <p className="text-gray-800">{appDetails.title}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Full Description
                  </label>
                  <div
                    className="text-gray-800 prose max-w-none"
                    dangerouslySetInnerHTML={{
                      __html: appDetails.full_description,
                    }}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Image Gallery
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {appDetails.image_gallery.map((image, idx) => (
                      <img
                        key={idx}
                        src={image || "/placeholder.svg"}
                        alt={`Gallery ${idx}`}
                        className="w-24 h-24 object-cover rounded"
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Views
                  </label>
                  <p className="text-gray-800">{appDetails.views}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Preview Link
                  </label>
                  <a
                    href={appDetails.preview_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {appDetails.preview_link}
                  </a>
                </div>
              </div>
            </div>
          )}

          {/* Why Service */}
          {whyServiceCards.length > 0 && (
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-4">Why Service</h3>
              {whyServiceCards.map((card, index) => (
                <div key={index} className="mb-6 p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Card {index + 1}</h4>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Title
                      </label>
                      <p className="text-gray-800">{card.title}</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Card Title
                      </label>
                      <p className="text-gray-800">{card.card_title}</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Card Description
                      </label>
                      <p className="text-gray-800">{card.card_description}</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Card Image
                      </label>
                      {card.card_image && (
                        <img
                          src={card.card_image || "/placeholder.svg"}
                          alt={card.card_title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* How It Works */}
          {howItWorksCards.length > 0 && (
            <div className="border-b pb-4">
              <h3 className="text-xl font-semibold mb-4">How It Works</h3>
              {howItWorksCards.map((card, index) => (
                <div key={index} className="mb-6 p-4 border rounded-lg">
                  <h4 className="font-medium mb-2">Card {index + 1}</h4>

                  <div className="space-y-2">
                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Title
                      </label>
                      <p className="text-gray-800">{card.title}</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Card Title
                      </label>
                      <p className="text-gray-800">{card.card_title}</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Card Description
                      </label>
                      <p className="text-gray-800">{card.card_description}</p>
                    </div>

                    <div>
                      <label className="block text-gray-700 font-medium mb-1">
                        Card Image
                      </label>
                      {card.card_image && (
                        <img
                          src={card.card_image || "/placeholder.svg"}
                          alt={card.card_title}
                          className="w-24 h-24 object-cover rounded"
                        />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Design Service */}
          {designService && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Design Service</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Description
                  </label>
                  <p className="text-gray-800">{designService.description}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Service Title
                  </label>
                  <p className="text-gray-800">{designService.service_title}</p>
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Service Description
                  </label>
                  <p className="text-gray-800">
                    {designService.service_description}
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
