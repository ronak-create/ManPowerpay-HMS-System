import { AlertTriangle } from "lucide-react";
export default function WarningBox({ children }) {
  return (
    <div className=" flex gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-5 ">
      {" "}
      <AlertTriangle className="text-amber-600 shrink-0 mt-1" size={18} />{" "}
      <div className="text-sm text-amber-900 leading-6">
        {" "}
        <strong className="font-semibold"> Important: </strong> {children}{" "}
      </div>{" "}
    </div>
  );
}
