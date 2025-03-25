"use client";

import { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash, Plus } from "lucide-react";
import RichTextEditor from "@/components/UI/Texteditor";
import Image from "next/image";

interface AddThirdPartyProps {
  onClose: () => void;
  onAdd: () => void;
}

interface Category {
  id: number;
  name: string;
}

interface WhyServiceCard {
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
  service_title: string;
  service_description: string;
}

interface ServiceAppDetail {
  title: string;
  full_description: string;
  image_gallery: string[];
  views: string;
}

export default function AddThirdParty({ onClose, onAdd }: AddThirdPartyProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<number[]>([]);
  const [errors, setErrors] = useState({
    title: "",
    description: "",
    categories: "",
    appDetails: "",
    whyService: "",
    howItWorks: "",
    design: "",
  });

  // App Details
  const [appDetails, setAppDetails] = useState<ServiceAppDetail>({
    title: "",
    full_description: "",
    image_gallery: [],
    views: "",
  });

  // Why Service Cards
  const [whyServiceCards, setWhyServiceCards] = useState<WhyServiceCard[]>([
    {
      card_title: "",
      card_description: "",
      card_image: "",
    },
  ]);

  // How It Works Cards
  const [howItWorksCards, setHowItWorksCards] = useState<HowItWorksCard[]>([
    {
      title: "",
      card_title: "",
      card_description: "",
      card_image: "",
    },
  ]);

  // Design Services
  const [designServices, setDesignServices] = useState<DesignService[]>([
    {
      service_title: "",
      service_description: "",
    },
  ]);

  const supabase = createClient();

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from("thirdparty_categories")
        .select("id, name");
      if (error) {
        console.error("Error fetching categories:", error);
      } else {
        setCategories(data);
      }
    };

    fetchCategories();
  }, [supabase]);

  const validateInputs = () => {
    let valid = true;
    const newErrors = {
      title: "",
      description: "",
      categories: "",
      appDetails: "",
      whyService: "",
      howItWorks: "",
      design: "",
    };

    if (!title.trim()) {
      newErrors.title = "Title cannot be empty.";
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description cannot be empty.";
      valid = false;
    }

    if (selectedCategoryIds.length === 0) {
      newErrors.categories = "Please select at least one category.";
      valid = false;
    }

    // Validate App Details
    if (!appDetails.title.trim() || !appDetails.full_description.trim()) {
      newErrors.appDetails = "All app detail fields are required.";
      valid = false;
    }

    // Validate Why Service Cards
    for (const card of whyServiceCards) {
      if (!card.card_title.trim() || !card.card_description.trim()) {
        newErrors.whyService = "All 'Why Service' card fields are required.";
        valid = false;
        break;
      }
    }

    // Validate How It Works Cards
    for (const card of howItWorksCards) {
      if (
        !card.title.trim() ||
        !card.card_title.trim() ||
        !card.card_description.trim()
      ) {
        newErrors.howItWorks = "All 'How It Works' card fields are required.";
        valid = false;
        break;
      }
    }

    // Validate Design Services
    for (const service of designServices) {
      if (
        !service.service_title.trim() ||
        !service.service_description.trim()
      ) {
        newErrors.design = "All design service fields are required.";
        valid = false;
        break;
      }
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCreate = async () => {
    if (!validateInputs()) return;

    try {
      // Insert Third-Party Service
      const { data: serviceData, error: serviceError } = await supabase
        .from("thirdparty_services")
        .insert([{ title, description }])
        .select();

      if (serviceError) throw serviceError;

      const serviceId = serviceData[0].id;

      // Insert categories
      for (const categoryId of selectedCategoryIds) {
        const { error: categoryError } = await supabase
          .from("thirdparty_service_category")
          .insert([
            {
              service_id: serviceId,
              category_id: categoryId,
            },
          ]);

        if (categoryError) throw categoryError;
      }

      // Insert App Details
      const { error: appDetailsError } = await supabase
        .from("thirdparty_service_app_details")
        .insert([
          {
            service_id: serviceId,
            title: appDetails.title,
            full_description: appDetails.full_description,
            image_gallery: appDetails.image_gallery,
            views: appDetails.views,
          },
        ]);

      if (appDetailsError) throw appDetailsError;

      // Insert Why Service Cards
      for (const card of whyServiceCards) {
        const { error: whyServiceError } = await supabase
          .from("why_thirdparty_service")
          .insert([
            {
              service_id: serviceId,

              card_title: card.card_title,
              card_description: card.card_description,
              card_image: card.card_image || "/placeholder.svg",
            },
          ]);

        if (whyServiceError) throw whyServiceError;
      }

      // Insert How It Works Cards
      for (const card of howItWorksCards) {
        const { error: howItWorksError } = await supabase
          .from("how_it_works_thirdparty_service")
          .insert([
            {
              service_id: serviceId,
              title: card.title,
              card_title: card.card_title,
              card_description: card.card_description,
              card_image: card.card_image || "/placeholder.svg",
            },
          ]);

        if (howItWorksError) throw howItWorksError;
      }

      // Insert Design Services
      for (const service of designServices) {
        const { error: designError } = await supabase
          .from("design_thirdparty_service")
          .insert([
            {
              service_id: serviceId,
              service_title: service.service_title,
              service_description: service.service_description,
            },
          ]);

        if (designError) throw designError;
      }

      onAdd();
      onClose();
    } catch (err) {
      console.error("Error creating Third-Party Service:", err);
    }
  };

  const handleAppDetailsChange = (
    field: keyof ServiceAppDetail,
    value: string | string[]
  ) => {
    setAppDetails({
      ...appDetails,
      [field]: value,
    });
  };

  const handleWhyServiceCardChange = (
    index: number,
    field: keyof WhyServiceCard,
    value: string
  ) => {
    const updatedCards = [...whyServiceCards];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value,
    };
    setWhyServiceCards(updatedCards);
  };

  const handleHowItWorksCardChange = (
    index: number,
    field: keyof HowItWorksCard,
    value: string
  ) => {
    const updatedCards = [...howItWorksCards];
    updatedCards[index] = {
      ...updatedCards[index],
      [field]: value,
    };
    setHowItWorksCards(updatedCards);
  };

  const handleDesignServiceChange = (
    index: number,
    field: keyof DesignService,
    value: string
  ) => {
    const updatedServices = [...designServices];
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: value,
    };
    setDesignServices(updatedServices);
  };

  const handleImageUpload = async (
    section: "why" | "how" | "gallery",
    index: number,
    file: File
  ) => {
    const filePath = `ThirdPartyServices/${file.name}`;
    const { error } = await supabase.storage
      .from("Images")
      .upload(filePath, file, { upsert: true });

    if (error) {
      console.error("Error uploading image:", error);
    } else {
      const { data: publicUrlData } = supabase.storage
        .from("Images")
        .getPublicUrl(filePath);

      if (section === "why") {
        const updatedCards = [...whyServiceCards];
        updatedCards[index].card_image = publicUrlData.publicUrl;
        setWhyServiceCards(updatedCards);
      } else if (section === "how") {
        const updatedCards = [...howItWorksCards];
        updatedCards[index].card_image = publicUrlData.publicUrl;
        setHowItWorksCards(updatedCards);
      } else if (section === "gallery") {
        const updatedGallery = [
          ...appDetails.image_gallery,
          publicUrlData.publicUrl,
        ];
        setAppDetails({
          ...appDetails,
          image_gallery: updatedGallery,
        });
      }
    }
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Add Third-Party Service
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
                <input
                  type="text"
                  placeholder="Enter title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    errors.title && "border-red-500"
                  }`}
                />
                {errors.title && (
                  <p className="text-red-600 text-sm">{errors.title}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <textarea
                  placeholder="Enter description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className={`w-full p-2 border rounded-lg ${
                    errors.description && "border-red-500"
                  }`}
                  rows={3}
                />
                {errors.description && (
                  <p className="text-red-600 text-sm">{errors.description}</p>
                )}
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Categories
                </label>
                <select
                  multiple
                  value={selectedCategoryIds.map(String)}
                  onChange={(e) =>
                    setSelectedCategoryIds(
                      Array.from(e.target.selectedOptions, (option) =>
                        Number(option.value)
                      )
                    )
                  }
                  className={`w-full p-2 border rounded-lg ${
                    errors.categories && "border-red-500"
                  }`}
                >
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
                {errors.categories && (
                  <p className="text-red-600 text-sm">{errors.categories}</p>
                )}
              </div>
            </div>
          </div>

          {/* App Details */}
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-4">App Details</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter app title"
                  value={appDetails.title}
                  onChange={(e) =>
                    handleAppDetailsChange("title", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Full Description
                </label>
                <RichTextEditor
                  initialContent={appDetails.full_description}
                  onChange={(content) =>
                    handleAppDetailsChange("full_description", content)
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Image Gallery
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {appDetails.image_gallery.map((image, idx) => (
                    <div key={idx} className="relative">
                      <Image
                        src={image || "/placeholder.svg"}
                        alt={`Gallery ${idx}`}
                        width={80}
                        height={80}
                        className="object-cover rounded"
                      />
                      <button
                        onClick={() => {
                          const updatedGallery =
                            appDetails.image_gallery.filter(
                              (_, i) => i !== idx
                            );
                          setAppDetails({
                            ...appDetails,
                            image_gallery: updatedGallery,
                          });
                        }}
                        className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleImageUpload("gallery", 0, e.target.files[0]);
                    }
                  }}
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Views
                </label>
                <input
                  type="text"
                  placeholder="Enter views"
                  value={appDetails.views}
                  onChange={(e) =>
                    handleAppDetailsChange("views", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              {errors.appDetails && (
                <p className="text-red-600 text-sm">{errors.appDetails}</p>
              )}
            </div>
          </div>

          {/* Why Service */}
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-4">Why Service</h3>
            {whyServiceCards.map((card, index) => (
              <div key={index} className="space-y-4 mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Card {index + 1}</h4>
                  {whyServiceCards.length > 1 && (
                    <button
                      onClick={() =>
                        setWhyServiceCards(
                          whyServiceCards.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={20} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter card title"
                    value={card.card_title}
                    onChange={(e) =>
                      handleWhyServiceCardChange(
                        index,
                        "card_title",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Card Description
                  </label>
                  <textarea
                    placeholder="Enter card description"
                    value={card.card_description}
                    onChange={(e) =>
                      handleWhyServiceCardChange(
                        index,
                        "card_description",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Card Image
                  </label>
                  {card.card_image && (
                    <Image
                      src={card.card_image || "/placeholder.svg"}
                      alt="Card"
                      width={80}
                      height={80}
                      className="object-cover rounded mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload("why", index, e.target.files[0]);
                      }
                    }}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
            ))}
            <CustomButton
              onClick={() =>
                setWhyServiceCards([
                  ...whyServiceCards,
                  {
                    card_title: "",
                    card_description: "",
                    card_image: "",
                  },
                ])
              }
              variant="secondary"
              className="w-full"
            >
              <Plus size={16} className="mr-2" /> Add Why Service Card
            </CustomButton>
            {errors.whyService && (
              <p className="text-red-600 text-sm mt-2">{errors.whyService}</p>
            )}
          </div>

          {/* How It Works */}
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-4">How It Works</h3>
            {howItWorksCards.map((card, index) => (
              <div key={index} className="space-y-4 mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Card {index + 1}</h4>
                  {howItWorksCards.length > 1 && (
                    <button
                      onClick={() =>
                        setHowItWorksCards(
                          howItWorksCards.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={20} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter title"
                    value={card.title}
                    onChange={(e) =>
                      handleHowItWorksCardChange(index, "title", e.target.value)
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Card Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter card title"
                    value={card.card_title}
                    onChange={(e) =>
                      handleHowItWorksCardChange(
                        index,
                        "card_title",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Card Description
                  </label>
                  <textarea
                    placeholder="Enter card description"
                    value={card.card_description}
                    onChange={(e) =>
                      handleHowItWorksCardChange(
                        index,
                        "card_description",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Card Image
                  </label>
                  {card.card_image && (
                    <Image
                      src={card.card_image || "/placeholder.svg"}
                      alt="Card"
                      width={80}
                      height={80}
                      className="object-cover rounded mb-2"
                    />
                  )}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        handleImageUpload("how", index, e.target.files[0]);
                      }
                    }}
                    className="w-full p-2 border rounded-lg"
                  />
                </div>
              </div>
            ))}
            <CustomButton
              onClick={() =>
                setHowItWorksCards([
                  ...howItWorksCards,
                  {
                    title: "",
                    card_title: "",
                    card_description: "",
                    card_image: "",
                  },
                ])
              }
              variant="secondary"
              className="w-full"
            >
              <Plus size={16} className="mr-2" /> Add How It Works Card
            </CustomButton>
            {errors.howItWorks && (
              <p className="text-red-600 text-sm mt-2">{errors.howItWorks}</p>
            )}
          </div>

          {/* Design Services */}
          <div className="border-b pb-4">
            <h3 className="text-xl font-semibold mb-4">Design Services</h3>
            {designServices.map((service, index) => (
              <div key={index} className="space-y-4 mb-6 p-4 border rounded-lg">
                <div className="flex justify-between items-center">
                  <h4 className="font-medium">Service {index + 1}</h4>
                  {designServices.length > 1 && (
                    <button
                      onClick={() =>
                        setDesignServices(
                          designServices.filter((_, i) => i !== index)
                        )
                      }
                      className="text-red-600 hover:text-red-800"
                    >
                      <Trash size={20} />
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Service Title
                  </label>
                  <input
                    type="text"
                    placeholder="Enter service title"
                    value={service.service_title}
                    onChange={(e) =>
                      handleDesignServiceChange(
                        index,
                        "service_title",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-lg"
                  />
                </div>

                <div>
                  <label className="block text-gray-700 font-medium mb-1">
                    Service Description
                  </label>
                  <textarea
                    placeholder="Enter service description"
                    value={service.service_description}
                    onChange={(e) =>
                      handleDesignServiceChange(
                        index,
                        "service_description",
                        e.target.value
                      )
                    }
                    className="w-full p-2 border rounded-lg"
                    rows={3}
                  />
                </div>
              </div>
            ))}
            <CustomButton
              onClick={() =>
                setDesignServices([
                  ...designServices,
                  {
                    service_title: "",
                    service_description: "",
                  },
                ])
              }
              variant="secondary"
              className="w-full"
            >
              <Plus size={16} className="mr-2" /> Add Design Service
            </CustomButton>
            {errors.design && (
              <p className="text-red-600 text-sm mt-2">{errors.design}</p>
            )}
          </div>

          <CustomButton
            onClick={handleCreate}
            variant="primary"
            className="w-full"
          >
            Create Third-Party Service
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
