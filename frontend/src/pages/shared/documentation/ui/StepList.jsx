export default function StepList({ steps = [] }) {
  return (
    <div className="space-y-3">
      {" "}
      {steps.map((step, index) => (
        <div
          key={index}
          className=" flex gap-3 sm:gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-4 "
        >
          {" "}
          <div className=" w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center text-sm font-bold shrink-0 ">
            {" "}
            {index + 1}{" "}
          </div>{" "}
          <p className="text-sm text-zinc-700 leading-6"> {step} </p>{" "}
        </div>
      ))}{" "}
    </div>
  );
}
