"use client";

import dynamic from "next/dynamic";
import { useRef } from "react";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

type Props = {
  animationData: any;
  size?: number;
  loop?: boolean;
  autoplay?: boolean;
  playOnHover?: boolean;
  className?: string;
};

export default function LottieIcon({
  animationData,
  size = 24,
  loop = true,
  autoplay = true,
  playOnHover = false,
  className = "",
}: Props) {
  const lottieRef = useRef<any>(null);

  return (
    <div
      style={{ width: size, height: size }}
      className={`flex items-center justify-center ${className}`}
      onMouseEnter={() => {
        if (playOnHover && lottieRef.current?.goToAndPlay) {
          lottieRef.current.goToAndPlay(0, true);
        }
      }}
    >
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={loop}
        autoplay={autoplay}
      />
    </div>
  );
}
