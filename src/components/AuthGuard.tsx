import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '../store/useUserStore';
import userApi from '../api/userApi';

interface AuthGuardProps {
  children: React.ReactNode;
}

const AuthGuard = ({ children }: AuthGuardProps) => {
  const navigate = useNavigate();
  const { isLoggedIn, login, setLoading } = useUserStore();

  useEffect(() => {
    const checkLoginStatus = async () => {
      setLoading(true);
      try {
        // 检查localStorage中是否有token
        const token = localStorage.getItem('token');
        if (token) {
          // 获取当前用户信息
          const userInfo = await userApi.getCurrentUser();
          login(userInfo.data);
        } else {
          // 没有token，跳转到登录页
          navigate('/login');
        }
      } catch {
        // 获取用户信息失败，清除token并跳转到登录页
        localStorage.removeItem('token');
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    // 如果未登录，检查登录状态
    if (!isLoggedIn) {
      checkLoginStatus();
    }
  }, [isLoggedIn, login, navigate, setLoading]);

  // 如果未登录，不渲染子组件
  if (!isLoggedIn) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;
