'use client';
import { ReactNode } from "react";
import { usePathname } from "next/navigation";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children?: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const layoutPaths = ["/dashboard", "/user" , "/payments" , "/bookings" , "/updates" , "/flights"];
  const showLayout = layoutPaths.some((path) => pathname.startsWith(path));

  return (
    <div className="relative min-h-screen flex bg-white overflow-x-hidden">
      {showLayout && <Sidebar />}

      <div
        className={`flex flex-col flex-1 transition-all duration-300 min-w-0 ${
          showLayout ? 'lg:ml-56' : ''
        }`}
      >
        {showLayout && <Header />}
        <main
          className={`pt-[80px] px-4 lg:px-6 xl:px-8 w-full overflow-x-hidden ${
            showLayout ? 'max-w-[1440px] mx-auto' : ''
          }`}
        >
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;