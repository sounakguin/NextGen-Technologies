"use client";
import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

interface Step {
  id: number;
  title: string;
  description: string;
  image: string;
}

interface AboutWorkflowProps {
  steps: Step[];
}

// Function to extract text from JSON description
const extractPlainText = (description: string): string => {
  if (!description) return "No description available";
  try {
    const parsed = JSON.parse(description) as {
      type: string;
      content: { type: string; content: { text: string }[] }[];
    };
    if (parsed.type === "doc" && Array.isArray(parsed.content)) {
      return parsed.content
        .map((block) =>
          block.type === "paragraph"
            ? block.content.map((textBlock) => textBlock.text).join(" ")
            : ""
        )
        .join(" ");
    }
  } catch (e) {
    console.error("Error parsing description:", e);
  }
  return description;
};

const AboutWorkflowClient: React.FC<AboutWorkflowProps> = ({ steps }) => {
  return (
    <div className="w-11/12 mx-auto bg-[#111204] text-white py-16 flex justify-center">
      <motion.div
        className="max-w-6xl w-full lg:px-4 md:px-8"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 text-left">
          {steps.map((step, index) => (
            <motion.div
              key={step.id}
              className="flex gap-7 lg:gap-0 lg:flex-col items-left"
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }} // 👈 Delay added for stagger effect
              viewport={{ once: true }}
            >
              <div className="h-[78px] w-[110px] lg:h-20 lg:w-20">
                <Image
                  src={step.image || "/default-icon.png"}
                  alt={step.title}
                  width={60}
                  height={60}
                  className="object-contain h-full w-full lg:h-20 lg:w-20"
                />
              </div>
              <div className="flex flex-col">
                <h2 className="text-lg md:text-xl font-bold mb-2">
                  {step.title}
                </h2>
                <p className="text-gray-400 text-sm md:text-base">
                  {extractPlainText(step.description)}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default AboutWorkflowClient;
