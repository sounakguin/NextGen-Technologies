"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Filter, Search, Eye, ShoppingCart, ChevronRight } from "lucide-react";
import TextFormatter from "../../TextFormatter";

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
  categories?: number[]; // Make categories optional
}

interface LandingPageCategory {
  id: number;
  name: string;
}

interface LandingPagesProps {
  landingPage: LandingPage;
  templates: LandingPageTemplate[];
  categories?: LandingPageCategory[]; // Make categories optional
}

export default function LandingPages({
  landingPage,
  templates,
  categories = [], // Default value if categories is undefined
}: LandingPagesProps) {
  const params = useParams();
  const { slug } = params as { slug: string };

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("Select");
  const [displayCount, setDisplayCount] = useState(6);

  // Filter templates based on search query and selected category
  const filteredTemplates = templates.filter((template) => {
    const nameMatch = template.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());

    // Check if we're filtering by category
    const categoryMatch =
      selectedFilter === "Select" ||
      (template.categories &&
        template.categories.includes(Number.parseInt(selectedFilter)));

    return nameMatch && categoryMatch;
  });

  const displayedTemplates = filteredTemplates.slice(0, displayCount);

  const handleLoadMore = () => {
    setDisplayCount(displayCount + 6);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <div className="flex mb-6 text-sm text-gray-500">
        <Link href="/" className="hover:text-primary">
          Home
        </Link>
        <ChevronRight />
        <span className="text-primary">{slug}</span>
      </div>

      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-4xl font-bold mb-4">
          Get a Fully Customized {landingPage.title}
        </h1>
        <div className="text-gray-600 max-w-3xl">
          <TextFormatter description={landingPage.description} />
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-8">
        <div className="flex items-center mb-4 md:mb-0">
          <Filter className="h-5 w-5 mr-2 text-gray-500" />
          <select
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
            className="border rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="Select">Select</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id.toString()}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-auto">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="border rounded-md pl-10 pr-4 py-2 w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-primary"
          />
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {displayedTemplates.map((template) => (
          <div
            key={template.id}
            className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="relative">
              <Image
                src={
                  template.thumbnail || "/placeholder.svg?height=200&width=300"
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
                <div className="flex space-x-4">
                  <span className="flex items-center">
                    <Eye className="h-4 w-4 mr-1" />
                    {template.views}
                  </span>
                  <span>{template.pages} pg</span>
                </div>
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
  );
}
