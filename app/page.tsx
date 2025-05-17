"use client";

import VideoFeed from "@/components/video-feed"
import { ArrowUp, ArrowDown, MousePointerClick } from "lucide-react"
import { WalletConnect } from "@/components/ui/wallet-connect"

export default function Home() {
  return (
    <main className="flex min-h-[100dvh] w-full flex-col items-center justify-center bg-black text-white overflow-hidden overscroll-none">
      <div className="fixed top-4 right-4 z-20">
        <WalletConnect />
      </div>
      
      <VideoFeed />

      {/* Keyboard shortcuts help */}
      <div className="fixed bottom-4 right-4 text-xs text-white/50 hidden lg:flex items-center gap-3 p-2 bg-black/30 rounded-lg">
        <div className="flex items-center gap-1">
          <ArrowUp className="h-3 w-3" />
          <ArrowDown className="h-3 w-3" />
          <span>Keys</span>
        </div>
        <span>|</span>
        <div className="flex items-center gap-1">
          <MousePointerClick className="h-3 w-3" />
          <span>Scroll</span>
        </div>
      </div>
    </main>
  )
}
