"use client";

import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash } from "lucide-react";
import RichTextEditor from "@/components/UI/Texteditor";

interface AddDesignServiceProps {
  onClose: () => void;
  onAdd: () => void;
}

interface MonthlyPlan {
  title: string;
  description: string;
  features: string;
}

interface Service {
  id: number;
  name: string;
}

export default function AddDesignService({
  onClose,
  onAdd,
}: AddDesignServiceProps) {
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>([]);
  const [services, setServices] = useState<Service[]>([]); // State to store services
  const [selectedServiceId, setSelectedServiceId] = useState<number | null>(
    null
  ); // State to store selected service ID
  const [errors, setErrors] = useState({
    title: "",
    slug: "",
    description: "",
    service: "", // Error for service selection
  });

  const supabase = createClient();

  // Fetch services from the database on component mount
  useEffect(() => {
    const fetchServices = async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name");

      if (error) {
        console.error("Error fetching services:", error);
      } else {
        setServices(data);
      }
    };

    fetchServices();
  }, [supabase]);

  const validateInputs = () => {
    let valid = true;
    const newErrors = { title: "", slug: "", description: "", service: "" };

    if (!title.trim()) {
      newErrors.title = "Title cannot be empty.";
      valid = false;
    }

    if (!slug.trim()) {
      newErrors.slug = "Slug cannot be empty.";
      valid = false;
    } else if (!/^[a-z0-9-]+(\/[a-z0-9-]+)*$/.test(slug)) {
      newErrors.slug = "Slug must be in a valid format (e.g., 'example-slug').";
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description cannot be empty.";
      valid = false;
    }

    if (!selectedServiceId) {
      newErrors.service = "Please select a service.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleCreate = async () => {
    if (!validateInputs()) return;

    try {
      // Insert the design service with the selected service_id
      const { data: serviceData, error: serviceError } = await supabase
        .from("design_services")
        .insert([{ title, slug, description, service_id: selectedServiceId }])
        .select();

      if (serviceError) throw serviceError;

      const designServiceId = serviceData[0].id;

      // Insert monthly plans
      await Promise.all(
        monthlyPlans.map(async (plan) => {
          const { error: planError } = await supabase
            .from("monthly_plans")
            .insert([
              {
                ...plan,
                design_services_id: designServiceId,
                features: JSON.stringify(plan.features), // Serialize features
              },
            ]);

          if (planError) throw planError;
        })
      );

      onAdd();
      onClose();
    } catch (err) {
      console.error("Error creating design service:", err);
    }
  };

  const handleAddPlan = () => {
    setMonthlyPlans([
      ...monthlyPlans,
      { title: "", description: "", features: "[]" }, // Initialize features as an empty JSON array
    ]);
  };

  const handleDeletePlan = (index: number) => {
    const updatedPlans = monthlyPlans.filter((_, i) => i !== index);
    setMonthlyPlans(updatedPlans);
  };

  const handlePlanChange = (
    index: number,
    field: keyof MonthlyPlan,
    value: string
  ) => {
    const updatedPlans = [...monthlyPlans];
    updatedPlans[index][field] = value;
    setMonthlyPlans(updatedPlans);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] h-[600px] overflow-y-scroll">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Add Design Service
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

        <div className="space-y-4">
          {/* Service Selection Dropdown */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Select Service
            </label>
            <select
              value={selectedServiceId || ""}
              onChange={(e) => setSelectedServiceId(Number(e.target.value))}
              className={`w-full p-2 border rounded-lg ${
                errors.service && "border-red-500"
              }`}
            >
              <option value="" disabled>
                Select a service
              </option>
              {services.map((service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                </option>
              ))}
            </select>
            {errors.service && (
              <p className="text-red-600 text-sm">{errors.service}</p>
            )}
          </div>

          {/* Title Input */}
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

          {/* Slug Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">Slug</label>
            <input
              type="text"
              placeholder="Enter slug (e.g., 'example-slug')"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                errors.slug && "border-red-500"
              }`}
            />
            {errors.slug && (
              <p className="text-red-600 text-sm">{errors.slug}</p>
            )}
          </div>

          {/* Description Input */}
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <RichTextEditor
              initialContent={description}
              onChange={setDescription}
            />
            {errors.description && (
              <p className="text-red-600 text-sm">{errors.description}</p>
            )}
          </div>

          {/* Monthly Plans */}
          {monthlyPlans.map((plan, index) => (
            <div key={index} className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-gray-700 font-medium mb-1">
                  Plan {index + 1}
                </label>
                <button
                  onClick={() => handleDeletePlan(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <Trash size={20} />
                </button>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Title
                </label>
                <input
                  type="text"
                  placeholder="Enter plan title"
                  value={plan.title}
                  onChange={(e) =>
                    handlePlanChange(index, "title", e.target.value)
                  }
                  className="w-full p-2 border rounded-lg"
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Description
                </label>
                <RichTextEditor
                  initialContent={plan.description}
                  onChange={(value) =>
                    handlePlanChange(index, "description", value)
                  }
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-1">
                  Features
                </label>
                <RichTextEditor
                  initialContent={plan.features}
                  onChange={(value) =>
                    handlePlanChange(index, "features", value)
                  }
                />
              </div>
            </div>
          ))}

          {/* Add Plan Button */}
          <CustomButton
            onClick={handleAddPlan}
            variant="secondary"
            className="w-full"
          >
            Add Plan
          </CustomButton>

          {/* Create Design Service Button */}
          <CustomButton
            onClick={handleCreate}
            variant="primary"
            className="w-full"
          >
            Create Design Service
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
