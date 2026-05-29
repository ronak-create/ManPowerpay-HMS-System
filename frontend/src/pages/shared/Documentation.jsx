import { useMemo, useState } from "react";
import { Search, Menu, X } from "lucide-react";
import { docsSections } from "./docsConfig";

export default function Documentation() {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState(
    docsSections?.[0]?.id || "",
  );
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return docsSections;

    return docsSections.filter((section) => {
      const query = searchQuery.toLowerCase();

      return (
        section.title.toLowerCase().includes(query) ||
        section.category?.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const currentSection =
    docsSections.find((section) => section.id === activeSection) ||
    docsSections[0];

  const ActiveComponent = currentSection?.component;

  return (
    <div className="flex flex-col lg:flex-row gap-8 animate-fade-in relative">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-zinc-200 rounded-xl px-4 py-3 flex items-center justify-between">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-zinc-100"
        >
          <Menu size={20} />
        </button>

        <h2 className="font-semibold text-zinc-900">{currentSection?.title}</h2>
      </div>

      {/* Sidebar */}
      <aside
        className={`
    fixed lg:sticky
    top-0 lg:top-6
    left-0
    z-50
    h-screen lg:h-auto
    w-[250px] xl:w-[270px]
    bg-white lg:bg-zinc-50/70
    backdrop-blur-sm
    border-r lg:border
    border-zinc-200
    rounded-none lg:rounded-3xl
    p-5
    overflow-visible
    transition-transform duration-300
    shrink-0
    ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
  `}
      >
        <div className="flex flex-col h-full min-h-0">
          {/* Mobile Header */}
          <div className="flex items-center justify-between mb-6 lg:hidden">
            <div>
              <h2 className="text-lg font-bold text-zinc-900">User Manual</h2>

              <p className="text-xs text-zinc-500">HMS Documentation</p>
            </div>

            <button
              onClick={() => setSidebarOpen(false)}
              className="p-2 rounded-lg hover:bg-zinc-100"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-5 shrink-0">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
              size={16}
            />

            <input
              type="text"
              placeholder="Search documentation..."
              className="
          w-full rounded-xl
          border border-zinc-200
          bg-white
          px-4 py-3 pl-10
          text-sm
          outline-none
          transition
          focus:ring-2
          focus:ring-amber-400
          focus:border-amber-400
        "
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Scrollable Navigation */}
            <nav className="space-y-1">
              <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-3 mb-2">
                Manual Sections
              </p>

              {filteredSections.map((section) => {
                const Icon = section.icon;

                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setSidebarOpen(false);

                      window.scrollTo({
                        top: 0,
                        behavior: "smooth",
                      });
                    }}
                    className={`
                w-full flex items-center gap-3
                px-3 py-2.5 rounded-xl
                text-sm font-medium transition-all
                ${
                  activeSection === section.id
                    ? "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-700 border border-amber-200 shadow-sm"
                    : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                }
              `}
                  >
                    {Icon && (
                      <Icon
                        size={18}
                        className={
                          activeSection === section.id
                            ? "text-amber-600"
                            : "text-zinc-400"
                        }
                      />
                    )}

                    <div className="flex-1 min-w-0 text-left">
                      <p className="truncate">{section.title}</p>

                      <span className="text-[10px] text-zinc-400">
                        {section.category}
                      </span>
                    </div>
                  </button>
                );
              })}
            </nav>

          {/* Sticky Bottom Card */}
          <div className="pt-4 shrink-0">
            <div className="p-4 bg-zinc-900 rounded-2xl text-white">
              <p className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2">
                Helpdesk
              </p>

              <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                Need help with payroll, employees, or access issues?
              </p>

              <button className="w-full py-2 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-semibold transition">
                Contact Support
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 min-w-0 w-full max-w-full xl:max-w-5xl px-4 sm:px-0">
        <div className="mb-8">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center text-amber-600 shadow-inner shrink-0">
              {currentSection?.icon ? <currentSection.icon size={26} /> : null}
            </div>

            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight">
                {currentSection?.title}
              </h1>

              <p className="text-zinc-500 text-sm">
                Official User Manual • ManpowerPay HMS
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic Component */}
        <div className="space-y-6 max-w-4xl">
          {ActiveComponent ? (
            <ActiveComponent />
          ) : (
            <div className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-10 text-center">
              <h3 className="text-lg font-semibold text-zinc-900">
                Documentation Not Found
              </h3>

              <p className="text-zinc-500 mt-2">
                Please select a valid section.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 pt-8 border-t border-zinc-100 text-xs text-zinc-400">
          © 2026 ManpowerPay HMS. Confidential & Organization-specific.
        </div>
      </div>
    </div>
  );
}
