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
      navigate({ admin: '/admin', supervisor: '/supervisor', employee: '/employee' }[user.role] || '/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-primary flex-col justify-between p-12 relative overflow-hidden">
        {/* Decorative circles */}
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/5 rounded-full" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 bg-white/5 rounded-full" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-white/3 rounded-full" />

        <div className="relative">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
              <span className="text-white font-black">MP</span>
            </div>
            <span className="text-white font-bold text-lg">ManpowerPay HMS</span>
          </div>
        </div>

        <div className="relative">
          <h1 className="text-4xl font-black text-white leading-tight">
            Manage your<br />workforce with<br />
            <span className="text-blue-300">confidence.</span>
          </h1>
          <p className="text-white/60 mt-4 text-sm leading-relaxed">
            Complete HR & Payroll platform — attendance tracking, payroll processing,
            statutory compliance, and more.
          </p>

          <div className="flex gap-6 mt-8">
            {[['Payroll', 'Auto-calculated'], ['Compliance', 'EPF/ESIC/PT'], ['Reports', 'MIS ready']].map(([t, s]) => (
              <div key={t}>
                <div className="text-white font-bold text-sm">{t}</div>
                <div className="text-white/50 text-xs">{s}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <p className="text-white/30 text-xs">© 2026 ManpowerPay HMS. All rights reserved.</p>
        </div>
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
