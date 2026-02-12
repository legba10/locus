"use client";

import dynamic from "next/dynamic";
import check from "@/public/lottie/check.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function TelegramStatus() {
  return (
    <Lottie
      animationData={check}
      loop={false}
      autoplay
      style={{ width: 24, height: 24 }}
    />
  );
}
