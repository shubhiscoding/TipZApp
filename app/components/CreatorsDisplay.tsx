"use client";
import React from "react";
import Lottie from "react-lottie-player";
import animationData from "../../public/animations/sample.json";
const CreatorsDisplay: React.FC = () => {
  return (
    <div>
      <Lottie
      loop
      animationData={animationData}
      play
      style={{  width: 950, height: 850 }}
    />
    </div>
  );
};

export default CreatorsDisplay;
