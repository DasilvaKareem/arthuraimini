"use client"

import { useEffect, useRef, useState } from "react"
import { Play, Pause, Volume2, VolumeX, AlertTriangle, RefreshCw } from "lucide-react"

interface VideoPlayerProps {
  video: {
    id: string | number
    url: string
    aspectRatio: string
  }
  onVideoEnd: () => void
}

export default function VideoPlayer({ video, onVideoEnd }: VideoPlayerProps) {
  console.log(`VideoPlayer rendering for video ${video.id}`)
  
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true) // Start muted to help with autoplay
  const [progress, setProgress] = useState(0)
  const [showControls, setShowControls] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const mountCountRef = useRef(0)
  const autoplayAttemptedRef = useRef(false)

  // Count how many times this component has mounted
  useEffect(() => {
    mountCountRef.current += 1
    console.log(`VideoPlayer for ID ${video.id} mounted (mount #${mountCountRef.current})`)
    
    return () => {
      console.log(`VideoPlayer for ID ${video.id} unmounting`)
    }
  }, [video.id])

  // Auto-play when component mounts or video changes
  useEffect(() => {
    console.log(`Setting up video for ID ${video.id}, URL: ${video.url}`)
    setError(null)
    setIsLoading(true)
    autoplayAttemptedRef.current = false
    
    const videoElement = videoRef.current
    if (videoElement) {
      // Reset video to beginning
      videoElement.currentTime = 0
      setProgress(0)
      
      // Ensure video is muted initially to help with autoplay
      videoElement.muted = true
      setIsMuted(true)
      
      // Show controls when video changes
      setShowControls(true)
      
      // Auto-hide controls after 3 seconds
      console.log('Setting up control hide timer')
      const hideTimer = setTimeout(() => {
        if (!error) {
          console.log('Auto-hiding controls')
          setShowControls(false)
        }
      }, 3000)
      
      // Set up play/pause handlers
      const handlePlay = () => {
        console.log(`Video ${video.id} playing`)
        setIsPlaying(true)
      }
      
      const handlePause = () => {
        console.log(`Video ${video.id} paused`)
        setIsPlaying(false)
      }

      const handleLoadedData = () => {
        console.log(`Video ${video.id} loaded data`)
        setIsLoading(false)
        
        // Try to autoplay again after loading if not yet attempted
        if (!autoplayAttemptedRef.current) {
          attemptAutoplay(videoElement)
        }
      }

      const handleError = (e: Event) => {
        console.error(`Error loading video ${video.id}:`, e)
        setError("Video could not be loaded. Please try again later.")
        setIsLoading(false)
      }
      
      videoElement.addEventListener('play', handlePlay)
      videoElement.addEventListener('pause', handlePause)
      videoElement.addEventListener('loadeddata', handleLoadedData)
      videoElement.addEventListener('error', handleError)
      
      // Function to attempt autoplay
      const attemptAutoplay = (element: HTMLVideoElement) => {
        autoplayAttemptedRef.current = true
        console.log(`Attempting to autoplay video ${video.id} (muted: ${element.muted})`)
        
        let playPromise: Promise<void> | undefined;
        try {
          playPromise = element.play()
          if (playPromise !== undefined) {
            playPromise
              .then(() => {
                console.log(`Autoplay successful for video ${video.id}`)
                setIsPlaying(true)
              })
              .catch(error => {
                console.error(`Autoplay prevented for video ${video.id}:`, error)
                
                // If autoplay fails, try once more with muted
                if (!element.muted) {
                  console.log(`Retrying autoplay with muted for video ${video.id}`)
                  element.muted = true
                  setIsMuted(true)
                  element.play().catch(err => {
                    console.error(`Muted autoplay also failed for video ${video.id}:`, err)
                    setIsPlaying(false)
                  })
                } else {
                  setIsPlaying(false)
                }
              })
          }
        } catch (error) {
          console.error(`Error playing video ${video.id}:`, error)
          setIsPlaying(false)
        }
      }
      
      // Initial attempt to play the video (will be called again after loadeddata if it fails)
      attemptAutoplay(videoElement)
      
      // Cleanup function
      return () => {
        console.log(`Cleaning up effect for video ${video.id}`)
        
        // Clear timeout
        clearTimeout(hideTimer)
        
        // Remove event listeners
        videoElement.removeEventListener('play', handlePlay)
        videoElement.removeEventListener('pause', handlePause)
        videoElement.removeEventListener('loadeddata', handleLoadedData)
        videoElement.removeEventListener('error', handleError)
        
        // Pause the video
        try {
          if (!videoElement.paused) {
            videoElement.pause()
          }
        } catch (e) {
          console.error('Error pausing video during cleanup:', e)
        }
      }
    }
  }, [video.id, video.url])
  
  // Toggle play/pause
  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (error || isLoading) return;
    
    const videoElement = videoRef.current
    if (!videoElement) {
      console.warn('Toggle play: video element ref is null')
      return
    }
    
    if (isPlaying) {
      console.log(`Manually pausing video ${video.id}`)
      videoElement.pause()
    } else {
      console.log(`Manually playing video ${video.id}`)
      videoElement.play().catch(err => {
        console.error(`Play failed for video ${video.id}:`, err)
        
        // If play fails, try with muted
        if (!videoElement.muted) {
          console.log(`Retrying play with muted for video ${video.id}`)
          videoElement.muted = true
          setIsMuted(true)
          videoElement.play().catch(muteErr => {
            console.error(`Muted play also failed:`, muteErr)
            setError("Could not play video. Please try again.")
          })
        } else {
          setError("Could not play video. Please try again.")
        }
      })
    }
    
    // Show controls whenever interacting with video
    setShowControls(true)
  }
  
  // Toggle mute
  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (error || isLoading) return;
    
    const videoElement = videoRef.current
    if (!videoElement) {
      console.warn('Toggle mute: video element ref is null')
      return
    }
    
    console.log(`Toggling mute for video ${video.id}: ${!isMuted}`)
    videoElement.muted = !isMuted
    setIsMuted(!isMuted)
    
    // If unmuting while paused, try to play
    if (isMuted && !isPlaying) {
      videoElement.play().catch(err => {
        console.error(`Play on unmute failed:`, err)
      })
    }
    
    // Show controls whenever interacting with video
    setShowControls(true)
  }
  
  // Retry loading the video
  const retryVideo = () => {
    if (!videoRef.current) return;
    
    setError(null)
    setIsLoading(true)
    
    // Reset the video source to force a reload
    const videoElement = videoRef.current;
    const currentSrc = videoElement.src;
    videoElement.src = '';
    setTimeout(() => {
      videoElement.src = currentSrc;
      videoElement.muted = true; // Ensure muted for better autoplay chance
      setIsMuted(true);
      videoElement.load();
      videoElement.play().catch(err => {
        console.error(`Retry play failed for video ${video.id}:`, err)
      })
    }, 500);
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
    console.log(`Video ${video.id} ended, calling onVideoEnd callback`)
    setIsPlaying(false)
    onVideoEnd()
  }
  
  // Show controls when moving mouse over video
  const handleShowControls = () => {
    setShowControls(true)
  }

  useEffect(() => {
    // This effect is for any error state changes
    if (error) {
      setShowControls(true);
    }
  }, [error]);

  console.log(`VideoPlayer render complete for ${video.id}`)
  return (
    <div className="relative w-full h-full bg-black">
      {/* Video element */}
      <video
        ref={videoRef}
        src={video.url}
        className="w-full h-full object-contain"
        playsInline
        muted={isMuted}
        loop={false}
        preload="auto"
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleVideoEnd}
        data-no-swipe
      />
      
      {/* Loading overlay */}
      {isLoading && !error && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50 z-40">
          <div className="animate-spin h-10 w-10 border-4 border-white border-t-transparent rounded-full"></div>
        </div>
      )}
      
      {/* Error overlay */}
      {error && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/80 z-40 p-4 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500 mb-2" />
          <p className="text-white mb-4">{error}</p>
          <button 
            onClick={retryVideo}
            className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-full"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Retry</span>
          </button>
        </div>
      )}
      
      {/* Clickable overlay for play/pause */}
      <div 
        className="absolute inset-0 z-10"
        onClick={togglePlay}
        onMouseMove={handleShowControls}
        data-no-swipe
      />
      
      {/* Controls overlay */}
      {showControls && !error && !isLoading && (
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
      {!error && !isLoading && (
        <div className="absolute bottom-0 left-0 w-full h-1 bg-gray-800 z-30">
          <div 
            className="h-full bg-red-500 transition-all duration-100" 
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  )
} 