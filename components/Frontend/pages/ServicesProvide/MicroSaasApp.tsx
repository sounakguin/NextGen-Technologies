"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Search, Eye, ShoppingCart, ChevronRight } from "lucide-react";
import TextFormatter from "../../TextFormatter";

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
  categories?: number[]; // Make categories optional
}

interface MicroSaasCategory {
  id: number;
  name: string;
}

interface MicroSaasProps {
  microSaas: MicroSaas;
  templates: MicroSaasTemplate[];
  categories?: MicroSaasCategory[]; // Make categories optional
}

export default function MicroSaasApp({
  microSaas,
  templates,
  categories = [], // Default value if categories is undefined
}: MicroSaasProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [displayCount, setDisplayCount] = useState(9);
  const [timeFilter, setTimeFilter] = useState("yearly"); // yearly or monthly

  // Filter templates based on search query and selected category
  const filteredTemplates = templates.filter((template) => {
    const nameMatch = template.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Check if we're filtering by category
    const categoryMatch =
      selectedCategory === null ||
      (template.categories && template.categories.includes(selectedCategory));

    return nameMatch && categoryMatch;
  });

  const displayedTemplates = filteredTemplates.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount(displayCount + 6);
  };

  const handleCategoryClick = (categoryId: number) => {
    setSelectedCategory(categoryId === selectedCategory ? null : categoryId);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight className="h-4 w-4 mx-1" />
        <span className="text-primary">Micro Saas App</span>
      </div>

      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Get a Fully Customized {microSaas.title}
        </h1>
        <div className="text-gray-600 max-w-3xl">
          <TextFormatter
            description={
              microSaas.description ||
              "Lorem ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard when an unknown printer took a galley of type and scrambled it to make a type specimen book"
            }
          />
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="relative w-full md:w-64 mb-4 md:mb-0">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-md pl-10 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>

        <div className="flex space-x-2">
          <span className="text-sm text-gray-500 self-center">Fee:</span>
          <div className="flex bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setTimeFilter("monthly")}
              className={`px-3 py-1 text-sm rounded-md ${
                timeFilter === "monthly"
                  ? "bg-white shadow-sm"
                  : "text-gray-500"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setTimeFilter("yearly")}
              className={`px-3 py-1 text-sm rounded-md ${
                timeFilter === "yearly" ? "bg-white shadow-sm" : "text-gray-500"
              }`}
            >
              Yearly
            </button>
          </div>
          <button className="bg-primary text-white px-3 py-1 text-sm rounded-md">
            Create
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        {/* Categories Sidebar */}
        <div className="w-full md:w-64 flex flex-wrap md:flex-col gap-2 mb-6 md:mb-0">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-3 py-2 text-sm rounded-md ${
              selectedCategory === null
                ? "bg-primary text-white"
                : "bg-green-50 text-gray-700 hover:bg-green-100"
            }`}
          >
            New
          </button>

          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryClick(category.id)}
              className={`px-3 py-2 text-sm rounded-md ${
                selectedCategory === category.id
                  ? "bg-primary text-white"
                  : "bg-gray-50 text-gray-700 hover:bg-gray-100"
              }`}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Templates Grid */}
        <div className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedTemplates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
              >
                <div className="relative">
                  <Image
                    src={
                      template.thumbnail ||
                      "/placeholder.svg?height=200&width=300"
                    }
                    alt={template.name}
                    width={300}
                    height={200}
                    className="w-full h-48 object-cover"
                  />
                </div>

                <div className="p-4">
                  <h3 className="font-medium mb-2">{template.name}</h3>

                  <div className="flex justify-between items-center text-sm text-gray-500 mb-3">
                    <div>${template.price}</div>
                  </div>

                  <div className="flex justify-between mt-4">
                    <Link
                      href={template.preview_link}
                      target="_blank"
                      className="text-primary text-sm flex items-center"
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Preview
                    </Link>

                    <Link
                      href="#"
                      className="bg-primary text-white text-sm px-3 py-1 rounded flex items-center"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Buy Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {displayedTemplates.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">
                No templates found. Try a different search term or category.
              </p>
            </div>
          )}

          {/* Load More Button */}
          {filteredTemplates.length > displayCount && (
            <div className="flex justify-center mt-12">
              <button
                onClick={handleLoadMore}
                className="border border-gray-300 rounded-md px-6 py-2 text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Load More
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
