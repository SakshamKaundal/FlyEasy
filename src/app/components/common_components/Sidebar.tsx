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
  const [isClient, setIsClient] = useState(false); // hydration fix
  const router = useRouter();

  useEffect(() => {
    setIsClient(true);
  }, []);

  const Menu: MenuItem[] = [
    { label: 'Home', icon: House, href: '/user' },
    { label: 'My Bookings', icon: NotebookPen, href: '/bookings' },
    { label: 'Past Bookings', icon: BookLock, href: '/home' },
    { label: 'Settings', icon: Settings, href: '/home' },
    { label: 'Flight Updates', icon: BellRing, href: '/updates' },
    { label: 'Contact Us', icon: PhoneForwarded, href: '/home' },
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
        <MenuIcon />
      </button>

      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-40 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={clsx(
          "fixed top-0 left-0 z-50 h-screen w-56 bg-white flex flex-col justify-between border-r border-gray-200 transition-transform duration-300",
          {
            "translate-x-0": isOpen,
            "-translate-x-full": !isOpen,
            "lg:translate-x-0": true,
          }
        )}
      >
        <div className="flex justify-end lg:hidden p-4">
          <button onClick={() => setIsOpen(false)}>
            <CloseIcon />
          </button>
        </div>

        <div className="px-4 mt-[80px]">
          {isClient && (
            <ul className="space-y-8">
              {Menu.map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="flex gap-4 items-center cursor-pointer hover:scale-110 transform duration-200"
                    onClick={() => setIsOpen(false)}
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
          className="flex gap-3 items-center px-2 py-4 border-t border-gray-200"
          onClick={handleLogout}
        >
          <LogOut height={22} className="cursor-pointer" />
          <span className="font-medium text-sm cursor-pointer hover:scale-125 transform duration-300">
            Logout
          </span>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
