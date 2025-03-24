"use client";
import React from "react";
import { motion } from "framer-motion";
import { Button as CustomButton } from "@/components/UI/DebouncedButton";

interface AboutSectionProps {
  title: string;
  subtitle: string;
  description: string;
}

const AboutSectionClient: React.FC<AboutSectionProps> = ({
  title,
  subtitle,
  description,
}) => {
  return (
    <div className="w-full text-white flex justify-center items-center px-6 md:px-20 pt-[60px] pb-[30px]">
      <motion.div
        className="max-w-6xl w-full flex flex-col md:flex-row items-center"
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        viewport={{ once: true }} // ✅ Animation happens only the first time
      >
        {/* Left Section */}
        <div className="md:w-1/2 text-left">
          <motion.p
            className="text-[#2FD31D] uppercase text-sm font-semibold mb-2"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }} // ✅ Animation runs only once
          >
            {subtitle}
          </motion.p>
          <motion.h1
            className="text-4xl md:text-5xl font-bold leading-tight mb-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            viewport={{ once: true }} // ✅ Runs once per page load
          >
            {title}
          </motion.h1>
        </div>

        {/* Right Section */}
        <div className="md:w-1/2 text-left md:pl-10 mt-6 md:mt-0">
          <motion.p
            className="text-lg text-gray-300 mb-6"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            viewport={{ once: true }} // ✅ Runs once
          >
            {description}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            viewport={{ once: true }} // ✅ Runs only once
          >
            <CustomButton variant="green">See Pricing</CustomButton>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
};

export default AboutSectionClient;
