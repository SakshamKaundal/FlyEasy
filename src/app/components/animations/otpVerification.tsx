'use client';
import Lottie from 'lottie-react';
import loginAnimation from "@/app/components/asset/lottieJson/otpAnimation.json"



const OtpVerification= () => {
  return (
    <div>
      <Lottie
        animationData={loginAnimation}
        loop={true}
        style={{ width: 200, height: 150 }}
      />
 

    </div>
  );
};

export default OtpVerification;

