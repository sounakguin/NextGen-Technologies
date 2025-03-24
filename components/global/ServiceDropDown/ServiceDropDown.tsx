"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import createClient from "@/utils/supabase/client";
import { Search } from "lucide-react";
import Image from "next/image";

const supabase = createClient();

// Define types
interface Service {
  id: number;
  name: string;
  category_id: number;
  created_at: string;
  updated_at: string;
}

interface SubService {
  id: number;
  service_id: number;
  slug: string;
  image?: string;
  title: string;
  description: string;
  created_at: string;
  updated_at: string;
}

export default function ServiceDropDown() {
  const [services, setServices] = useState<Service[]>([]);
  const [subServices, setSubServices] = useState<SubService[]>([]);
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);

  const router = useRouter();

  useEffect(() => {
    fetchServices();
  }, []);

  useEffect(() => {
    if (selectedService !== null) {
      fetchSubServices(selectedService);
    }
  }, [selectedService]);

  useEffect(() => {
    const filtered = services.filter((service) =>
      service.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredServices(filtered);
  }, [searchQuery, services]);

  const fetchServices = async () => {
    const { data, error } = await supabase.from("services").select("*");
    if (error) {
      console.error("Error fetching services:", error);
    } else {
      setServices(data as Service[]);
      setFilteredServices(data as Service[]);
      if (data.length > 0) {
        setSelectedService(data[0].id);
      }
    }
  };

  const fetchSubServices = async (serviceId: number) => {
    const { data, error } = await supabase
      .from("sub_services")
      .select("*")
      .eq("service_id", serviceId);
    if (error) {
      console.error("Error fetching sub-services:", error);
    } else {
      setSubServices(data as SubService[]);
    }
  };

  // Function to convert service name to URL-friendly slug
  const generateServiceSlug = (name: string): string => {
    return name
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^a-z0-9-]/g, "")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleSubServiceClick = async (subService: SubService) => {
    const selectedServiceData = services.find((s) => s.id === selectedService);
    if (!selectedServiceData) return;

    const serviceSlug = generateServiceSlug(selectedServiceData.name);

    // Verify if the corresponding table exists for this sub-service
    const tableMap: Record<string, string> = {
      "design-services": "design_services",
      "landing-page": "landing_pages",
      "web-templates": "web_template",
      "micro-saas": "micro_saas",
      "saas-app": "saas_app",
    };

    const tableName = tableMap[serviceSlug];
    if (!tableName) return;

    // Check if the sub-service slug exists in the corresponding table
    const { data, error } = await supabase
      .from(tableName)
      .select("slug")
      .eq("slug", subService.slug)
      .single();

    if (!error && data) {
      router.push(`/services/${serviceSlug}/${subService.slug}`);
    } else {
      console.error(`Slug ${subService.slug} not found in table ${tableName}`);
    }
  };

  return (
    <div className="p-6">
      <div className="max-w-xs mb-6 relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
        <input
          type="text"
          placeholder="Search"
          className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-12 gap-6">
        {/* Services List */}
        <div className="col-span-3 bg-white rounded-lg shadow-sm border border-gray-100">
          <div className="space-y-1">
            {filteredServices.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id)}
                className={`w-full px-4 py-2 text-left transition-colors ${
                  selectedService === service.id
                    ? "bg-green-50 text-green-700"
                    : "hover:bg-gray-50"
                }`}
              >
                {service.name}
              </button>
            ))}
          </div>
        </div>

        {/* Sub-Services Grid */}
        <div className="col-span-9">
          {services.find((s) => s.id === selectedService)?.name && (
            <h2 className="text-2xl font-bold mb-6">
              {services.find((s) => s.id === selectedService)?.name}
            </h2>
          )}
          <div className="grid grid-cols-3 gap-6">
            {subServices.map((subService) => (
              <div
                key={subService.id}
                className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 cursor-pointer hover:shadow-md transition"
                onClick={() => handleSubServiceClick(subService)}
              >
                <div className="flex items-center gap-3 mb-3">
                  {subService.image && (
                    <Image
                      src={subService.image}
                      alt={subService.title}
                      height={20}
                      width={20}
                      className="w-6 h-6 object-contain"
                    />
                  )}
                  <h3 className="font-medium">{subService.title}</h3>
                </div>
                <p className="text-sm text-gray-600">
                  {subService.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
