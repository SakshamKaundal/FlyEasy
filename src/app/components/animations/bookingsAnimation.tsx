'use client';
import Lottie from 'lottie-react';
import loginAnimation from "@/app/components/asset/lottieJson/searchingFlights.json"
import boyRunning from "@/app/components/asset/lottieJson/Boy_Running.json"


const Bookings= () => {
  return (
    <div className="w-full flex justify-center items-center py-8 px-4">
      <style jsx>{`
        .mobile-animation {
          display: block;
        }
        .desktop-animation {
          display: none;
        }
        
        @media (min-width: 1024px) {
          .mobile-animation {
            display: none;
          }
          .desktop-animation {
            display: block;
          }
        }
      `}</style>
      
      <div className="mobile-animation">
        <Lottie
          animationData={boyRunning}
          loop={true}
          style={{
            width: '280px',
            height: '280px'
          }}
        />
      </div>

      <div className="desktop-animation">
        <Lottie
          animationData={loginAnimation}
          loop={true}
          style={{
            width: '400px',
            height: '400px'
          }}
        />
      </div>
    </div>
  );
};

export default Bookings;



