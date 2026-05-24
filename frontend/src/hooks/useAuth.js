import useAuthStore from '../store/authStore';
import { useNavigate } from 'react-router-dom';

export function useAuth() {
  const { user, token, login, logout } = useAuthStore();
  const navigate = useNavigate();

  const signOut = () => {
    logout();
    navigate('/login');
  };

  const isAdmin = user?.role === 'admin';
  const isSupervisor = user?.role === 'supervisor';
  const isEmployee = user?.role === 'employee';

  return { user, token, login, logout: signOut, isAdmin, isSupervisor, isEmployee };
}
