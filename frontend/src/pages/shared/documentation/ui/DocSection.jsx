export default function DocSection({
  title,
  description,
  children
}) {
  return (
    <section className="mb-8 sm:mb-10">      
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-zinc-900 tracking-tight">
          {title}
        </h2>

        {description && (
          <p className="text-zinc-500 mt-2 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      <div className="space-y-5">
        {children}
      </div>
    </section>
  );
}