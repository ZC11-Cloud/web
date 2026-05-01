import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';

interface AdminGuardProps {
  children: React.ReactNode;
}

const AdminGuard = ({ children }: AdminGuardProps) => {
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();

  useEffect(() => {
    if (!isLoggedIn) {
      return;
    }
    if (user && user.role !== 1) {
      navigate('/profile', { replace: true });
    }
  }, [isLoggedIn, user, navigate]);

  if (!isLoggedIn || !user || user.role !== 1) {
    return null;
  }

  return <>{children}</>;
};

export default AdminGuard;
