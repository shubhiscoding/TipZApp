"use client";
import TopNavBar from "../components/TopNavBar";
export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div>
        <TopNavBar/>
        {children}
    </div>
  );
}
