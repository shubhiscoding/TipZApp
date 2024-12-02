"use client";
import Tip from "./components/Tip";
import CreatorsDisplay from "./components/CreatorsDisplay";
import TopNavBar from "./components/TopNavBar";

export default function Home() {
  return (
    <div className="">
      <TopNavBar/>
      <div className="flex justify-between mx-32 items-center">
      <Tip/>
      <CreatorsDisplay/>
      </div>
    </div>
  );
}