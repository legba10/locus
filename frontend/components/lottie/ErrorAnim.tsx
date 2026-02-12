"use client";

import dynamic from "next/dynamic";
import error from "@/public/lottie/Error.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function ErrorAnim({ size = 40, loop = false }: { size?: number; loop?: boolean }) {
  return (
    <Lottie
      animationData={error}
      loop={loop}
      autoplay
      style={{ width: size, height: size }}
    />
  );
}
