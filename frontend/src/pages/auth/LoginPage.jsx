import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, LogIn } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function LoginPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/login', data);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success(`Welcome, ${user.name}!`);
      navigate({ admin: '/admin', employee: '/employee' }[user.role] || '/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-[45%] flex-col justify-between p-12 relative overflow-hidden"
           style={{ background: '#18181B' }}>
        {/* Noise texture overlay */}
        <div className="absolute inset-0 opacity-[0.03]"
             style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }} />

        {/* Amber glow blob */}
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(217,119,6,.15) 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />
        <div className="absolute top-0 right-0 w-60 h-60 rounded-full pointer-events-none"
             style={{ background: 'radial-gradient(circle, rgba(245,158,11,.08) 0%, transparent 70%)', transform: 'translate(20%, -20%)' }} />

        <div className="relative">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)' }}>
              <span className="text-white font-bold text-sm">MP</span>
            </div>
            <span className="text-white font-semibold text-base tracking-tight">ManpowerPay HMS</span>
          </div>
        </div>

        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-widest mb-4"
             style={{ color: 'rgba(217,119,6,.7)' }}>Trusted by 500+ companies</p>
          <h1 className="text-4xl font-semibold text-white leading-[1.15] tracking-tight">
            Payroll &amp; HR<br />
            <span style={{ background: 'linear-gradient(135deg, #D97706, #F59E0B)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>
              made effortless.
            </span>
          </h1>
          <p className="text-zinc-400 mt-4 text-sm leading-relaxed max-w-xs font-normal">
            Attendance, payroll processing, statutory compliance, and payslips — all in one platform.
          </p>

          <div className="flex gap-5 mt-10">
            {[['Payroll', 'Auto-calculated'], ['Compliance', 'EPF/ESIC/PT'], ['Reports', 'MIS ready']].map(([t, s]) => (
              <div key={t}>
                <div className="text-white font-medium text-sm">{t}</div>
                <div className="text-zinc-500 text-xs mt-0.5">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-zinc-600 text-xs">© 2026 ManpowerPay HMS. All rights reserved.</p>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="text-white font-black">MP</span>
            </div>
            <span className="font-bold text-gray-900">ManpowerPay HMS</span>
          </div>

          <h2 className="text-2xl font-black text-gray-900">Sign in to your account</h2>
          <p className="text-gray-500 text-sm mt-1 mb-8">Enter your credentials to continue</p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Email Address</label>
              <input
                type="email"
                {...register('email', { required: 'Email is required' })}
                className={`input-base ${errors.email ? 'input-error' : ''}`}
                placeholder="you@company.com"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.email.message}</p>}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider">Password</label>
                <a href="/forgot-password" className="text-xs text-primary font-semibold hover:underline">Forgot password?</a>
              </div>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  {...register('password', { required: 'Password is required' })}
                  className={`input-base pr-10 ${errors.password ? 'input-error' : ''}`}
                  placeholder="••••••••"
                  autoComplete="current-password"
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password.message}</p>}
            </div>

            <button type="submit" disabled={loading}
              className="btn-primary w-full justify-center py-3 text-base mt-2">
              {loading
                ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Signing in...</>
                : <><LogIn size={16} /> Sign In</>
              }
            </button>
          </form>

          <div className="mt-8 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-xs font-semibold text-gray-500 mb-2">Demo Credentials</p>
            <p className="text-xs text-gray-600 font-mono">admin@manpowerpay.com / Admin@1234</p>
          </div>
        </div>
      </div>
    </div>
  );
}
