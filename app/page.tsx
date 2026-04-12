"use client";

import Link from "next/link";
import { AnimatedBlobs } from "@/components/ui/blobs";

export default function LandingPage() {
  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-black">
      {/* Blob background */}
      <div className="absolute inset-0 z-0">
        <AnimatedBlobs />
      </div>

      {/* Dark overlay */}
      <div className="absolute inset-0 z-10 bg-black/40" />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <h1 className="text-white text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight whitespace-pre-line">
          {"공부하다 막히면\n우리한테 맡겨"}
        </h1>
        <p className="text-white/60 text-sm sm:text-base mt-4 max-w-sm">
          고민 올리고, 투표 받고, 결정은 다수결로
        </p>

        <div className="flex flex-col sm:flex-row gap-3 mt-10 w-full max-w-xs sm:max-w-sm">
          <Link
            href="/new"
            className="flex-1 py-4 rounded-2xl bg-white text-black font-bold text-base text-center transition-transform active:scale-95 hover:bg-white/90"
          >
            고민 올리기
          </Link>
          <Link
            href="/feed"
            className="flex-1 py-4 rounded-2xl bg-white/10 backdrop-blur-md text-white font-bold text-base text-center border border-white/20 transition-transform active:scale-95 hover:bg-white/20"
          >
            구경하기
          </Link>
        </div>
      </div>
    </div>
  );
}
