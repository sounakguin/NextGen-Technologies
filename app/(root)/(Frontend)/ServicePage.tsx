// components/ServicePage.tsx
"use client";

import DesignServices from "@/components/Frontend/pages/ServicesProvide/DesignServices";
import LandingPages from "@/components/Frontend/pages/ServicesProvide/LandingPages";
import WebTemplates from "@/components/Frontend/pages/ServicesProvide/WebTemplate";
import MicroSaasApp from "@/components/Frontend/pages/ServicesProvide/MicroSaasApp";
import SaasApp from "@/components/Frontend/pages/ServicesProvide/SaasApp";

interface BaseService {
  id: number;
  name: string;
  description: string;
  created_at?: string;
  updated_at?: string;
  slug?: string;
  thumbnail?: string;
  status?: "active" | "inactive";
}

interface ServicePlan {
  id: number;
  name: string;
  price: number;
  description?: string;
  features?: string;
  duration?: string;
  is_popular?: boolean;
}

interface ServiceTemplate {
  id: number;
  name: string;
  thumbnail: string;
  price?: number;
  pages?: number;
  views?: number;
  preview_link?: string;
  landing_page_id?: number;
  web_template_id?: number;
  micro_saas_id?: number;
  saas_app_id?: number;
  status?: "active" | "inactive";
}

interface ServiceCategory {
  id: number;
  name: string;
  slug?: string;
  icon?: string;
  description?: string;
}

interface ServiceData {
  service: BaseService;
  plans?: ServicePlan[];
  templates?: ServiceTemplate[];
  categories?: ServiceCategory[];
}

const ServicePage = ({
  serviceName,
  data,
}: {
  serviceName: string;
  data: ServiceData;
}) => {
  switch (serviceName) {
    case "design-services":
      return (
        <DesignServices
          service={{
            ...data.service,
            title: data.service.name, // Map 'name' to 'title'
          }}
          plans={
            data.plans?.map((plan) => ({
              id: plan.id,
              title: plan.name, // Map 'name' to 'title'
              description: plan.description || "", // Provide a default description
              features: plan.features || "", // Provide a default features value
            })) || []
          }
        />
      );
    case "landing-page":
      return (
        <LandingPages
          landingPage={{
            ...data.service,
            service_id: data.service.id,
            title: data.service.name,
            slug: data.service.name.toLowerCase().replace(/\s+/g, "-"),
          }}
          templates={
            data.templates?.map((template) => ({
              ...template,
              landing_page_id: template.landing_page_id || 0, // Provide a default or computed value
              price: template.price || 0, // Provide a default price
              pages: template.pages || 0, // Provide a default page count
              views: template.views || 0, // Provide a default view count
              preview_link: template.preview_link || "", // Provide a default preview link
            })) || []
          }
          categories={data.categories}
        />
      );
    case "web-templates":
      return (
        <WebTemplates
          webTemplate={{
            ...data.service,
            service_id: data.service.id,
            title: data.service.name,
            slug: data.service.name.toLowerCase().replace(/\s+/g, "-"),
          }}
          templates={
            data.templates?.map((template) => ({
              ...template,
              web_template_id: template.web_template_id || 0, // Provide a default or computed value
              price: template.price || 0, // Provide a default price
              pages: template.pages || 0, // Provide a default page count
              views: template.views || 0, // Provide a default view count
              preview_link: template.preview_link || "", // Provide a default preview link
            })) || []
          }
          categories={data.categories}
        />
      );
    case "micro-saas":
      return (
        <MicroSaasApp
          microSaas={{
            ...data.service,
            service_id: data.service.id,
            title: data.service.name,
            slug: data.service.name.toLowerCase().replace(/\s+/g, "-"),
          }}
          templates={
            data.templates?.map((template) => ({
              ...template,
              micro_saas_id: template.micro_saas_id || 0, // Provide a default or computed value
              price: template.price || 0, // Provide a default price
              preview_link: template.preview_link || "", // Provide a default preview link
            })) || []
          }
          categories={data.categories}
        />
      );
    case "saas-app":
      return (
        <SaasApp
          saasApp={{
            ...data.service,
            service_id: data.service.id,
            title: data.service.name,
            slug: data.service.name.toLowerCase().replace(/\s+/g, "-"),
          }}
          templates={
            data.templates?.map((template) => ({
              ...template,
              saas_app_id: template.saas_app_id || 0, // Provide a default or computed value
              price: template.price || 0, // Provide a default price
              preview_link: template.preview_link || "", // Provide a default preview link
            })) || []
          }
          categories={data.categories}
        />
      );
    default:
      return null;
  }
};

export default ServicePage;
