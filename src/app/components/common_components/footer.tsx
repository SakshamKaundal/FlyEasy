import React from 'react';

const Footer = () => {
  return (
    <footer className="relative bg-black text-white py-8 mt-auto overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black via-gray-900 to-black opacity-50 animate-pulse"></div>
      
      <div className="absolute inset-0 opacity-5">
        <div className="h-full w-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.5)_1px,transparent_0)] bg-[length:20px_20px]"></div>
      </div>
      
      <div className="relative container mx-auto px-4 text-center">
        <div className="inline-block">
          <p className="text-sm md:text-base lg:text-lg font-medium tracking-wide">
            Copyright © 
            <span className="ml-2 font-bold bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
              Saksham Kaundal
            </span>
          </p>
          
          <div className="mt-2 mx-auto w-24 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-40"></div>
        </div>
      </div>
      
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-96 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-20"></div>
    </footer>
  );
};

export default Footer;