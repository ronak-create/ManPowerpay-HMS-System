import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import {
  ShieldCheck,
  CalendarCheck,
  FileText,
  Building2,
  SlidersHorizontal,
  IndianRupee,
  BarChart3,
  Check,
  ArrowRight,
  Menu,
  X,
  Landmark,
  Clock,
  Users,
  Lock,
  KeyRound,
  History,
  Plus,
} from "lucide-react";
import BrandGlyph from "../components/BrandGlyph";

/* ManpowerPay marketing landing (public "/"). Premium LIGHT theme: warm off-white
   surfaces, deep ink text, DM Serif Display headlines for a classic/elegant feel,
   amber accent. One deliberate dark closing block (CTA + footer) for contrast.
   Motion is CSS + IntersectionObserver only (no new deps); degrades under
   prefers-reduced-motion. */

// Real Unsplash photography (URLs verified 200). auto-format keeps them light;
// facearea crop is used for portraits. Swap ids freely.
const IMG = (id, w, h, fit = "crop") =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=${fit}&w=${w}&h=${h}&q=80`;

// Reveal-on-scroll wrapper. Fires once when the element enters the viewport;
// collapses to static instantly under prefers-reduced-motion.
function Reveal({ children, delay = 0, className = "" }) {
  const ref = useRef(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-spring ${
        shown ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
      } ${className}`}
    >
      {children}
    </div>
  );
}

const Eyebrow = ({ children, light = false }) => (
  <p
    className={`text-xs font-semibold uppercase tracking-[0.2em] mb-5 ${
      light ? "text-primary-300" : "text-primary-600"
    }`}
  >
    {children}
  </p>
);

// Elegant serif-italic amber accent phrase (DM Serif Display). leading + pb reserve
// keep any italic descenders clear.
const Accent = ({ children }) => (
  <span
    className="font-serif italic leading-[1.1] pb-1 inline-block"
    style={{
      background: "linear-gradient(135deg, #B45309, #F59E0B)",
      WebkitBackgroundClip: "text",
      WebkitTextFillColor: "transparent",
      backgroundClip: "text",
    }}
  >
    {children}
  </span>
);

const PrimaryLink = ({ to, children, className = "" }) => (
  <Link
    to={to}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-white transition-[transform,filter,box-shadow] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:-translate-y-0.5 hover:brightness-95 active:scale-[0.97] active:translate-y-0 ${className}`}
    style={{
      background: "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)",
      boxShadow: "0 6px 20px rgba(217,119,6,.35)",
    }}
  >
    {children}
  </Link>
);

const SecondaryLink = ({ to, children, className = "" }) => (
  <Link
    to={to}
    className={`inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-semibold text-zinc-800 bg-white border border-zinc-200 transition-[transform,border-color,box-shadow] duration-150 [transition-timing-function:cubic-bezier(0.23,1,0.32,1)] hover:border-zinc-300 hover:-translate-y-0.5 active:scale-[0.97] active:translate-y-0 ${className}`}
  >
    {children}
  </Link>
);

const Logo = ({ light = false }) => (
  <div className="flex items-center gap-3">
    <BrandGlyph size={36} />
    <span
      className={`font-semibold text-base tracking-tight ${
        light ? "text-white" : "text-zinc-900"
      }`}
    >
      ManpowerPay HMS
    </span>
  </div>
);

// Continuously morphing + drifting wave backdrop (light orange + white). Purely
// decorative; SMIL morph + CSS drift are disabled under prefers-reduced-motion.
function WaveBg() {
  const [reduce, setReduce] = useState(false);
  useEffect(() => {
    setReduce(!!window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
  }, []);
  const A = [
    "M0,320 C240,260 480,380 720,320 C960,260 1200,380 1440,320 L1440,600 L0,600 Z",
    "M0,340 C240,400 480,280 720,340 C960,400 1200,280 1440,340 L1440,600 L0,600 Z",
    "M0,300 C240,240 480,360 720,300 C960,240 1200,360 1440,300 L1440,600 L0,600 Z",
  ];
  const B = [
    "M0,400 C300,340 600,460 900,400 C1120,356 1320,436 1440,400 L1440,600 L0,600 Z",
    "M0,420 C300,480 600,360 900,420 C1120,476 1320,392 1440,420 L1440,600 L0,600 Z",
    "M0,380 C300,320 600,440 900,380 C1120,336 1320,416 1440,380 L1440,600 L0,600 Z",
  ];
  const splines = "0.4 0 0.2 1;0.4 0 0.2 1;0.4 0 0.2 1";
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <style>{`
        @keyframes waveDriftA{0%,100%{transform:translateX(0)}50%{transform:translateX(-28px)}}
        @keyframes waveDriftB{0%,100%{transform:translateX(0)}50%{transform:translateX(38px)}}
      `}</style>
      <svg
        className="absolute bottom-0 left-0 w-full h-[75%] min-h-[340px]"
        viewBox="0 0 1440 600"
        preserveAspectRatio="none"
        style={{ filter: "blur(4px)" }}
      >
        <defs>
          <linearGradient id="wvA" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#FDE68A" stopOpacity="0.5" />
            <stop offset="1" stopColor="#F59E0B" stopOpacity="0.28" />
          </linearGradient>
          <linearGradient id="wvB" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.85" />
            <stop offset="1" stopColor="#FEF3C7" stopOpacity="0.55" />
          </linearGradient>
        </defs>
        <g style={reduce ? undefined : { animation: "waveDriftA 18s ease-in-out infinite" }}>
          <path fill="url(#wvA)" d={A[0]}>
            {!reduce && (
              <animate
                attributeName="d"
                dur="13s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.33;0.66;1"
                keySplines={splines}
                values={`${A[0]};${A[1]};${A[2]};${A[0]}`}
              />
            )}
          </path>
        </g>
        <g style={reduce ? undefined : { animation: "waveDriftB 24s ease-in-out infinite" }}>
          <path fill="url(#wvB)" d={B[0]}>
            {!reduce && (
              <animate
                attributeName="d"
                dur="17s"
                repeatCount="indefinite"
                calcMode="spline"
                keyTimes="0;0.33;0.66;1"
                keySplines={splines}
                values={`${B[0]};${B[1]};${B[2]};${B[0]}`}
              />
            )}
          </path>
        </g>
      </svg>
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  return (
    <header className="fixed top-0 inset-x-0 z-50 border-b border-zinc-200/70 bg-white/80 backdrop-blur-md">
      <nav className="max-w-[1600px] mx-auto px-6 lg:px-12 h-16 flex items-center justify-between">
        <Logo />
        <div className="hidden md:flex items-center gap-8">
          <a href="#features" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            Features
          </a>
          <a href="#compliance" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            Compliance
          </a>
          <a href="#security" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            Security
          </a>
          <a href="#pricing" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            Pricing
          </a>
          <Link to="/login" className="text-sm text-zinc-600 hover:text-zinc-900 transition-colors">
            Sign in
          </Link>
          <PrimaryLink to="/signup" className="!px-4 !py-2">
            Start free
          </PrimaryLink>
        </div>
        <button
          className="md:hidden text-zinc-900 p-1"
          onClick={() => setOpen((v) => !v)}
          aria-label="Toggle menu"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>
      {open && (
        <div className="md:hidden border-t border-zinc-200 bg-white px-5 py-4 flex flex-col gap-4">
          <a href="#features" onClick={() => setOpen(false)} className="text-sm text-zinc-600">
            Features
          </a>
          <a href="#compliance" onClick={() => setOpen(false)} className="text-sm text-zinc-600">
            Compliance
          </a>
          <a href="#security" onClick={() => setOpen(false)} className="text-sm text-zinc-600">
            Security
          </a>
          <a href="#pricing" onClick={() => setOpen(false)} className="text-sm text-zinc-600">
            Pricing
          </a>
          <Link to="/login" className="text-sm text-zinc-600">
            Sign in
          </Link>
          <PrimaryLink to="/signup">Start free</PrimaryLink>
        </div>
      )}
    </header>
  );
}

// The product's real payslip output, used as the hero visual on a soft panel.
// Figures are illustrative sample data.
function PayslipCard({ className = "" }) {
  const deductions = [
    ["EPF (12%)", "1,800"],
    ["Professional Tax", "200"],
    ["TDS", "1,250"],
  ];
  return (
    <div className={`w-64 rounded-2xl bg-white shadow-card-lift border border-zinc-100 overflow-hidden ${className}`}>
      <div
        className="px-4 py-3 text-white flex items-center justify-between"
        style={{ background: "linear-gradient(135deg, #B45309, #F59E0B)" }}
      >
        <div>
          <p className="text-[10px] opacity-80 leading-none">Payslip</p>
          <p className="font-semibold text-xs mt-1">July 2026</p>
        </div>
        <span className="text-[9px] font-semibold uppercase tracking-wider bg-white/20 rounded-full px-1.5 py-0.5">
          Sample
        </span>
      </div>
      <div className="p-4 text-zinc-800">
        <div className="flex justify-between text-xs">
          <span className="text-zinc-500">Gross</span>
          <span className="font-medium tabular-nums">₹45,000</span>
        </div>
        <div className="mt-2 space-y-1">
          {deductions.map(([k, v]) => (
            <div key={k} className="flex justify-between text-xs">
              <span className="text-zinc-400">{k}</span>
              <span className="text-zinc-600 tabular-nums">-₹{v}</span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-3 border-t border-zinc-100 flex items-end justify-between">
          <span className="text-xs font-medium text-zinc-500">Net pay</span>
          <span className="text-lg font-bold text-zinc-900 tabular-nums">₹41,750</span>
        </div>
      </div>
    </div>
  );
}

function Hero() {
  return (
    <section className="relative min-h-[100dvh] flex items-center pt-24 pb-16 overflow-hidden bg-gradient-to-b from-[#FBFAF8] to-white">
      {/* Soft amber ambience */}
      <div
        className="absolute top-0 right-0 w-[36rem] h-[36rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(245,158,11,.12) 0%, transparent 70%)",
          transform: "translate(25%, -25%)",
        }}
      />
      <div
        className="absolute bottom-0 left-0 w-[28rem] h-[28rem] rounded-full pointer-events-none"
        style={{
          background: "radial-gradient(circle, rgba(217,119,6,.06) 0%, transparent 70%)",
          transform: "translate(-30%, 30%)",
        }}
      />
      <div className="relative max-w-[1600px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-14 items-center w-full">
        <div>
          <Reveal>
            <Eyebrow>Multi-company payroll &amp; HR for India</Eyebrow>
          </Reveal>
          <Reveal delay={60}>
            <h1 className="font-serif text-zinc-900 text-5xl md:text-6xl lg:text-[4.25rem] leading-[1.05]">
              Payroll &amp; HR,
              <br />
              <Accent>made effortless.</Accent>
            </h1>
          </Reveal>
          <Reveal delay={120}>
            <p className="text-zinc-600 mt-6 text-base md:text-lg leading-relaxed max-w-[46ch]">
              Run compliant Indian payroll, track attendance, and issue payslips
              for every company you manage, from one dashboard.
            </p>
          </Reveal>
          <Reveal delay={180}>
            <div className="mt-9 flex flex-wrap gap-3">
              <PrimaryLink to="/signup">
                Start free <ArrowRight size={16} />
              </PrimaryLink>
              <SecondaryLink to="#pricing">View pricing</SecondaryLink>
            </div>
          </Reveal>
        </div>
        <Reveal delay={200} className="lg:pl-6">
          <div className="relative">
            {/* Soft product stage */}
            <div className="relative rounded-3xl border border-primary-100 aspect-[4/5] overflow-hidden shadow-card-lift">
              <img
                src={IMG("1552664730-d307ca884978", 900, 1120)}
                alt="Payroll team at work"
                className="absolute inset-0 w-full h-full object-cover"
              />
              <div
                className="absolute inset-0"
                style={{
                  background:
                    "linear-gradient(150deg, rgba(24,24,27,.12) 0%, rgba(180,83,9,.38) 100%)",
                }}
              />
              <div className="absolute top-7 left-7 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur border border-white/60 px-3 py-2 shadow-card">
                <ShieldCheck size={15} className="text-emerald-500" strokeWidth={2} />
                <span className="text-xs font-medium text-zinc-700">Statutory compliant</span>
              </div>
              <div className="absolute bottom-7 left-7 flex items-center gap-2 rounded-xl bg-white/95 backdrop-blur border border-white/60 px-3 py-2 shadow-card">
                <Building2 size={15} className="text-primary-600" strokeWidth={2} />
                <span className="text-xs font-medium text-zinc-700">3 companies, 1 login</span>
              </div>
              <PayslipCard className="absolute bottom-7 right-7 rotate-[-3deg]" />
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function CapabilityBand() {
  const items = [
    { icon: Landmark, title: "Statutory-ready", sub: "EPF, ESIC, PT & TDS" },
    { icon: Clock, title: "Payroll in minutes", sub: "One run, every payslip" },
    { icon: Building2, title: "Multi-company", sub: "From a single login" },
    { icon: BarChart3, title: "MIS & Form-16", sub: "Export-ready reports" },
  ];
  return (
    <section className="bg-white border-y border-zinc-100">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-9 grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-8">
        {items.map((it) => (
          <div key={it.title} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
              <it.icon size={18} className="text-primary-600" strokeWidth={2} />
            </div>
            <div>
              <p className="text-sm font-semibold text-zinc-900 leading-tight">{it.title}</p>
              <p className="text-xs text-zinc-500 mt-0.5">{it.sub}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

// Photographic trust band: a real 3-photo collage beside the value story.
function PhotoTrust() {
  return (
    <section className="bg-white py-24 border-b border-zinc-100">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <h2 className="font-serif text-zinc-900 text-4xl md:text-5xl leading-[1.1]">
            Built for payroll teams <Accent>across India.</Accent>
          </h2>
          <p className="text-zinc-600 mt-5 leading-relaxed max-w-[50ch]">
            From single offices to multi-company groups, ManpowerPay handles the
            attendance, salary and statutory work, so HR teams can spend their
            time on people instead of spreadsheets.
          </p>
          <div className="mt-8 space-y-4">
            {[
              "Set up a company and run payroll the same day",
              "Every payslip reconciles to the paisa",
              "Your data stays isolated per company",
            ].map((p) => (
              <div key={p} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="text-emerald-600" strokeWidth={3} />
                </span>
                <span className="text-sm text-zinc-700 leading-relaxed">{p}</span>
              </div>
            ))}
          </div>
        </Reveal>
        <Reveal delay={120}>
          <div className="grid grid-cols-5 grid-rows-2 gap-4 h-[24rem] md:h-[28rem]">
            <img
              src={IMG("1600880292203-757bb62b4baf", 800, 1000)}
              alt="Team reviewing payroll together"
              loading="lazy"
              className="col-span-3 row-span-2 w-full h-full object-cover rounded-2xl ring-1 ring-primary-100 shadow-card"
            />
            <img
              src={IMG("1521737604893-d14cc237f11d", 640, 480)}
              alt="Colleagues collaborating in an office"
              loading="lazy"
              className="col-span-2 w-full h-full object-cover rounded-2xl ring-1 ring-zinc-200 shadow-card"
            />
            <img
              src={IMG("1497215728101-856f4ea42174", 640, 480)}
              alt="Modern workplace"
              loading="lazy"
              className="col-span-2 w-full h-full object-cover rounded-2xl ring-1 ring-zinc-200 shadow-card"
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function FeatureCard({ icon: Icon, title, body, className = "", accent = false, img }) {
  if (accent) {
    return (
      <div
        className={`relative rounded-2xl overflow-hidden border border-transparent shadow-amber-lg transition-[transform,box-shadow] duration-300 ease-spring hover:-translate-y-1 ${className}`}
      >
        {img && (
          <img
            src={IMG(img, 1000, 700)}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background: img
              ? "linear-gradient(135deg, rgba(146,64,14,.94) 0%, rgba(217,119,6,.86) 100%)"
              : "linear-gradient(135deg, #B45309 0%, #F59E0B 100%)",
          }}
        />
        <div className="relative p-6">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-white/20">
            <Icon size={20} strokeWidth={2} className="text-white" />
          </div>
          <h3 className="text-white font-semibold text-lg tracking-tight">{title}</h3>
          <p className="mt-2 text-sm leading-relaxed text-amber-50/95">{body}</p>
        </div>
      </div>
    );
  }
  return (
    <div
      className={`rounded-2xl border bg-white border-zinc-200 hover:border-zinc-300 hover:shadow-card-hover overflow-hidden transition-[transform,box-shadow,border-color] duration-300 ease-spring hover:-translate-y-1 ${className}`}
    >
      {img && (
        <img
          src={IMG(img, 800, 400)}
          alt=""
          aria-hidden="true"
          loading="lazy"
          className="w-full h-36 object-cover"
        />
      )}
      <div className="p-6">
        <div className="w-11 h-11 rounded-xl flex items-center justify-center mb-4 bg-primary-50 border border-primary-100">
          <Icon size={20} strokeWidth={2} className="text-primary-600" />
        </div>
        <h3 className="font-semibold text-lg tracking-tight text-zinc-900">{title}</h3>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600">{body}</p>
      </div>
    </div>
  );
}

function Features() {
  return (
    <section id="features" className="bg-[#FBFAF8] py-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <Reveal>
          <Eyebrow>Everything payroll needs</Eyebrow>
          <h2 className="font-serif text-zinc-900 text-4xl md:text-5xl leading-[1.1] max-w-2xl">
            One platform, from attendance to payslip.
          </h2>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-5">
          <Reveal className="md:col-span-2">
            <FeatureCard
              accent
              img="1454165804606-c3d57bc86b40"
              icon={ShieldCheck}
              title="Compliant by default"
              body="EPF, ESIC, Professional Tax and TDS are computed on current slabs and ceilings every run. Tune the rates per company when your rules differ."
              className="h-full"
            />
          </Reveal>
          <Reveal delay={80}>
            <FeatureCard
              img="1600880292089-90a7e086ee0c"
              icon={CalendarCheck}
              title="Attendance & leave"
              body="Mark attendance, approve leave, and feed both straight into the payroll run."
              className="h-full"
            />
          </Reveal>
          <Reveal delay={40}>
            <FeatureCard
              icon={FileText}
              title="Payslips & Form-16"
              body="Generate branded payslips and Form-16 in one click, stored and shareable."
              className="h-full"
            />
          </Reveal>
          <Reveal delay={80}>
            <FeatureCard
              icon={SlidersHorizontal}
              title="Configurable pay"
              body="Build earnings and deductions as reusable components per salary template."
              className="h-full"
            />
          </Reveal>
          <Reveal delay={120}>
            <FeatureCard
              icon={Building2}
              title="Truly multi-company"
              body="Each company's data stays isolated. Switch context without switching logins."
              className="h-full"
            />
          </Reveal>
        </div>
      </div>
    </section>
  );
}

function Compliance() {
  const points = [
    "EPF at 12% with the ₹15,000 wage ceiling built in",
    "ESIC employee 0.75% / employer 3.25% up to the gross threshold",
    "Professional Tax on your state's slabs",
    "TDS aggregated across the financial year",
  ];
  return (
    <section id="compliance" className="bg-white py-24 border-y border-zinc-100">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12 grid lg:grid-cols-2 gap-14 items-center">
        <Reveal>
          <h2 className="font-serif text-zinc-900 text-4xl md:text-5xl leading-[1.1]">
            Indian statutory rules, <Accent>handled.</Accent>
          </h2>
          <p className="text-zinc-600 mt-5 leading-relaxed max-w-[52ch]">
            The defaults follow current Indian regulation, so a payroll run is
            correct out of the box. Every rate, ceiling and threshold stays
            editable per company.
          </p>
          <ul className="mt-8 space-y-4">
            {points.map((p) => (
              <li key={p} className="flex items-start gap-3">
                <span className="mt-0.5 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
                  <Check size={13} className="text-emerald-600" strokeWidth={3} />
                </span>
                <span className="text-sm text-zinc-700 leading-relaxed">{p}</span>
              </li>
            ))}
          </ul>
        </Reveal>
        <Reveal delay={120}>
          <div className="rounded-2xl bg-[#FBFAF8] border border-zinc-200 p-6">
            <p className="text-2xs font-semibold uppercase tracking-wider text-zinc-400">
              Statutory rates
            </p>
            <div className="mt-4 divide-y divide-zinc-200">
              {[
                ["Employee PF", "12% of basic"],
                ["Employer PF", "12% of basic"],
                ["Employee ESIC", "0.75% of gross"],
                ["Employer ESIC", "3.25% of gross"],
                ["EPF wage ceiling", "₹15,000"],
                ["ESIC gross threshold", "₹21,000"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-3">
                  <span className="text-sm text-zinc-500">{k}</span>
                  <span className="text-sm font-semibold text-zinc-900 tabular-nums">{v}</span>
                </div>
              ))}
            </div>
            <p className="mt-4 text-xs text-zinc-400">
              Editable per company in Statutory Rules.
            </p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      icon: Building2,
      title: "Create your company",
      body: "Sign up, add your company profile and statutory codes. Defaults are ready for India.",
      img: "1556761175-b413da4baf72",
    },
    {
      icon: Users,
      title: "Add employees & attendance",
      body: "Import your team, set salary templates, and mark attendance or leave.",
      img: "1521737604893-d14cc237f11d",
    },
    {
      icon: IndianRupee,
      title: "Run payroll",
      body: "One run computes every salary, deduction and payslip, ready to share.",
      img: "1542744173-8e7e53415bb0",
    },
  ];
  return (
    <section className="relative overflow-hidden bg-[#FBFAF8] py-24">
      <WaveBg />
      <div className="relative z-10 max-w-[1600px] mx-auto px-6 lg:px-12">
        <Reveal>
          <h2 className="font-serif text-zinc-900 text-4xl md:text-5xl leading-[1.1] max-w-xl">
            From signup to first payslip in an afternoon.
          </h2>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-3 gap-8">
          {steps.map((s, i) => (
            <Reveal key={s.title} delay={i * 80}>
              <div className="group rounded-2xl bg-white border border-zinc-200 shadow-card overflow-hidden transition-[transform,box-shadow] duration-300 ease-spring hover:-translate-y-1 hover:shadow-card-hover">
                <div className="relative h-44 overflow-hidden">
                  <img
                    src={IMG(s.img, 720, 440)}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 ease-spring group-hover:scale-105"
                  />
                  <span className="absolute top-3 left-4 font-serif text-4xl text-white tabular-nums drop-shadow-[0_2px_8px_rgba(0,0,0,.4)]">
                    0{i + 1}
                  </span>
                </div>
                <div className="p-6">
                  <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center">
                    <s.icon size={20} className="text-primary-600" strokeWidth={2} />
                  </div>
                  <h3 className="mt-4 text-zinc-900 font-semibold text-lg tracking-tight">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm text-zinc-600 leading-relaxed">
                    {s.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Security & trust. Every claim here maps to a shipped capability; no
// certification badges are shown because none are held yet.
function Security() {
  const points = [
    {
      icon: Lock,
      title: "Encrypted at rest",
      body: "Aadhaar, PAN and bank account numbers are encrypted with AES-256-GCM before they reach the database.",
    },
    {
      icon: Building2,
      title: "Isolated per company",
      body: "Every query is scoped to your company at the data layer, so no tenant can ever read another's records.",
    },
    {
      icon: KeyRound,
      title: "Role-based access",
      body: "Admins, supervisors and employees each see exactly what their role allows, nothing more.",
    },
    {
      icon: History,
      title: "Full audit trail",
      body: "Sensitive actions are logged with who did them and when, ready for internal review.",
    },
  ];
  return (
    <section id="security" className="bg-white py-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <Reveal>
          <h2 className="font-serif text-zinc-900 text-4xl md:text-5xl leading-[1.1] max-w-2xl">
            Treated like payroll data <Accent>should be.</Accent>
          </h2>
          <p className="text-zinc-600 mt-5 leading-relaxed max-w-[52ch]">
            Salary and identity data are the most sensitive records a company
            holds. The platform is built around that fact.
          </p>
        </Reveal>
        <div className="mt-14 grid md:grid-cols-2 gap-x-14 gap-y-12">
          {points.map((p, i) => (
            <Reveal key={p.title} delay={i * 60}>
              <div className="border-t border-zinc-200 pt-6 flex items-start gap-4">
                <div className="w-11 h-11 rounded-xl bg-primary-50 border border-primary-100 flex items-center justify-center flex-shrink-0">
                  <p.icon size={20} className="text-primary-600" strokeWidth={2} />
                </div>
                <div>
                  <h3 className="font-semibold text-lg tracking-tight text-zinc-900">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-relaxed text-zinc-600 max-w-[48ch]">
                    {p.body}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

function Faq() {
  const items = [
    {
      q: "Is my company's data separate from other companies?",
      a: "Yes. Every record carries your company's identity and every query is filtered by it automatically at the data layer. One company can never see another's employees, salaries or documents.",
    },
    {
      q: "What happens when statutory rates change?",
      a: "The platform ships with current Indian defaults (EPF, ESIC, PT, TDS). Every rate, ceiling and threshold is editable per company under Statutory Rules, so you can apply a change the day it is announced.",
    },
    {
      q: "Do I need a credit card to start?",
      a: "No. The free plan covers up to 10 employees with full payroll, attendance and compliance. You only pay when you outgrow it.",
    },
    {
      q: "How do my employees get access?",
      a: "When you add an employee, the system issues a one-time temporary password. They must set their own password on first login, then they get a self-service portal for payslips, attendance and leave.",
    },
    {
      q: "Can I change plans later?",
      a: "Yes. Upgrades and downgrades happen from Billing & Plan inside the app. Payments are processed by Razorpay; card details never touch our servers.",
    },
  ];
  return (
    <section className="bg-white py-24">
      <div className="max-w-3xl mx-auto px-6">
        <Reveal>
          <h2 className="font-serif text-zinc-900 text-4xl md:text-5xl leading-[1.1] text-center">
            Common questions
          </h2>
        </Reveal>
        <Reveal delay={80}>
          <div className="mt-12 divide-y divide-zinc-200 border-y border-zinc-200">
            {items.map((item) => (
              <details key={item.q} className="group py-5">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none [&::-webkit-details-marker]:hidden">
                  <span className="font-semibold text-zinc-900">{item.q}</span>
                  <Plus
                    size={18}
                    className="text-primary-600 flex-shrink-0 transition-transform duration-200 group-open:rotate-45"
                    strokeWidth={2.5}
                  />
                </summary>
                <p className="mt-3 text-sm text-zinc-600 leading-relaxed max-w-[62ch]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

function Testimonials() {
  return (
    <section className="bg-white py-24 border-y border-zinc-100">
      <div className="max-w-3xl mx-auto px-6 text-center">
        <Reveal>
          <figure>
            <blockquote className="font-serif text-2xl md:text-3xl text-zinc-800 leading-snug">
              “ManpowerPay runs payroll for our site workforce across projects.
              The monthly cycle closes days earlier, and the statutory figures
              match our CA's every time.”
            </blockquote>
            <figcaption className="mt-8 flex items-center justify-center gap-3">
              <span
                className="w-11 h-11 rounded-full flex items-center justify-center text-white font-bold"
                style={{ background: "linear-gradient(135deg, #B45309, #F59E0B)" }}
              >
                S
              </span>
              <span className="text-left">
                <span className="block text-sm font-semibold text-zinc-900">
                  CEO, Shri Sainath Enterprises Pvt. Ltd.
                </span>
                <span className="block text-xs text-zinc-500">
                  Engineering contractor, Ankleshwar, Gujarat
                </span>
              </span>
            </figcaption>
          </figure>
        </Reveal>
      </div>
    </section>
  );
}

function PricingCard({ plan }) {
  return (
    <div
      className={`relative rounded-2xl p-7 flex flex-col border transition-[transform,box-shadow,border-color] duration-300 ease-spring hover:-translate-y-1 ${
        plan.featured
          ? "border-primary-500 bg-white shadow-amber-lg"
          : "border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-card-hover"
      }`}
    >
      {plan.featured && (
        <span className="absolute -top-3 left-7 text-2xs font-bold uppercase tracking-wider bg-primary-600 text-white px-2.5 py-1 rounded-full">
          Most popular
        </span>
      )}
      <h3 className="text-zinc-900 font-semibold text-lg">{plan.name}</h3>
      <div className="mt-3 flex items-end gap-1">
        {plan.price === 0 ? (
          <span className="font-serif text-4xl text-zinc-900">Free</span>
        ) : (
          <>
            <span className="font-serif text-4xl text-zinc-900 tabular-nums">
              ₹{plan.price.toLocaleString("en-IN")}
            </span>
            <span className="text-sm text-zinc-400 mb-1.5">/month</span>
          </>
        )}
      </div>
      <p className="mt-1 text-sm text-zinc-500">Up to {plan.limit} employees</p>
      <ul className="mt-6 space-y-3 flex-1">
        {plan.perks.map((perk) => (
          <li key={perk} className="flex items-start gap-2.5 text-sm text-zinc-700">
            <Check size={15} className="text-emerald-600 mt-0.5 flex-shrink-0" strokeWidth={2.5} />
            {perk}
          </li>
        ))}
      </ul>
      <PrimaryLink to="/signup" className="mt-7 w-full">
        Start free
      </PrimaryLink>
    </div>
  );
}

function Pricing() {
  const plans = [
    {
      name: "Free",
      price: 0,
      limit: 10,
      perks: ["Payroll & attendance", "Statutory compliance", "Standard payslips"],
    },
    {
      name: "Starter",
      price: 999,
      limit: 50,
      featured: true,
      perks: ["Everything in Free", "Clean (un-watermarked) payslips", "Bulk payslip export"],
    },
    {
      name: "Growth",
      price: 2999,
      limit: 500,
      perks: ["Everything in Starter", "Higher employee limits", "Priority support"],
    },
  ];
  return (
    <section id="pricing" className="bg-[#FBFAF8] py-24">
      <div className="max-w-[1600px] mx-auto px-6 lg:px-12">
        <Reveal>
          <Eyebrow>Simple, transparent pricing</Eyebrow>
          <h2 className="font-serif text-zinc-900 text-4xl md:text-5xl leading-[1.1]">
            Start free. Upgrade as you grow.
          </h2>
          <p className="text-zinc-600 mt-3">
            Up to 10 employees free, forever. No credit card required.
          </p>
        </Reveal>
        <div className="mt-12 grid md:grid-cols-3 gap-6 items-stretch">
          {plans.map((p, i) => (
            <Reveal key={p.name} delay={i * 80} className="h-full">
              <PricingCard plan={p} />
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

// Deliberate dark closing block (CTA + footer) for contrast and punch.
function ClosingDark() {
  return (
    <div className="bg-gradient-to-b from-[#18181B] to-[#09090B]">
      <section className="relative py-28 overflow-hidden">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[40rem] h-[24rem] rounded-full pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(217,119,6,.16) 0%, transparent 70%)" }}
        />
        <div className="relative max-w-3xl mx-auto px-5 text-center">
          <Reveal>
            <h2 className="font-serif text-white text-4xl md:text-6xl leading-[1.05]">
              Ready to make payroll <Accent>effortless?</Accent>
            </h2>
            <p className="text-zinc-400 mt-5 max-w-md mx-auto">
              Set up your company and run your first payroll today.
            </p>
            <div className="mt-9 flex justify-center">
              <PrimaryLink to="/signup" className="!px-7 !py-3.5 !text-base">
                Start free <ArrowRight size={18} />
              </PrimaryLink>
            </div>
          </Reveal>
        </div>
      </section>
      <footer className="border-t border-white/5">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-12 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <Logo light />
            <p className="text-zinc-500 text-sm mt-3 max-w-xs">
              Payroll, attendance and statutory compliance for Indian businesses.
            </p>
          </div>
          <div className="flex items-center gap-6 text-sm">
            <a href="#features" className="text-zinc-400 hover:text-white transition-colors">
              Features
            </a>
            <a href="#pricing" className="text-zinc-400 hover:text-white transition-colors">
              Pricing
            </a>
            <Link to="/login" className="text-zinc-400 hover:text-white transition-colors">
              Sign in
            </Link>
          </div>
        </div>
        <div className="border-t border-white/5">
          <p className="max-w-[1600px] mx-auto px-6 lg:px-12 py-5 text-xs text-zinc-600">
            © 2026 ManpowerPay HMS. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function LandingPage() {
  return (
    <div className="bg-white min-h-screen">
      <Nav />
      <main>
        <Hero />
        <CapabilityBand />
        <PhotoTrust />
        <Features />
        <Compliance />
        <HowItWorks />
        <Security />
        <Testimonials />
        <Pricing />
        <Faq />
      </main>
      <ClosingDark />
    </div>
  );
}
