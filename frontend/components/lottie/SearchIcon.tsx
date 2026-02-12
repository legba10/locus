"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import animation from "@/public/lottie/location.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function SearchIcon() {
  const ref = useRef<any>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const update = () => setIsMobile(window.innerWidth < 768);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const play = () => {
    ref.current?.goToAndPlay?.(0, true);
    ref.current?.play?.();
  };

  return (
    <div
      onMouseEnter={() => {
        if (!isMobile) play();
      }}
      onClick={play}
      onTouchStart={play}
      style={{ width: isMobile ? 20 : 22, height: isMobile ? 20 : 22 }}
      className="flex items-center justify-center"
      aria-hidden
    >
      <Lottie
        lottieRef={ref}
        animationData={animation}
        loop={false}
        autoplay={false}
      />
    </div>
  );
}
