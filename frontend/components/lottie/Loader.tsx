"use client";

import dynamic from "next/dynamic";
import loading from "@/public/lottie/Loading.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Loader({ size = 40 }: { size?: number }) {
  return (
    <Lottie
      animationData={loading}
      loop
      autoplay
      style={{ width: size, height: size }}
    />
  );
}
