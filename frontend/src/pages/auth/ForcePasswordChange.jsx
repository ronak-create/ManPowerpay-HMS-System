import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';
import api from '../../api/axios';
import useAuthStore from '../../store/authStore';

// Shown when a user logs in with a temporary password (passwordResetRequired).
// They cannot reach the app until they set a new password.
export default function ForcePasswordChange() {
  const { user, token, login } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data) => {
    if (data.newPassword !== data.confirm) return toast.error('Passwords do not match');
    setLoading(true);
    try {
      await api.post('/auth/change-password', {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      // Clear the flag locally so the gate lets us through.
      login({ ...user, passwordResetRequired: false }, token);
      toast.success('Password updated');
      navigate(user?.role === 'admin' ? '/admin' : '/employee', { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface p-6">
      <div className="w-full max-w-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
            <ShieldCheck size={20} />
          </div>
          <div>
            <h1 className="font-bold text-gray-900">Set a new password</h1>
            <p className="text-xs text-gray-500">You're using a temporary password. Choose a new one to continue.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Temporary Password</label>
            <input type="password" {...register('currentPassword', { required: true })} className="input-base" placeholder="Current / temporary password" autoComplete="current-password" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">New Password</label>
            <div className="relative">
              <input
                type={showPass ? 'text' : 'password'}
                {...register('newPassword', { required: true, minLength: { value: 8, message: 'Min 8 characters' } })}
                className="input-base pr-10"
                placeholder="New password"
                autoComplete="new-password"
              />
              <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs text-gray-400 mt-1">At least 8 characters with an uppercase, lowercase, number, and symbol.</p>
            {errors.newPassword && <p className="text-red-500 text-xs mt-1">{errors.newPassword.message}</p>}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1.5">Confirm New Password</label>
            <input type="password" {...register('confirm', { required: true })} className="input-base" placeholder="Repeat new password" autoComplete="new-password" />
          </div>
          <button type="submit" disabled={loading} className="btn-primary w-full justify-center">
            <Lock size={15} /> {loading ? 'Updating…' : 'Update Password'}
          </button>
        </form>
      </div>
    </div>
  );
}
