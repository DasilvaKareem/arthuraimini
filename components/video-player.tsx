"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX } from "lucide-react"

interface VideoPlayerProps {
  video: {
    id: number
    url: string
    aspectRatio: string
  }
  onVideoEnd: () => void
}

export default function VideoPlayer({ video, onVideoEnd }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)

  // Auto-play when component mounts or video changes
  useEffect(() => {
    const videoElement = videoRef.current
    if (!videoElement) return
    
    // Reset video to beginning
    videoElement.currentTime = 0
    setProgress(0)
    
    // Show controls when video changes
    setShowControls(true)
    
    // Auto-hide controls after 3 seconds
    const hideTimer = setTimeout(() => {
      setShowControls(false)
    }, 3000)
    
    // Set up play/pause handlers
    const handlePlay = () => setIsPlaying(true)
    const handlePause = () => setIsPlaying(false)
    
    videoElement.addEventListener('play', handlePlay)
    videoElement.addEventListener('pause', handlePause)
    
    // Try to autoplay
    const playPromise = videoElement.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
        })
        .catch(error => {
          console.error("Autoplay prevented:", error)
          setIsPlaying(false)
        })
    }
    
    // Cleanup function
    return () => {
      clearTimeout(hideTimer)
      videoElement.removeEventListener('play', handlePlay)
      videoElement.removeEventListener('pause', handlePause)
    }
  }, [video.id])
  
  // Toggle play/pause
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const videoElement = videoRef.current
    if (!videoElement) return
    
    if (isPlaying) {
      videoElement.pause()
    } else {
      videoElement.play().catch(err => {
        console.error("Play failed:", err)
      })
    }
    
    // Show controls whenever interacting with video
    setShowControls(true)
  }
  
  // Toggle mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    const videoElement = videoRef.current
    if (!videoElement) return
    
    videoElement.muted = !isMuted
    setIsMuted(!isMuted)
    
    // Show controls whenever interacting with video
    setShowControls(true)
  }
  
  // Handle video time updates for progress bar
  const handleTimeUpdate = () => {
    const videoElement = videoRef.current
    if (!videoElement) return
    
    const currentProgress = (videoElement.currentTime / videoElement.duration) * 100
    setProgress(currentProgress)
  }
  
  // Handle video end
  const handleVideoEnd = () => {
    setIsPlaying(false)
    onVideoEnd()
  }
  
  // Show controls when moving mouse over video
  const handleShowControls = () => {
    setShowControls(true)
  }

  return (
    <div className="relative w-full h-full bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-contain"
        playsInline
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        data-no-swipe
      />
      
      {/* Clickable overlay for play/pause */}
      <div 
        className="absolute inset-0 z-10"
        onClick={togglePlay}
        onMouseMove={handleShowControls}
        data-no-swipe
      />
      
      {/* Controls overlay */}
      {showControls && (
        <div className="absolute inset-0 z-20 flex flex-col justify-between p-4 animate-fade-in pointer-events-none">
          {/* Top controls */}
          <div className="flex justify-end">
            <button
              onClick={toggleMute}
              className="bg-black/40 rounded-full p-2 pointer-events-auto"
              aria-label={isMuted ? "Unmute" : "Mute"}
              data-no-swipe
            >
              {isMuted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
            </button>
          </div>
          
          {/* Center play/pause button */}
          <div className="flex justify-center">
            <button
              onClick={togglePlay}
              className="bg-black/40 rounded-full p-4 pointer-events-auto"
              aria-label={isPlaying ? "Pause" : "Play"}
              data-no-swipe
            >
              {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
            </button>
          </div>
        </div>
      )}
      
      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 z-30">
        <div 
          className="h-full bg-red-500 transition-all duration-100" 
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
} 