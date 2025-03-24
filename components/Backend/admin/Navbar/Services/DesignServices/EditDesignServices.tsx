"use client";
import React, { useState } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X, Trash } from "lucide-react";
import RichTextEditor from "@/components/UI/Texteditor";

interface MonthlyPlan {
  id: number;
  title: string;
  description: string;
  features: string;
  design_services_id?: number;
}

interface DesignService {
  id: number;
  title: string;
  slug: string;
  description: string;
  monthly_plans: MonthlyPlan[];
}

interface EditDesignServiceProps {
  service: DesignService;
  onClose: () => void;
  onUpdate: () => void;
}

type PlanField = keyof Pick<MonthlyPlan, "title" | "description" | "features">;

export default function EditDesignService({
  service,
  onClose,
  onUpdate,
}: EditDesignServiceProps) {
  const [title, setTitle] = useState(service.title);
  const [slug, setSlug] = useState(service.slug);
  const [description, setDescription] = useState(service.description);
  const [monthlyPlans, setMonthlyPlans] = useState<MonthlyPlan[]>(
    service.monthly_plans.map((plan) => ({
      ...plan,
      features: Array.isArray(plan.features)
        ? plan.features
        : typeof plan.features === "string"
        ? JSON.parse(plan.features)
        : [],
    }))
  );
  const [errors, setErrors] = useState({
    title: "",
    slug: "",
    description: "",
  });

  const validateInputs = () => {
    let valid = true;
    const newErrors = { title: "", slug: "", description: "" };

    if (!title.trim()) {
      newErrors.title = "Title cannot be empty.";
      valid = false;
    }

    if (!slug.trim()) {
      newErrors.slug = "Slug cannot be empty.";
      valid = false;
    }

    if (!description.trim()) {
      newErrors.description = "Description cannot be empty.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const supabase = createClient();

  const handleUpdate = async () => {
    if (!validateInputs()) return;

    try {
      // Update service details
      const { error: serviceError } = await supabase
        .from("design_services")
        .update({ title, slug, description })
        .eq("id", service.id);

      if (serviceError) throw serviceError;

      // Update monthly plans
      await Promise.all(
        monthlyPlans.map(async (plan) => {
          const planData = {
            ...plan,
            features: JSON.stringify(plan.features),
          };

          if (plan.id) {
            const { error: planError } = await supabase
              .from("monthly_plans")
              .update(planData)
              .eq("id", plan.id);

            if (planError) throw planError;
          } else {
            const { error: planError } = await supabase
              .from("monthly_plans")
              .insert([{ ...planData, design_services_id: service.id }]);

            if (planError) throw planError;
          }
        })
      );

      onUpdate();
      onClose();
    } catch (err) {
      console.error("Error updating design service:", err);
    }
  };

  const handleAddPlan = () => {
    setMonthlyPlans([
      ...monthlyPlans,
      {
        id: 0,
        title: "",
        description: "",
        features: "",
      },
    ]);
  };

  const handleDeletePlan = (index: number) => {
    setMonthlyPlans(monthlyPlans.filter((_, i) => i !== index));
  };

  const handlePlanChange = (
    index: number,
    field: PlanField | "features",
    value: string
  ) => {
    const updatedPlans = [...monthlyPlans];
    updatedPlans[index] = {
      ...updatedPlans[index],
      [field]: value,
    };
    setMonthlyPlans(updatedPlans);
  };

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] h-[600px] overflow-y-scroll">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Edit Design Service
          </h2>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-gray-800"
          >
            <X size={24} />
          </button>
        </div>

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
                errors.title ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.title && (
              <p className="text-red-600 text-sm">{errors.title}</p>
            )}
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Slug</label>
            <input
              type="text"
              placeholder="Enter slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              className={`w-full p-2 border rounded-lg ${
                errors.slug ? "border-red-500" : "border-gray-300"
              }`}
            />
            {errors.slug && (
              <p className="text-red-600 text-sm">{errors.slug}</p>
            )}
          </div>

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

          {monthlyPlans.map((plan, index) => (
            <div key={index} className="space-y-2 border rounded-lg p-4">
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
                  className="w-full p-2 border rounded-lg border-gray-300"
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

          <CustomButton
            onClick={handleAddPlan}
            variant="secondary"
            className="w-full"
          >
            Add Plan
          </CustomButton>

          <CustomButton
            onClick={handleUpdate}
            variant="primary"
            className="w-full"
          >
            Update Design Service
          </CustomButton>
        </div>
      </div>
    </div>
  );
}
