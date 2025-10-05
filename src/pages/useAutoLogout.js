import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

const useAutoLogout = (timeout = 3600000) => { // 1h = 3600000 ms
  const navigate = useNavigate();
  const timer = useRef(null);

  const resetTimer = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      localStorage.removeItem('user');
      navigate('/login');
    }, timeout);
  };

  useEffect(() => {
    const events = ['mousemove', 'keydown', 'click', 'scroll'];
    events.forEach((event) => window.addEventListener(event, resetTimer));

    resetTimer(); // initialise le timer au montage

    return () => {
      events.forEach((event) => window.removeEventListener(event, resetTimer));
      clearTimeout(timer.current);
    };
  }, []);
};

export default useAutoLogout;
