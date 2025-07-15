'use client';
import Lottie from 'lottie-react';
import loginAnimation from "@/app/components/asset/lottieJson/searchingFlights.json"

const SearchFlights = () => {
  return (
    <div className='mobile-container w-full flex justify-center items-center p-4'>
      <div className='w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl'>
        <Lottie
          animationData={loginAnimation}
          loop={true}
          style={{ 
            width: '100%', 
            height: 'auto',
            maxWidth: '500px'
          }}
        />
      </div>
    </div>
  );
};

export default SearchFlights;