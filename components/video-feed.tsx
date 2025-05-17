"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { ChevronDown, ChevronUp } from "lucide-react"
import VideoPlayer from "@/components/video-player"
import VideoActions from "@/components/video-actions"
import { listVideos, type VideoData } from "@/lib/firebase"

// Guaranteed working sample videos from a public CDN
const SAMPLE_VIDEOS: VideoData[] = [
  {
    id: "sample1",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    username: "@creativeminds",
    description: "Big Buck Bunny - Open source animated short",
    likes: 1243,
    comments: 89,
    aspectRatio: "16:9",
    title: "Big Buck Bunny",
  },
  {
    id: "sample2",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    username: "@techexplorer",
    description: "Elephant's Dream - First Blender open movie",
    likes: 4521,
    comments: 132,
    aspectRatio: "16:9",
    title: "Elephant's Dream",
  },
  {
    id: "sample3",
    url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    username: "@aimasters",
    description: "For Bigger Blazes - Sample video",
    likes: 892,
    comments: 45,
    aspectRatio: "16:9",
    title: "For Bigger Blazes",
  },
];

export default function VideoFeed() {
  // State variables
  const [videos, setVideos] = useState<VideoData[]>([])
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0)
  const [showComments, setShowComments] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isSwiping, setIsSwiping] = useState(false)
  const [swipeDirection, setSwipeDirection] = useState<'up' | 'down' | null>(null)
  
  // Refs
  const containerRef = useRef<HTMLDivElement>(null)
  const touchStartYRef = useRef<number | null>(null)
  const lastScrollTime = useRef<number>(0)
  
  // Don't use early returns in callbacks or conditionally call hooks
  const toggleComments = useCallback(() => {
    setShowComments(prev => !prev)
  }, [])
  
  const goToNextVideo = useCallback(() => {
    if (!showComments && videos.length > 0) {
      console.log('Going to next video')
      setCurrentVideoIndex(prev => (prev + 1) % videos.length)
    }
  }, [showComments, videos.length])

  const goToPreviousVideo = useCallback(() => {
    if (!showComments && videos.length > 0) {
      console.log('Going to previous video')
      setCurrentVideoIndex(prev => (prev - 1 + videos.length) % videos.length)
    }
  }, [showComments, videos.length])
  
  // Fetch videos from Firebase
  useEffect(() => {
    const fetchVideos = async () => {
      setIsLoading(true)
      setError(null)
      
      try {
        console.log("🔍 Fetching videos from Firebase...")
        const firebaseVideos = await listVideos()
        
        if (firebaseVideos && firebaseVideos.length > 0) {
          console.log(`✅ Fetched ${firebaseVideos.length} videos from Firebase`)
          setVideos(firebaseVideos)
        } else {
          console.log("⚠️ No videos found in Firebase, using sample videos")
          setVideos(SAMPLE_VIDEOS)
        }
      } catch (error) {
        console.error("❌ Error fetching videos:", error)
        setError("Failed to load videos. Using sample videos instead.")
        setVideos(SAMPLE_VIDEOS)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchVideos()
  }, [])
  
  // Set up scroll/swipe event handlers
  useEffect(() => {
    const handleWheel = (event: WheelEvent) => {
      event.preventDefault()
      
      // Throttle scroll events
      const now = Date.now()
      if (now - lastScrollTime.current < 500) return
      lastScrollTime.current = now
      
      // Don't process scroll events if showing comments
      if (showComments) return
      
      // Determine scroll direction
      if (event.deltaY > 0) {
        // Scrolling down
        goToNextVideo()
      } else if (event.deltaY < 0) {
        // Scrolling up
        goToPreviousVideo()
      }
    }
    
    // Handle keyboard events for arrow keys
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showComments) return
      
      if (event.key === 'ArrowDown') {
        event.preventDefault()
        goToNextVideo()
      } else if (event.key === 'ArrowUp') {
        event.preventDefault()
        goToPreviousVideo()
      }
    }
    
    // Add event listeners
    const container = containerRef.current
    if (container) {
      container.addEventListener('wheel', handleWheel, { passive: false })
      window.addEventListener('keydown', handleKeyDown)
    }
    
    // Clean up
    return () => {
      if (container) {
        container.removeEventListener('wheel', handleWheel)
      }
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [showComments, videos.length, goToNextVideo, goToPreviousVideo])
  
  // Touch handlers for mobile swiping
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (showComments) return
    
    const touch = e.touches[0]
    touchStartYRef.current = touch.clientY
    setIsSwiping(true)
    setSwipeDirection(null)
  }, [showComments])
  
  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStartYRef.current || showComments) return
    
    const touch = e.touches[0]
    const currentY = touch.clientY
    const diffY = currentY - touchStartYRef.current
    
    // Determine swipe direction
    if (diffY < -50) {
      setSwipeDirection('down') // Swiping up = going to next video
    } else if (diffY > 50) {
      setSwipeDirection('up') // Swiping down = going to previous video
    } else {
      setSwipeDirection(null)
    }
  }, [showComments])
  
  const handleTouchEnd = useCallback(() => {
    if (!touchStartYRef.current || showComments) return
    
    if (swipeDirection === 'down') {
      goToNextVideo()
    } else if (swipeDirection === 'up') {
      goToPreviousVideo()
    }
    
    touchStartYRef.current = null
    setIsSwiping(false)
    setSwipeDirection(null)
  }, [swipeDirection, showComments, goToNextVideo, goToPreviousVideo])
  
  // Memoize the current video to prevent unnecessary renders
  const currentVideo = useMemo(() => videos.length > 0 ? videos[currentVideoIndex] : null, [videos, currentVideoIndex])
  
  // If there are no videos yet, show loading or error
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100dvh-2rem)] w-full">
        <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
      </div>
    )
  }
  
  if (!videos.length || !currentVideo) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100dvh-2rem)] w-full p-4 text-center">
        <h2 className="text-xl font-bold mb-2">No videos available</h2>
        <p>There are no videos to display at this time.</p>
      </div>
    )
  }
  
  return (
    <div 
      ref={containerRef} 
      className="relative w-full max-w-md h-[calc(100dvh-2rem)] overflow-hidden"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Video container - adding pointer-events-none so it doesn't capture clicks meant for UI elements */}
      <div className="h-full w-full pointer-events-none">
        <VideoPlayer 
          key={currentVideo.id}
          video={currentVideo} 
          onVideoEnd={goToNextVideo} 
        />
      </div>

      <div className="absolute top-4 left-4 z-10">
        <h1 className="text-xl font-bold">Arthur</h1>
      </div>
      
      {error && (
        <div className="absolute top-16 left-0 right-0 mx-auto w-[90%] bg-red-500/80 text-white p-2 rounded z-50 text-center text-sm">
          {error}
        </div>
      )}

      {/* Swipe indicators */}
      {isSwiping && swipeDirection === 'up' && (
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 bg-white/20 rounded-full p-3">
          <ChevronUp className="h-6 w-6" />
        </div>
      )}
      
      {isSwiping && swipeDirection === 'down' && (
        <div className="absolute bottom-1/4 left-1/2 -translate-x-1/2 bg-white/20 rounded-full p-3">
          <ChevronDown className="h-6 w-6" />
        </div>
      )}

      {/* Title and description */}
      <div className="absolute bottom-20 left-4 z-10 max-w-[70%]">
        {currentVideo.title && (
          <h2 className="font-bold text-lg">{currentVideo.title}</h2>
        )}
        <h3 className="font-bold text-sm mt-1">{currentVideo.username}</h3>
        {currentVideo.description && (
          <p className="text-sm mt-1">{currentVideo.description}</p>
        )}
        {currentVideo.tags && currentVideo.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {currentVideo.tags.map((tag, i) => (
              <span key={i} className="text-xs bg-black/30 px-2 py-0.5 rounded-full">
                #{tag}
              </span>
            ))}
          </div>
        )}
      </div>

      <VideoActions 
        video={{
          id: currentVideo.id,
          likes: currentVideo.likes,
          comments: currentVideo.comments,
          username: currentVideo.username
        }} 
        onCommentClick={toggleComments} 
      />

      {/* Navigation buttons */}
      <div className="absolute right-5 top-1/2 z-30 flex flex-col items-center gap-6 -translate-y-1/2">
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goToPreviousVideo();
          }}
          className="bg-black/40 hover:bg-black/60 rounded-full p-3 transition-all active:scale-95 shadow-lg"
          aria-label="Previous video"
        >
          <ChevronUp className="h-6 w-6" />
        </button>

        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            goToNextVideo();
          }}
          className="bg-black/40 hover:bg-black/60 rounded-full p-3 transition-all active:scale-95 shadow-lg"
          aria-label="Next video"
        >
          <ChevronDown className="h-6 w-6" />
        </button>
      </div>

      {/* Comments section */}
      {showComments && (
        <div className="absolute inset-0 bg-black/90 z-40 overflow-y-auto p-4">
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