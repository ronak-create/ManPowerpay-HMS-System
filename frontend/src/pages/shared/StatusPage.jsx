import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, Home, Compass, ShieldOff } from 'lucide-react';
import BrandGlyph from '../../components/BrandGlyph';

/* Full-screen status page (404 / 403) in the neumorphic theme: the status code
   is extruded from the ivory surface, actions are soft raised/pressed controls. */
function StatusPage({ code, Icon, title, message, primaryTo = '/' }) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-neu flex flex-col items-center justify-center px-6 text-center">
      <div className="flex items-center gap-2 mb-10">
        <BrandGlyph size={30} />
        <span className="font-semibold text-zinc-800 tracking-tight">ManpowerPay HMS</span>
      </div>

      {/* Extruded status code with a recessed icon badge */}
      <div className="relative">
        <span
          className="font-serif tabular-nums leading-none select-none text-transparent"
          style={{
            fontSize: 'clamp(6rem, 22vw, 11rem)',
            background: 'linear-gradient(135deg, #B45309, #F59E0B)',
            WebkitBackgroundClip: 'text',
            backgroundClip: 'text',
            filter: 'drop-shadow(6px 8px 10px rgba(176,148,112,.35))',
          }}
        >
          {code}
        </span>
        <span
          className="absolute -top-2 -right-2 w-14 h-14 rounded-2xl bg-neu shadow-neu flex items-center justify-center text-primary-600"
          aria-hidden="true"
        >
          <Icon size={24} strokeWidth={2} />
        </span>
      </div>

      <h1 className="mt-4 text-2xl md:text-3xl font-serif text-zinc-900">{title}</h1>
      <p className="mt-3 text-sm text-zinc-500 max-w-md leading-relaxed">{message}</p>

      <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
        <button onClick={() => navigate(-1)} className="btn-secondary">
          <ArrowLeft size={16} /> Go back
        </button>
        <Link to={primaryTo} className="btn-primary">
          <Home size={16} /> Back to home
        </Link>
      </div>
    </div>
  );
}

export function NotFound() {
  return (
    <StatusPage
      code="404"
      Icon={Compass}
      title="Page not found"
      message="The page you are looking for doesn't exist or may have moved. Check the address, or head back to a familiar place."
    />
  );
}

export function Unauthorized() {
  return (
    <StatusPage
      code="403"
      Icon={ShieldOff}
      title="Access denied"
      message="You don't have permission to view this page. If you think this is a mistake, contact your company administrator."
    />
  );
}

export default StatusPage;
