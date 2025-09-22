import React from "react";
import Title from "./Title";
import assets from "../assets/assets";
import { motion } from "framer-motion";

const OurWork = () => {
  const workData = [
    {
      title: "High-throughput event handling",
      description:
        "See how Veyno powers scalable webhook processing with BullMQ and Redis queues to handle spikes in real-time traffic.",
      image: assets.work_mobile_app,
    },
    {
      title: "User dashboard insights",
      description:
        "Interactive dashboards help users monitor webhook activity, credit usage, and logs with GraphQL-backed APIs.",
      image: assets.work_dashboard_management,
    },
    {
      title: "API-first integrations",
      description:
        "From CRMs to internal tools, Veyno connects payloads to third-party APIs, enabling fully automated workflows.",
      image: assets.work_fitness_app,
    },
  ];

  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.2 }}
      id="our-work"
      className="flex flex-col items-center gap-7 px-4 sm:px-12 lg:px-24 xl:px-40 pt-30 text-gray-700 dark:text-white"
    >
      <Title
        title="What teams build with Veyno"
        desc="Explore real-world use cases—from event processing at scale to seamless API integrations—that showcase how Veyno simplifies webhook orchestration."
      />

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-5xl">
        {workData.map((work, index) => (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            viewport={{ once: true }}
            key={index}
            className="hover:scale-102 duration-500 transition-all cursor-pointer"
          >
            <img src={work.image} className="w-full rounded-xl" alt="" />
            <h3 className="mt-3 mb-2 text-lg font-semibold">{work.title}</h3>
            <p className="text-sm opacity-60 w-5/6">{work.description}</p>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
};

export default OurWork;
