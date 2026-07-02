import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Building2 } from 'lucide-react';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

export default function SignupPage() {
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const { login } = useAuthStore();
  const navigate = useNavigate();

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await api.post('/auth/register', data);
      const { token, user } = res.data.data;
      login(user, token);
      toast.success('Welcome to ManpowerPay!');
      navigate('/admin');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Signup failed');
    } finally {
      setLoading(false);
    }
  };

  const field = (name, label, opts = {}) => (
    <div>
      <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">{label}</label>
      <input {...register(name, { required: `${label} is required`, ...opts.rules })} type={opts.type || 'text'} className="input-base" placeholder={opts.placeholder} autoComplete={opts.autoComplete} />
      {errors[name] && <p className="text-red-500 text-xs mt-1.5">⚠ {errors[name].message}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #B45309, #F59E0B)' }}>
            <Building2 size={20} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Create your company account</h1>
            <p className="text-xs text-gray-500">Start free — up to 10 employees.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {field('companyName', 'Company Name', { placeholder: 'Acme Pvt Ltd' })}
          <div className="grid grid-cols-2 gap-4">
            {field('adminName', 'Your Name', { placeholder: 'Jane Doe' })}
            {field('adminMobile', 'Mobile', { placeholder: '10-digit', rules: { pattern: { value: /^\d{10}$/, message: '10 digits' } } })}
          </div>
          {field('adminEmail', 'Work Email', { type: 'email', placeholder: 'you@company.com', autoComplete: 'email' })}
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                {...register('password', { required: 'Password is required', minLength: { value: 8, message: 'Min 8 characters' } })}
                className="input-base pr-10"
                placeholder="Strong password"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">At least 8 characters with an uppercase, lowercase, number, and symbol.</p>
            {errors.password && <p className="text-red-500 text-xs mt-1.5">⚠ {errors.password.message}</p>}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3 text-base mt-2">
            {loading ? 'Creating…' : 'Create account'}
          </button>
        </form>

        <p className="text-sm text-gray-500 text-center mt-6">
          Already have an account? <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
