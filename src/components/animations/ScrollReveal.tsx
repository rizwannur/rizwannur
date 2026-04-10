"use client";
import { motion } from "framer-motion";
import type { ReactNode } from "react";

type ScrollRevealProps = {
  children: ReactNode;
  direction?: "left" | "right" | "up";
  delay?: number;
  duration?: number;
  className?: string;
};

export default function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.8,
  className,
}: ScrollRevealProps) {
  const x = direction === "left" ? -120 : direction === "right" ? 120 : 0;
  const y = direction === "up" ? 50 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, x, y }}
      whileInView={{ opacity: 1, x: 0, y: 0 }}
      viewport={{ once: false, amount: 0.12 }}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={`w-full${className ? ` ${className}` : ""}`}
    >
      {children}
    </motion.div>
  );
}
