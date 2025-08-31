'use client';

import { useEffect, useState } from "react";
import Image from 'next/image';

const Header = () => {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("email");
    setEmail(storedEmail);
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 h-16 shadow-md px-4 sm:px-6 flex items-center justify-between z-40 bg-white overflow-x-hidden">
      <div className="flex-shrink-0"></div>
      
      <div className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
        <p className="hidden sm:block text-sm font-medium text-gray-800 truncate max-w-[200px]">
          {email}
        </p>

        <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border border-gray-300 hover:scale-110 transition-transform duration-200 flex-shrink-0">
          <Image
            src={`https://api.dicebear.com/7.x/initials/svg?seed=${email || 'U'}`}
            alt="avatar"
            width={40}
            height={40}
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};

export default Header;
