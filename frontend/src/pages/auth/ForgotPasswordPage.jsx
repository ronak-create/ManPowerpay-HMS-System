import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import api from '../../api/axios';

export default function ForgotPasswordPage() {
  const { register, handleSubmit } = useForm();
  const [sent, setSent] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async ({ email }) => {
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('OTP sent! Check your email.');
      setTimeout(() => navigate(`/reset-password?email=${encodeURIComponent(email)}`), 2000);
    } catch {
      toast.error('Something went wrong');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
        <h2 className="text-xl font-bold text-amber-700 mb-2">Reset Password</h2>
        <p className="text-gray-500 text-sm mb-6">Enter your email and we'll send an OTP.</p>
        {!sent ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <input
              type="email"
              {...register('email', { required: true })}
              placeholder="Email address"
              className="w-full border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            />
            <button type="submit" className="w-full bg-amber-600 text-white py-2.5 rounded-lg font-semibold">Send OTP</button>
          </form>
        ) : (
          <p className="text-green-600 font-medium">OTP sent! Redirecting...</p>
        )}
        <a href="/login" className="block text-center text-sm text-amber-700 mt-4 hover:underline">Back to Login</a>
      </div>
    </div>
  );
}
