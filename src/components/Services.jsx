import React from "react";
import assets from "../assets/assets";
import Title from "./Title";
import ServicesCard from "./ServicesCard";
import { motion } from "framer-motion";

const Services = () => {
  const servicesData = [
    {
      title: "Custom Webhooks",
      description:
        "Design and deploy webhook endpoints with chained actions like transformations, routing, and API calls—all without managing servers.",
      icon: assets.ads_icon,
    },
    {
      title: "Payload Transformations",
      description:
        "Easily reshape JSON payloads with rules for renaming, filtering, and restructuring data before forwarding.",
      icon: assets.marketing_icon,
    },
    {
      title: "Conditional Routing",
      description:
        "Set up powerful if-then logic to forward requests to different destinations based on payload conditions.",
      icon: assets.content_icon,
    },
    {
      title: "API Integrations",
      description:
        "Send processed data directly to your existing services or APIs, automating workflows end-to-end.",
      icon: assets.social_icon,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.2 }}
      id="services"
      className="relative flex flex-col items-center gap-7 px-4 sm:px-12 lg:px-24 xl:px-40 pt-30 text-gray-700 dark:text-white"
    >
      <img
        src={assets.bgImage2}
        alt=""
        className="absolute -top-110 -left-70 z-1 dark:hidden"
      />

      <div className="z-10">
        <Title
          title="What can you build with Veyno?"
          desc="From payload transformations to conditional routing, Veyno gives you the tools to automate data flows with ease."
        />
      </div>
      <div className="flex flex-col md:grid grid-cols-2">
        {servicesData.map((service, index) => (
          <ServicesCard key={index} service={service} index={index} />
        ))}
      </div>
    </motion.div>
  );
};

export default Services;
