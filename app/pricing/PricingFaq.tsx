"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";

const FAQS = [
  {
    question: "How are products delivered?",
    answer:
      "Instantly via a 48-hour presigned download link sent to your purchase email. No account required.",
  },
  {
    question: "What if my download link expires?",
    answer:
      "Contact hello@rihan.cloud with your order ID. We'll resend immediately.",
  },
  {
    question: "Do you offer refunds?",
    answer:
      "No refunds on digital goods. If a file is corrupted or missing, we'll fix it.",
  },
  {
    question: "Can I use these products commercially?",
    answer:
      "Yes. AI agent files are MIT-licensed. Boilerplates and kits include a commercial use license. Audit reports are for your use only.",
  },
  {
    question: "What's the difference between intake and ZIP products?",
    answer:
      "ZIP products are instant downloads. Intake products (Infra Audit, Automation Spec) require a short questionnaire — our AI generates a custom document for your specific situation.",
  },
];

export default function PricingFaq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-4">
      {FAQS.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={item.question}
            className="rounded-2xl border border-[#2e2d2a] bg-[#1c1b19]"
          >
            <button
              type="button"
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className="flex w-full items-center justify-between px-6 py-4 text-left text-sm font-semibold text-[#e8e5de]"
            >
              {item.question}
              {isOpen ? (
                <Minus className="h-4 w-4 text-[#4f98a3]" />
              ) : (
                <Plus className="h-4 w-4 text-[#4f98a3]" />
              )}
            </button>
            {isOpen ? (
              <div className="px-6 pb-4 text-sm text-[#9c9890]">
                {item.answer}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
