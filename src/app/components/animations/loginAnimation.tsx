'use client';

import Lottie from 'lottie-react';
import loginAnimation from "@/app/components/asset/lottieJson/loginFlight.json";

const LoginAnimation = () => {
  return (
    <div className="w-full h-full flex items-center justify-center p-4">
      <Lottie
        animationData={loginAnimation}
        loop
        style={{
          width: '100%',
          maxWidth: '400px',
          height: 'auto',
          maxHeight: '80vh',
          objectFit: 'contain',
        }}
      />
    </div>
  );
};

export default LoginAnimation;