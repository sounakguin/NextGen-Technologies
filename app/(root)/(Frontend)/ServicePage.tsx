// components/ServicePage.tsx
"use client";

import DesignServices from "@/components/Frontend/pages/ServicesProvide/DesignServices";
import LandingPages from "@/components/Frontend/pages/ServicesProvide/LandingPages";
import WebTemplates from "@/components/Frontend/pages/ServicesProvide/WebTemplate";
import MicroSaasApp from "@/components/Frontend/pages/ServicesProvide/MicroSaasApp";
import SaasApp from "@/components/Frontend/pages/ServicesProvide/SaasApp";

const ServicePage = ({
  serviceName,
  data,
}: {
  serviceName: string;
  data: any;
}) => {
  switch (serviceName) {
    case "design-services":
      return <DesignServices service={data.service} plans={data.plans} />;
    case "landing-page":
      return (
        <LandingPages
          landingPage={data.service}
          templates={data.templates}
          categories={data.categories}
        />
      );
    case "web-templates":
      return (
        <WebTemplates
          webTemplate={data.service}
          templates={data.templates}
          categories={data.categories}
        />
      );
    case "micro-saas":
      return (
        <MicroSaasApp
          microSaas={data.service}
          templates={data.templates}
          categories={data.categories}
        />
      );
    case "saas-app":
      return (
        <SaasApp
          saasApp={data.service}
          templates={data.templates}
          categories={data.categories}
        />
      );
    default:
      return null;
  }
};

export default ServicePage;
