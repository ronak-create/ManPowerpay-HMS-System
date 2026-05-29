import { useState } from "react";
import { ChevronDown } from "lucide-react";
export default function FAQAccordion({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null);
  return (
    <div className="space-y-3">
      {" "}
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div
            key={index}
            className=" rounded-2xl border border-zinc-200 bg-white overflow-hidden "
          >
            {" "}
            <button
              onClick={() => setOpenIndex(isOpen ? null : index)}
              className=" w-full p-4 sm:p-5 flex items-center justify-between text-left "
            >
              {" "}
              <h3 className="font-semibold text-zinc-900">
                {" "}
                {item.question}{" "}
              </h3>{" "}
              <ChevronDown
                size={18}
                className={`transition-transform ${isOpen ? "rotate-180" : ""}`}
              />{" "}
            </button>{" "}
            {isOpen && (
              <div className="px-5 pb-5 text-sm text-zinc-600 leading-7">
                {" "}
                {item.answer}{" "}
              </div>
            )}{" "}
          </div>
        );
      })}{" "}
    </div>
  );
}
