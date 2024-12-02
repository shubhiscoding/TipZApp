"use client";
import React, { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation"; // Next.js router for navigation
import { useWallet } from "../context/WalletProvider"; // Adjust the path as needed

const TopNavBar: React.FC = () => {
  const router = useRouter(); // Initialize router
  const { walletAddress, connectWallet } = useWallet();
  const [active, setActive] = useState<string>("Tip"); // Default to "Tip"
  const pathname = usePathname(); // Get the current route
  const handleNavigation = (route: string, item: string) => {
    setActive(item); // Set the clicked item as active
    router.push(route); // Redirect to the specified route
  };
  useEffect(() => {
    if (pathname === "/") {
      setActive("Tip"); // If at the home route, set "Tip" as active
    } else if (pathname === "/claim") {
      setActive("Claim"); // If at /claim, set "Claim" as active
    }
  }, [pathname]);

  return (
    <nav className="bg-white py-4 px-6 flex">
      <div className="p-2 flex justify-between items-center w-full">
        {/* Logo */}
        <div className="bg-gradient-to-r from-[#4f90aa] to-[#ff5d78] bg-clip-text text-transparent font-bold text-2xl ml-8">
          TipzApp
        </div>

        {/* Navigation Links */}
        <div className="flex items-center space-x-6">
          {["Tip", "Claim"].map((item) => (
            <div
              key={item}
              className="cursor-pointer font-medium text-black relative"
              onClick={() =>
                handleNavigation(item === "Tip" ? "/" : `/${item.toLowerCase()}`, item)
              }
            >
              <span
                className={`${
                  active === item
                    ? "bg-gradient-to-r from-[#3c748a] to-[#ff5d78] bg-clip-text text-transparent"
                    : "text-black"
                } transition-all`}
              >
                {item}
              </span>
              <div
                className={`absolute bottom-[-2px] left-0 h-0.5 w-full transition-all duration-300 ${
                  active === item ? "bg-[#FE6B8B]" : "bg-transparent"
                }`}
              />
            </div>
          ))}
        </div>
        <button
          onClick={connectWallet}
          className="px-4 py-2 rounded-lg font-medium bg-gradient-to-r from-[#4f90aa] to-[#ff5d78] text-white hover:opacity-90 transition-all mr-8"
        >
          {walletAddress
            ? `Connected: ${walletAddress.slice(0, 6)}...`
            : "Connect Wallet"}
        </button>
      </div>
    </nav>
  );
};

export default TopNavBar;
