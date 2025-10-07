import React, { useEffect, useState } from 'react';
import { useNavigate, Outlet } from 'react-router-dom';
import Loginpage from './components/Loginpage';

function App() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const userAgent =
        typeof window.navigator === "undefined" ? "" : navigator.userAgent;
      const mobileRegExp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Nokia/i;
      setIsMobile(mobileRegExp.test(userAgent));
    };
    checkMobile();
  }, []);

  return (
    <>
      {isMobile ? (
        <div className="text-center text-xl font-bold text-red-500 mt-8">
          Sorry, this page is not available on mobile devices.
        </div>
      ) : (
        <div className="h-screen w-screen lg:block">
          <Loginpage />
        </div>
      )}
    </>
  );
}

export default App;