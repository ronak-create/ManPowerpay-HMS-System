import { Lightbulb } from "lucide-react";
export default function TipBox({ children }) {
  return (
    <div className=" flex gap-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-5 ">
      {" "}
      <Lightbulb className="text-emerald-600 shrink-0 mt-1" size={18} />{" "}
      <div className="text-sm text-emerald-900 leading-6">
        {" "}
        <strong className="font-semibold"> Pro Tip: </strong> {children}{" "}
      </div>{" "}
    </div>
  );
}
