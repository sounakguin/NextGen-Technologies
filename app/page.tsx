import AboutSectionServer from "@/components/Frontend/pages/about/abouttext/AboutSectionServer";
import AboutWorkflow from "@/components/Frontend/pages/about/aboutworkflow/aboutworkflow";
import Banner from "@/components/Frontend/pages/banner/banner";
import BlogList from "@/components/Frontend/pages/blogs/blogscards/blogdetails";
import BlogtextContent from "@/components/Frontend/pages/blogs/blogtsext/blogstext";
import Clientels from "@/components/Frontend/pages/clientels/clientels";
import ContactUs from "@/components/Frontend/pages/contactus/contactus";
import FAQs from "@/components/Frontend/pages/faqs/faqs";
import GetInTouch from "@/components/Frontend/pages/getintouch/getintouch";
import PricingCards from "@/components/Frontend/pages/pricing/pricingcards/pricingcards";
import PricingTextContent from "@/components/Frontend/pages/pricing/pricingtext/pricingtext";
import ServiceCards from "@/components/Frontend/pages/services/servicecards/servicecards";
import ServiceSectiontext from "@/components/Frontend/pages/services/servicetext/servicestext";
import ServicesWMUD from "@/components/Frontend/pages/services/whatmakesusdifferent/wmd";
import TemplatetImages from "@/components/Frontend/pages/template/templateimages/templateimages";
import Templatetextcontent from "@/components/Frontend/pages/template/templatetext/templatetext";
import TestimonialImages from "@/components/Frontend/pages/testimonial/testimonialcards/tetimonialcards";
import Testimonialtextcontent from "@/components/Frontend/pages/testimonial/testimonialtext/testimonialtext";
import ServiceDropDown from "@/components/global/ServiceDropDown/ServiceDropDown";
import React from "react";

export default function page() {
  return (
    <div>
      <div className="bg-[#111204]">
        <Banner />

        <Clientels />

        <div className="bg-[#111204]" id="about">
          <AboutSectionServer />
          <AboutWorkflow />
        </div>
      </div>

      <ServiceDropDown />
      <div id="templates">
        <Templatetextcontent />
        <TemplatetImages />
      </div>

      <div className="bg-[#111204] mt-[30px]" id="services">
        <ServiceSectiontext />
        <ServicesWMUD />
        <ServiceCards />
      </div>

      <Testimonialtextcontent />
      <TestimonialImages />

      <div className="bg-[#111204] " id="pricing">
        <PricingTextContent />
        <PricingCards />
      </div>

      <div className="bg-[#111204]" id="blog">
        <BlogtextContent />

        <BlogList />
      </div>
      <FAQs />

      <div id="contact">
        <ContactUs />
      </div>
      <GetInTouch />
    </div>
  );
}
