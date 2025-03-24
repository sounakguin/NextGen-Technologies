"use client";

import React, { useEffect, useState } from "react";
import createClient from "@/utils/supabase/client";
import { X } from "lucide-react";

interface ViewMicroSaasProps {
  onClose: () => void;
  microSaasId: number;
}

export default function ViewMicroSaas({
  onClose,
  microSaasId,
}: ViewMicroSaasProps) {
  const [microSaas, setMicroSaas] = useState<any>(null);
  const [templates, setTemplates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const supabase = createClient();

  useEffect(() => {
    const fetchData = async () => {
      const { data: microSaasData } = await supabase
        .from("micro_saas")
        .select("*")
        .eq("id", microSaasId)
        .single();

      if (microSaasData) {
        setMicroSaas(microSaasData);

        const { data: templatesData } = await supabase
          .from("micro_saas_template")
          .select("*")
          .eq("micro_saas_id", microSaasId);

        setTemplates(templatesData || []);
      }
      setIsLoading(false);
    };

    fetchData();
  }, [microSaasId, supabase]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            View Micro SaaS
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
            <p className="text-gray-800">{microSaas?.title}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Description
            </label>
            <p className="text-gray-800">{microSaas?.description}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">Slug</label>
            <p className="text-gray-800">{microSaas?.slug}</p>
          </div>

          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Templates
            </label>
            {templates.map((template, index) => (
              <div key={index} className="border-t pt-4">
                <p className="text-gray-800 font-medium">
                  Template {index + 1}
                </p>
                <p className="text-gray-800">Name: {template.name}</p>
                <p className="text-gray-800">Price: ${template.price}</p>
                <p className="text-gray-800">
                  Preview Link: {template.preview_link}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
