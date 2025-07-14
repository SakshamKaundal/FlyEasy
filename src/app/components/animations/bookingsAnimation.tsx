'use client';
import Lottie from 'lottie-react';
import loginAnimation from "@/app/components/asset/lottieJson/flightBookings.json"



const Bookings= () => {
  return (
    <div className='mobile-container'>
      <Lottie
        animationData={loginAnimation}
        loop={true}
        style={{ width: 500, height: 500 }}
      />
 

    </div>
  );
};

export default Bookings;

