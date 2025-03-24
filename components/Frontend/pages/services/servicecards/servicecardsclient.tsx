"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Service {
  title: string;
  image: string;
  description: string;
}

const extractPlainText = (description: string) => {
  if (!description) return "No description available";
  try {
    const parsed = JSON.parse(description);
    if (parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content
        .map((block: { type: string; content: { text: string }[] }) =>
          block.type === "paragraph"
            ? block.content
                .map((textBlock: { text: string }) => textBlock.text)
                .join(" ")
            : ""
        )
        .join(" ");
    }
  } catch (e) {
    console.error("Error parsing description:", e);
  }
  return description;
};

export default function ServiceCardsClient({
  services,
}: {
  services: Service[];
}) {
  return (
    <div className="w-full flex justify-center items-center py-20 px-6 md:px-20">
      <div className="max-w-6xl w-full grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {services.map((service, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 50 }} // Starts below with opacity 0
            whileInView={{ opacity: 1, y: 0 }} // Slides up on scroll
            transition={{ duration: 0.6, delay: index * 0.2 }} // Delayed stagger effect
            viewport={{ once: true }} // Animation runs only once
            className="bg-dark p-6 rounded-lg border border-gray-700 text-white text-left"
          >
            <div className="flex justify-start mb-4">
              <Image
                src={service.image}
                alt={service.title}
                width={40}
                height={40}
                className="h-10"
              />
            </div>
            <h2 className="text-lg font-bold mb-2">
              {index + 1}. {service.title}
            </h2>
            <p className="text-gray-300">
              {extractPlainText(service.description)}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
