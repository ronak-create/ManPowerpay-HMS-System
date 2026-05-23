import { useForm } from 'react-hook-form';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../../api/axios';

export default function ResetPasswordPage() {
  const { register, handleSubmit, watch } = useForm();
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const email = params.get('email') || '';

  const onSubmit = async ({ otp, newPassword }) => {
    try {
      await api.post('/auth/reset-password', { email, otp, newPassword });
      toast.success('Password reset! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-primary mb-6">Enter New Password</h2>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <input {...register('otp', { required: true })} placeholder="6-digit OTP" className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <input type="password" {...register('newPassword', { required: true, minLength: 8 })} placeholder="New Password (min 8 chars)" className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <input type="password" {...register('confirm', { validate: v => v === watch('newPassword') || 'Passwords do not match' })} placeholder="Confirm Password" className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40" />
          <button type="submit" className="w-full bg-primary text-white py-2.5 rounded-lg font-semibold">Reset Password</button>
        </form>
      </div>
    </div>
  );
}
