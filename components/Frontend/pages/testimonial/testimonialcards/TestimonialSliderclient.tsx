"use client";

import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface Testimonial {
  id: number;
  title?: string;
  description?: string;
  website_name?: string;
  content?: string;
  name?: string;
  company?: string;
  image?: string;
}

interface TestimonialSliderProps {
  testimonials: Testimonial[];
}

interface ArrowProps {
  onClick?: () => void;
}

const PrevArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return (
    <button
      className="absolute -left-10 top-1/2 -translate-y-1/2 -translate-x-6 z-10 p-2 transition-all"
      onClick={onClick}
    >
      <ChevronLeft size={24} />
    </button>
  );
};

const NextArrow: React.FC<ArrowProps> = ({ onClick }) => {
  return (
    <button
      className="absolute -right-10 top-1/2 -translate-y-1/2 translate-x-6 z-10 p-2 transition-all"
      onClick={onClick}
    >
      <ChevronRight size={24} />
    </button>
  );
};

const TestimonialSliderClient: React.FC<TestimonialSliderProps> = ({
  testimonials,
}) => {
  const settings = {
    dots: false,
    infinite: true,
    speed: 500,
    slidesToShow: 2,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 5000,
    prevArrow: <PrevArrow />,
    nextArrow: <NextArrow />,
    responsive: [
      {
        breakpoint: 768,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
          arrows: false,
        },
      },
    ],
    customPaging: () => <div className="w-3 h-3 mx-1 rounded-full"></div>,
  };

  return (
    <div className="relative px-8 py-12 max-w-7xl mx-auto">
      <Slider {...settings} className="testimonial-slider">
        {testimonials.map((testimonial) => (
          <div key={testimonial.id} className="px-4">
            <div className="bg-white p-4 md:p-8 rounded-xl shadow-md h-full flex flex-col">
              {testimonial.image && (
                <Image
                  src={testimonial.image}
                  alt={testimonial.name || testimonial.title || "Testimonial"}
                  height={100}
                  width={100}
                  className="w-[100px] h-[100px] rounded-full text-left object-cover md:!hidden"
                />
              )}
              <div className="flex">
                <p className="mb-6 mt-4 md:mt-0 flex-grow">
                  {testimonial.content || testimonial.description}
                </p>
                {testimonial.image && (
                  <Image
                    src={testimonial.image}
                    alt={testimonial.name || testimonial.title || "Testimonial"}
                    height={200}
                    width={200}
                    className="w-full h-full rounded-full object-cover !hidden md:!block"
                  />
                )}
              </div>
              <div className="flex items-center">
                <div>
                  <h3 className="font-bold text-lg">
                    {testimonial.name || testimonial.title || "Anonymous"}
                  </h3>
                  <p className=" text-md">
                    {testimonial.company || testimonial.website_name || ""}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </Slider>
    </div>
  );
};

export default TestimonialSliderClient;
