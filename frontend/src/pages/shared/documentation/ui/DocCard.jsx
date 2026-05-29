export default function DocCard({ title, children }) {
  return (
    <div className=" bg-white rounded-[28px] border border-zinc-200 shadow-sm hover:shadow-md transition-shadow p-4 sm:p-6 ">
      {" "}
      {title && (
        <h3 className="text-lg font-semibold text-zinc-900 mb-4"> {title} </h3>
      )}{" "}
      <div className="text-sm text-zinc-600 leading-7 space-y-4">
        {" "}
        {children}{" "}
      </div>{" "}
    </div>
  );
}
