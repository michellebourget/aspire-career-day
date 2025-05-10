import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const useRoleRedirect = (role) => {
  const navigate = useNavigate();

  useEffect(() => {
    if (!role) return;

    if (role === 'admin') {
      navigate('/admin');
    } else if (role === 'teacher') {
      navigate('/teacher');
    } else {
      navigate('/');
    }
  }, [role, navigate]);
};

export default useRoleRedirect;
