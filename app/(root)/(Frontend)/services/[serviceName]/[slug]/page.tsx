"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import createClient from "@/utils/supabase/client";
import DesignServices from "@/components/Frontend/pages/ServicesProvide/DesignServices";
import LandingPages from "@/components/Frontend/pages/ServicesProvide/LandingPages";
import WebTemplates from "@/components/Frontend/pages/ServicesProvide/WebTemplate";
import MicroSaasApp from "@/components/Frontend/pages/ServicesProvide/MicroSaasApp";
import SaasApp from "@/components/Frontend/pages/ServicesProvide/SaasApp";
import { Loader2 } from "lucide-react";

interface DesignService {
  id: number;
  service_id: number;
  title: string;
  slug: string;
  description: string;
}

interface MonthlyPlan {
  id: number;
  design_services_id: number;
  title: string;
  description: string;
  features: string;
  price?: number;
}

interface LandingPage {
  id: number;
  service_id: number;
  title: string;
  slug: string;
  description: string;
}

interface LandingPageTemplate {
  id: number;
  landing_page_id: number;
  name: string;
  thumbnail: string;
  price: number;
  pages: number;
  views: number;
  preview_link: string;
  categories: number[];
}

interface LandingPageCategory {
  id: number;
  name: string;
}

interface WebTemplate {
  id: number;
  service_id: number;
  title: string;
  slug: string;
  description: string;
}

interface WebTemplateTemplate {
  id: number;
  web_template_id: number;
  name: string;
  thumbnail: string;
  price: number;
  pages: number;
  views: number;
  preview_link: string;
  categories: number[];
}

interface WebTemplateCategory {
  id: number;
  name: string;
}

interface MicroSaas {
  id: number;
  service_id: number;
  title: string;
  slug: string;
  description: string;
}

interface MicroSaasTemplate {
  id: number;
  micro_saas_id: number;
  name: string;
  thumbnail: string;
  price: number;
  preview_link: string;
  categories: number[];
}

interface MicroSaasCategory {
  id: number;
  name: string;
}

interface SaasApp {
  id: number;
  service_id: number;
  title: string;
  slug: string;
  description?: string;
}

interface SaasAppTemplate {
  id: number;
  saas_app_id: number;
  name: string;
  thumbnail: string;
  price: number;
  preview_link: string;
  categories?: number[];
}

interface SaasAppCategory {
  id: number;
  name: string;
}

// Utility function to get service name from slug
function getServiceNameFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

export default function ServicePage() {
  const supabase = createClient();
  const params = useParams();
  const serviceName = params?.serviceName as string;
  const slug = params?.slug as string;

  const [designService, setDesignService] = useState<DesignService | null>(
    null
  );
  const [landingPage, setLandingPage] = useState<LandingPage | null>(null);
  const [webTemplate, setWebTemplate] = useState<WebTemplate | null>(null);
  const [microSaas, setMicroSaas] = useState<MicroSaas | null>(null);
  const [saasApp, setSaasApp] = useState<SaasApp | null>(null);
  const [plans, setPlans] = useState<MonthlyPlan[]>([]);
  const [templates, setTemplates] = useState<LandingPageTemplate[]>([]);
  const [webTemplates, setWebTemplates] = useState<WebTemplateTemplate[]>([]);
  const [microSaasTemplates, setMicroSaasTemplates] = useState<
    MicroSaasTemplate[]
  >([]);
  const [saasAppTemplates, setSaasAppTemplates] = useState<SaasAppTemplate[]>(
    []
  );
  const [categories, setCategories] = useState<LandingPageCategory[]>([]);
  const [webTemplateCategories, setWebTemplateCategories] = useState<
    WebTemplateCategory[]
  >([]);
  const [microSaasCategories, setMicroSaasCategories] = useState<
    MicroSaasCategory[]
  >([]);
  const [saasAppCategories, setSaasAppCategories] = useState<SaasAppCategory[]>(
    []
  );
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    async function fetchServiceDetails() {
      try {
        if (!serviceName || !slug) {
          return notFound();
        }

        const dbServiceName = getServiceNameFromSlug(serviceName);

        const { data: serviceData, error: serviceError } = await supabase
          .from("services")
          .select("*")
          .eq("name", dbServiceName)
          .single();

        if (serviceError || !serviceData) {
          return notFound();
        }

        const fetchHandlers: Record<string, () => Promise<boolean>> = {
          "design-services": async () => {
            const { data, error: designError } = await supabase
              .from("design_services")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (designError || !data) return false;

            setDesignService(data);
            const { data: plansData } = await supabase
              .from("monthly_plans")
              .select("*")
              .eq("design_services_id", data.id);

            setPlans(plansData || []);
            return true;
          },
          "landing-page": async () => {
            const { data, error: pageError } = await supabase
              .from("landing_pages")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (pageError || !data) return false;

            setLandingPage(data);
            await Promise.all([
              supabase
                .from("landingpage_categories")
                .select("*")
                .then(({ data: cats }) => setCategories(cats || [])),
              supabase
                .from("landingpage_templates")
                .select("*")
                .eq("landing_page_id", data.id)
                .then(async ({ data: temps }) => {
                  if (temps) {
                    const withCategories = await Promise.all(
                      temps.map(async (template) => {
                        const { data: cats } = await supabase
                          .from("template_categories")
                          .select("category_id")
                          .eq("template_id", template.id);
                        return {
                          ...template,
                          categories: (cats || []).map((c) => c.category_id),
                        };
                      })
                    );
                    setTemplates(withCategories);
                  }
                }),
            ]);
            return true;
          },
          "web-templates": async () => {
            const { data, error: templateError } = await supabase
              .from("web_template")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (templateError || !data) return false;

            setWebTemplate(data);
            await Promise.all([
              supabase
                .from("webtemplate_categories")
                .select("*")
                .then(({ data: cats }) => setWebTemplateCategories(cats || [])),
              supabase
                .from("web_templates")
                .select("*")
                .eq("web_template_id", data.id)
                .then(async ({ data: temps }) => {
                  if (temps) {
                    const withCategories = await Promise.all(
                      temps.map(async (template) => {
                        const { data: cats } = await supabase
                          .from("webtemplate_category_relations")
                          .select("category_id")
                          .eq("template_id", template.id);
                        return {
                          ...template,
                          categories: (cats || []).map((c) => c.category_id),
                        };
                      })
                    );
                    setWebTemplates(withCategories);
                  }
                }),
            ]);
            return true;
          },
          "micro-saas": async () => {
            const { data, error: saasError } = await supabase
              .from("micro_saas")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (saasError || !data) return false;

            setMicroSaas(data);
            await Promise.all([
              supabase
                .from("microsaas_categories")
                .select("*")
                .then(({ data: cats }) => setMicroSaasCategories(cats || [])),
              supabase
                .from("micro_saas_template")
                .select("*")
                .eq("micro_saas_id", data.id)
                .then(async ({ data: temps }) => {
                  if (temps) {
                    const withCategories = await Promise.all(
                      temps.map(async (template) => {
                        const { data: cats } = await supabase
                          .from("micro_saas_category_relations")
                          .select("category_id")
                          .eq("template_id", template.id);
                        return {
                          ...template,
                          categories: (cats || []).map((c) => c.category_id),
                        };
                      })
                    );
                    setMicroSaasTemplates(withCategories);
                  }
                }),
            ]);
            return true;
          },
          "saas-app": async () => {
            const { data, error: saasAppError } = await supabase
              .from("saas_app")
              .select("*")
              .eq("service_id", serviceData.id)
              .eq("slug", slug)
              .single();

            if (saasAppError || !data) return false;

            setSaasApp(data);

            const [categoriesResult, templatesResult] = await Promise.all([
              supabase.from("saas_app_categories").select("*"),
              supabase
                .from("saas_app_template")
                .select("*")
                .eq("saas_app_id", data.id),
            ]);

            setSaasAppCategories(categoriesResult.data || []);

            if (templatesResult.data) {
              const withCategories = await Promise.all(
                templatesResult.data.map(async (template) => {
                  const { data: cats } = await supabase
                    .from("saas_app_category_relations")
                    .select("category_id")
                    .eq("template_id", template.id);

                  return {
                    ...template,
                    categories: (cats || []).map((c) => c.category_id),
                  };
                })
              );
              setSaasAppTemplates(withCategories);
            }

            return true;
          },
        };

        const handler = fetchHandlers[serviceName];
        if (!handler || !(await handler())) {
          return notFound();
        }
      } catch (error) {
        console.error("Error fetching service details:", error);
        return notFound();
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

  return (
    <div className="min-h-screen bg-white">
      {designService && (
        <DesignServices service={designService} plans={plans} />
      )}
      {landingPage && (
        <LandingPages
          landingPage={landingPage}
          templates={templates}
          categories={categories}
        />
      )}
      {webTemplate && (
        <WebTemplates
          webTemplate={webTemplate}
          templates={webTemplates}
          categories={webTemplateCategories}
        />
      )}
      {microSaas && (
        <MicroSaasApp
          microSaas={microSaas}
          templates={microSaasTemplates}
          categories={microSaasCategories}
        />
      )}
      {saasApp && (
        <SaasApp
          saasApp={saasApp}
          templates={saasAppTemplates}
          categories={saasAppCategories}
        />
      )}
    </div>
  );
}
