"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import createClient from "@/utils/supabase/client";
import { Loader2 } from "lucide-react";

interface BaseServiceItem {
  id: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

interface Category extends BaseServiceItem {
  slug?: string;
  icon?: string;
}

interface Template extends BaseServiceItem {
  preview_url?: string;
  demo_url?: string;
  price?: number;
}

interface Plan extends BaseServiceItem {
  price?: number;
  features?: string[];
  duration?: string;
}

interface ServiceData {
  service: BaseServiceItem;
  categories?: Category[];
  templates?: Template[];
  plans?: Plan[];
}

interface ServiceLoaderProps {
  children: (props: ServiceData | null) => React.ReactNode;
}

const ServiceLoader = ({ children }: ServiceLoaderProps) => {
  const supabase = createClient();
  const params = useParams();
  const serviceName = params?.serviceName as string;
  const slug = params?.slug as string;

  const [data, setData] = useState<ServiceData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<{
    message: string;
    details?: string[];
  } | null>(null);

  useEffect(() => {
    async function fetchServiceDetails() {
      try {
        setIsLoading(true);
        setError(null);

        if (!serviceName || !slug) {
          setError({
            message: "Invalid URL",
            details: [
              "The URL is missing required parameters",
              "Please check the URL and try again",
            ],
          });
          return;
        }

        const serviceMap = {
          "design-services": "Design Services",
          "landing-page": "Landing Page",
          "web-templates": "Web Templates",
          "micro-saas": "Micro Saas",
          "saas-app": "SaaS App",
        };

        if (!Object.keys(serviceMap).includes(serviceName)) {
          setError({
            message: "Invalid Service",
            details: [
              "The requested service type is not supported",
              "Please check the URL and try again",
            ],
          });
          return;
        }

        const dbServiceName =
          serviceMap[serviceName as keyof typeof serviceMap];

        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select("*")
          .eq("name", dbServiceName)
          .single();

        if (serviceError || !serviceData) {
          setError({
            message: "Service Not Found",
            details: [
              "The requested service does not exist",
              "The service might have been moved or deleted",
              "There might be a temporary system issue",
            ],
          });
          return;
        }

        const fetchHandlers = {
          "design-services": async () => {
            const { data, error: designError } = await supabase
              .from("design_services")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (designError || !data) return false;

            const { data: plansData } = await supabase
              .from("monthly_plans")
              .select("*")
              .eq("design_services_id", data.id);

            return { service: data, plans: plansData || [] };
          },
          "landing-page": async () => {
            const { data, error: pageError } = await supabase
              .from("landing_pages")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (pageError || !data) return false;

            const [categories, templates] = await Promise.all([
              supabase.from("landingpage_categories").select("*"),
              supabase
                .from("landingpage_templates")
                .select("*")
                .eq("landing_page_id", data.id),
            ]);

            return {
              service: data,
              categories: categories.data || [],
              templates: templates.data || [],
            };
          },
          "web-templates": async () => {
            const { data, error: templateError } = await supabase
              .from("web_template")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (templateError || !data) return false;

            const [categories, templates] = await Promise.all([
              supabase.from("webtemplate_categories").select("*"),
              supabase
                .from("web_templates")
                .select("*")
                .eq("web_template_id", data.id),
            ]);

            return {
              service: data,
              categories: categories.data || [],
              templates: templates.data || [],
            };
          },
          "micro-saas": async () => {
            const { data, error: saasError } = await supabase
              .from("micro_saas")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (saasError || !data) return false;

            const [categories, templates] = await Promise.all([
              supabase.from("microsaas_categories").select("*"),
              supabase
                .from("micro_saas_template")
                .select("*")
                .eq("micro_saas_id", data.id),
            ]);

            return {
              service: data,
              categories: categories.data || [],
              templates: templates.data || [],
            };
          },
          "saas-app": async () => {
            const { data, error: saasAppError } = await supabase
              .from("saas_app")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (saasAppError || !data) return false;

            const [categories, templates] = await Promise.all([
              supabase.from("saas_app_categories").select("*"),
              supabase
                .from("saas_app_template")
                .select("*")
                .eq("saas_app_id", data.id),
            ]);

            return {
              service: data,
              categories: categories.data || [],
              templates: templates.data || [],
            };
          },
        };

        const result = await fetchHandlers[
          serviceName as keyof typeof fetchHandlers
        ]();

        if (!result) {
          setError({
            message: "Content Not Found",
            details: [
              "The requested content does not exist",
              "The content might have been moved or deleted",
              "Please check the URL and try again",
            ],
          });
          return;
        }

        setData(result);
      } catch (error) {
        console.error("Error:", error);
        setError({
          message: "System Error",
          details: [
            "An unexpected error occurred",
            "Please try again later",
            "If the problem persists, contact support",
          ],
        });
      } finally {
        setIsLoading(false);
      }
    }

    fetchServiceDetails();
  }, [serviceName, slug, supabase]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-2">Loading...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center">
        <h2 className="text-xl font-semibold text-red-600">{error.message}</h2>
        {error.details && (
          <ul className="mt-2 text-sm text-gray-600">
            {error.details.map((detail, index) => (
              <li key={index}>{detail}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return children(data);
};

export default ServiceLoader;
