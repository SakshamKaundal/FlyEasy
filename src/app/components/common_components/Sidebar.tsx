'use client';

import {
  House, LogOut, Menu as MenuIcon, X as CloseIcon, PhoneForwarded,
  Settings, LucideIcon, NotebookPen, BellRing, BookLock
} from 'lucide-react';
import { useEffect, useState } from 'react';
import clsx from 'clsx';
import { LogoutFunction } from './common_action';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface MenuItem {
  label: string;
  icon: LucideIcon;
  href: string;
}

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isClient, setIsClient] = useState(false); 
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const Menu: MenuItem[] = [
    { label: 'Home', icon: House, href: '/user' },
    { label: 'My Bookings', icon: NotebookPen, href: '/bookings' },
    { label: 'Flight Updates', icon: BellRing, href: '/updates' },
    { label: 'Contact Us', icon: PhoneForwarded, href: '/contact' },
  ];

  const handleLogout = async () => {
    await LogoutFunction();
    router.push('/login');
  };

  return (
    <>
     
      <button
        className="lg:hidden fixed top-4 left-4 z-50 bg-white p-2 rounded-md shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <MenuIcon className='shadow-2xl hover:scale-75 transform duration-75'/>
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0  bg-opacity-40 z-40"
          style={{ backgroundColor: "#101010CC" }}
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className="hidden lg:flex fixed top-0 left-0 z-50 h-screen w-56 bg-white flex-col justify-between border-r border-gray-200">
        <div className="px-4 mt-[80px]">
          {isClient && (
            <ul className="space-y-8">
              {Menu.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex gap-4 items-center cursor-pointer hover:scale-110 transform duration-200"
                  >
                    <item.icon size={20} />
                    <span className="font-medium text-md">{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div
          className="flex gap-3 items-center px-2 py-4 border-t border-gray-200 cursor-pointer"
          onClick={handleLogout}
        >
          <LogOut height={22} />
          <span className="font-medium text-sm hover:scale-125 transform duration-300">
            Logout
          </span>
        </div>
      </div>

      <div
        className={clsx(
          "lg:hidden fixed top-0 left-0 z-50 h-screen w-16 bg-white flex flex-col justify-between border-r border-gray-200 transition-transform duration-300",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
          }
        )}
      >
        <div className="flex justify-center p-2 border-b border-gray-200">
          <button onClick={() => setIsOpen(false)} className="p-1">
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="flex-1 px-2 pt-4">
          {isClient && (
            <ul className="space-y-6">
              {Menu.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex justify-center items-center cursor-pointer hover:scale-110 transform duration-200 p-2 rounded-md hover:bg-gray-100"
                    onClick={() => setIsOpen(false)}
                    title={item.label}
                  >
                    <item.icon size={18} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </div>

        
        <div
          className="flex justify-center items-center p-3 border-t border-gray-200 cursor-pointer hover:bg-gray-100"
          onClick={handleLogout}
          title="Logout"
        >
          <LogOut size={18} />
        </div>
      </div>
    </>
  );
};

export default Sidebar;