"use client";

import { animate, useInView, useMotionValue, useMotionValueEvent } from "framer-motion";
import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: number;
  label: string;
  prefix?: string;
  suffix?: string;
}

const STATS: StatItem[] = [
  { value: 144, label: "AI agents" },
  { value: 49, label: "starting price", prefix: "$" },
  { value: 48, label: "download window", suffix: "h" },
  { value: 0, label: "humans in the loop" },
];

function Stat({ value, label, prefix = "", suffix = "" }: StatItem) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const motionValue = useMotionValue(0);
  const [display, setDisplay] = useState(0);

  useMotionValueEvent(motionValue, "change", (latest) => {
    setDisplay(Math.round(latest));
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, value, {
      duration: 1.2,
      ease: "easeOut",
    });
    return controls.stop;
  }, [inView, motionValue, value]);

  return (
    <div ref={ref} className="text-center md:text-left">
      <div className="text-2xl font-semibold text-[#e8e5de] md:text-3xl">
        <span className="font-mono text-[#4f98a3]">
          {prefix}
          {display}
          {suffix}
        </span>
      </div>
      <div className="mt-1 text-xs uppercase tracking-[0.2em] text-[#9c9890]">
        {label}
      </div>
    </div>
  );
}

export default function StatStrip() {
  return (
    <div className="grid gap-6 rounded-2xl border border-[#2e2d2a] bg-[#1c1b19]/70 px-6 py-6 md:grid-cols-4">
      {STATS.map((stat) => (
        <Stat key={stat.label} {...stat} />
      ))}
    </div>
  );
}
