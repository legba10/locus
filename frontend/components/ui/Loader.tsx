"use client";

import dynamic from "next/dynamic";
import loadingAnim from "@/public/lottie/Loading.json";

const Lottie = dynamic(() => import("lottie-react"), { ssr: false });

export default function Loader({ size = 40 }: { size?: number }) {
  return (
    <div style={{ width: size, height: size }} className="inline-flex items-center justify-center">
      <Lottie animationData={loadingAnim} loop autoplay />
    </div>
  );
}
