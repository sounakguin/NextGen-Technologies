import React, { useState, useEffect } from "react";
import createClient from "@/utils/supabase/client";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";
import { X } from "lucide-react";

interface ViewWebTemplateProps {
  onClose: () => void;
  templateId: number;
}

interface WebTemplate {
  id: number;
  title: string;
  description: string;
  slug: string;
  service_id: number;
  created_at: string;
  updated_at: string;
}

interface WebTemplateDetail {
  id: number;
  name: string;
  category_ids: number[];
  thumbnail: string;
  price: number;
  pages: number;
  views: number;
  preview_link: string;
  image_path?: string;
}

export default function ViewWebTemplate({
  onClose,
  templateId,
}: ViewWebTemplateProps) {
  const [template, setTemplate] = useState<WebTemplate | null>(null);
  const [templateDetails, setTemplateDetails] = useState<WebTemplateDetail[]>([]);
  const [categories, setCategories] = useState<{ [key: number]: string }>({});

  const supabase = createClient();

  useEffect(() => {
    const fetchTemplateData = async () => {
      const { data: templateData, error: templateError } = await supabase
        .from("web_template")
        .select("*")
        .eq("id", templateId)
        .single();

      if (templateError) {
        console.error("Error fetching template data:", templateError);
        return;
      }

      setTemplate(templateData);

      const { data: templateDetails, error: detailsError } = await supabase
        .from("web_templates")
        .select("*")
        .eq("web_template_id", templateId);

      if (detailsError) {
        console.error("Error fetching template details:", detailsError);
        return;
      }

      setTemplateDetails(templateDetails);

      const { data: categoryData, error: categoryError } = await supabase
        .from("webtemplate_categories")
        .select("id, name");

      if (categoryError) {
        console.error("Error fetching categories:", categoryError);
        return;
      }

      const categoryMap = categoryData.reduce((acc, category) => {
        acc[category.id] = category.name;
        return acc;
      }, {} as { [key: number]: string });

      setCategories(categoryMap);
    };

    fetchTemplateData();
  }, [templateId, supabase]);

  if (!template) return null;

  return (
    <div className="fixed inset-0 flex justify-center items-center bg-black/50">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full sm:w-[800px] max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2