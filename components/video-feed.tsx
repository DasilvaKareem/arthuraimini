"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import VideoPlayer from "@/components/video-player"
import VideoActions from "@/components/video-actions"

// Sample video data
const videos = [
  {
    id: 1,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "@creativeminds",
    description: "Exploring digital art possibilities with the latest AI tools #digitalart #aiart",
    likes: 1243,
    comments: 89,
    aspectRatio: "16:9",
  },
  {
    id: 2,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "@techexplorer",
    description: "The future of AR experiences 🌟 #augmentedreality #tech",
    likes: 4521,
    comments: 132,
    aspectRatio: "9:16",
  },
  {
    id: 3,
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
    username: "@aimasters",
    description: "Building a smarter tomorrow with machine learning 🤖 #ai #machinelearning",
    likes: 892,
    comments: 45,
    aspectRatio: "16:9",
  },
]

export default function VideoFeed() {
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const lastScrollTime = useRef<number>(0)
  const startY = useRef<number | null>(null)
  
  const currentVideo = videos[currentVideoIndex]

  // Navigate to the next video
  const goToNextVideo = useCallback(() => {
    if (showComments) return
    // Directly update to the next video index
    setCurrentVideoIndex((prev) => (prev + 1) % videos.length)
  }, [showComments])

  // Navigate to the previous video
  const goToPreviousVideo = useCallback(() => {
    if (showComments) return
    // Directly update to the previous video index
    setCurrentVideoIndex((prev) => (prev - 1 + videos.length) % videos.length)
  }, [showComments])
  
  // Toggle comments
  const toggleComments = () => {
    setShowComments((prev) => !prev)
  }

  // Handle mouse wheel scrolling
  const handleWheel = useCallback((e: WheelEvent) => {
    // Throttle scroll events
    const now = Date.now()
    if (now - lastScrollTime.current < 500) return
    lastScrollTime.current = now
    
    if (showComments) return
    
    if (e.deltaY > 0) {
      // Scroll down = next video
      goToNextVideo()
    } else if (e.deltaY < 0) {
      // Scroll up = previous video
      goToPreviousVideo()
    }
    
    // Prevent default scrolling
    e.preventDefault()
  }, [goToNextVideo, goToPreviousVideo, showComments])

  // Handle touch start for swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    // Skip if comments are open
    if (showComments) return
    
    // Skip if touching a control element
    if ((e.target as HTMLElement).closest('[data-no-swipe]')) return
    
    startY.current = e.touches[0].clientY
  }
  
  // Handle touch end for swipe
  const handleTouchEnd = (e: React.TouchEvent) => {
    // Skip if comments are open or no start position
    if (showComments || startY.current === null) return
    
    // Skip if touching a control element
    if ((e.target as HTMLElement).closest('[data-no-swipe]')) return
    
    // Calculate swipe distance
    const endY = e.changedTouches[0].clientY
    const deltaY = startY.current - endY
    
    // Minimum distance for a swipe
    const minDistance = 80
    
    if (Math.abs(deltaY) > minDistance) {
      if (deltaY > 0) {
        // Swipe up = next video
        goToNextVideo()
      } else {
        // Swipe down = previous video
        goToPreviousVideo()
      }
    }
    
    // Reset start position
    startY.current = null
  }
  
  // Set up wheel event listener
  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    
    container.addEventListener('wheel', handleWheel, { passive: false })
    
    return () => {
      container.removeEventListener('wheel', handleWheel)
    }
  }, [handleWheel])
  
  // Set up keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showComments) return
      
      if (e.key === 'ArrowDown' || e.key === 'j') {
        goToNextVideo()
      } else if (e.key === 'ArrowUp' || e.key === 'k') {
        goToPreviousVideo()
      }
    }
    
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [goToNextVideo, goToPreviousVideo, showComments])
  
  // Handle direct button clicks
  const handleNextClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    goToNextVideo()
  }
  
  const handlePrevClick = (e: React.MouseEvent) => {
    e.preventDefault() 
    e.stopPropagation()
    goToPreviousVideo()
  }

  return (
    <div 
      ref={containerRef}
      className="relative w-full max-w-md h-[calc(100dvh-2rem)] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      <div className="absolute top-4 left-4 z-10" data-no-swipe>
        <h1 className="text-xl font-bold">Arthur</h1>
      </div>

      {/* Video container */}
      <div className="h-full w-full">
        <VideoPlayer 
          key={currentVideo.id} /* Key forces remount when video changes */
          video={currentVideo} 
          onVideoEnd={goToNextVideo} 
        />
      </div>

      <div className="absolute bottom-20 left-4 z-10 max-w-[70%]" data-no-swipe>
        <h3 className="font-bold">{currentVideo.username}</h3>
        <p className="text-sm mt-2">{currentVideo.description}</p>
      </div>

      <VideoActions video={{
        id: currentVideo.id,
        likes: currentVideo.likes,
        comments: currentVideo.comments,
        username: currentVideo.username
      }} onCommentClick={toggleComments} />

      {/* Navigation buttons */}
      <div className="absolute right-5 top-1/2 z-30 flex flex-col items-center gap-6 -translate-y-1/2" data-no-swipe>
        <button
          onClick={handlePrevClick}
          className="bg-black/40 hover:bg-black/60 rounded-full p-3 transition-all active:scale-95 shadow-lg"
          aria-label="Previous video"
        >
          <ChevronUp className="h-6 w-6" />
        </button>

        <button
          onClick={handleNextClick}
          className="bg-black/40 hover:bg-black/60 rounded-full p-3 transition-all active:scale-95 shadow-lg"
          aria-label="Next video"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="absolute inset-0 bg-black/90 z-40 overflow-y-auto p-4" data-no-swipe>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-bold">Comments ({currentVideo.comments})</h2>
            <button onClick={toggleComments} className="text-white">
              Close
            </button>
          </div>

          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-gray-700"></div>
                <div>
                  <p className="font-bold text-sm">@user{i + 1}</p>
                  <p className="text-sm">This is an amazing video! Love the AI innovation.</p>
                  <div className="flex gap-2 mt-1 text-xs text-gray-400">
                    <span>2h ago</span>
                    <span>Like</span>
                    <span>Reply</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
} 