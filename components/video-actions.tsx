"use client"

import { useState } from "react"
import { Heart, MessageCircle, DollarSign, Check } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { usdcContractConfig, getTransferArgs } from "@/lib/token-service"

interface VideoActionsProps {
  video: {
    id: string | number
    likes: number
    comments: number
    username: string
  }
  onCommentClick: () => void
}

export default function VideoActions({ video, onCommentClick }: VideoActionsProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(video.likes)
  const [showTipDialog, setShowTipDialog] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<string>("")
  const { address } = useAccount()

  // Mock creator addresses based on username - in a real app these would be actual wallet addresses
  const creatorAddresses: Record<string, string> = {
    "@creativeminds": "0x0000000000000000000000000000000000000001",
    "@techexplorer": "0x0000000000000000000000000000000000000002",
    "@aimasters": "0x0000000000000000000000000000000000000003"
  }

  // Tip amount options
  const tipAmounts = ["1", "3", "5", "10", "25"]

  // Get creator's address from the username
  const creatorAddress = creatorAddresses[video.username] || creatorAddresses["@creativeminds"]

  // Setup contract write for USDC transfer
  const {
    data: hash,
    isPending: isWritePending,
    writeContract
  } = useWriteContract()

  // Track the transaction status
  const {
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
  } = useWaitForTransactionReceipt({
    hash,
  })

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation()
    
    if (liked) {
      setLikeCount((prev) => prev - 1)
    } else {
      setLikeCount((prev) => prev + 1)
    }
    setLiked(!liked)
  }

  const handleTip = (e: React.MouseEvent) => {
    e.stopPropagation()
    setShowTipDialog(true)
  }

  const handleCommentClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onCommentClick()
  }

  const handleSendTip = () => {
    if (!selectedAmount || !address) return
    
    // Get the transfer arguments
    const args = getTransferArgs(creatorAddress, selectedAmount)
    
    // Execute the transfer
    writeContract({
      ...usdcContractConfig,
      functionName: 'transfer',
      args
    })
  }

  // Close the dialog after successful transaction
  if (isTxSuccess && showTipDialog) {
    setTimeout(() => {
      setShowTipDialog(false)
      setSelectedAmount("")
    }, 2000)
  }

  return (
    <div 
      className="absolute right-4 bottom-20 z-10 flex flex-col items-center gap-6"
      data-no-swipe
    >
      <div className="flex flex-col items-center">
        <button
          onClick={handleLike}
          className="bg-black/30 rounded-full p-3 transition-transform active:scale-90"
          aria-label="Like video"
        >
          <Heart
            className={cn("h-7 w-7 transition-all", liked ? "fill-red-500 text-red-500 scale-110" : "text-white")}
          />
        </button>
        <span className="text-sm mt-1">{likeCount}</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={handleCommentClick}
          className="bg-black/30 rounded-full p-3 transition-transform active:scale-90"
          aria-label="Show comments"
        >
          <MessageCircle className="h-7 w-7" />
        </button>
        <span className="text-sm mt-1">{video.comments}</span>
      </div>

      <div className="flex flex-col items-center">
        <button
          onClick={handleTip}
          className="bg-black/30 rounded-full p-3 transition-transform active:scale-90"
          aria-label="Send tip"
        >
          <DollarSign className="h-7 w-7" />
        </button>
        <span className="text-sm mt-1">Tip</span>
      </div>

      <Dialog open={showTipDialog} onOpenChange={setShowTipDialog}>
        <DialogContent className="bg-zinc-900 text-white border-zinc-800 max-w-sm mx-auto">
          <DialogHeader>
            <DialogTitle className="text-center">Support this creator</DialogTitle>
          </DialogHeader>

          <div className="py-4">
            <p className="text-center text-zinc-400 mb-4">
              Send a USDC tip to {video.username}
            </p>

            {address ? (
              <div className="space-y-6">
                {/* Tip amount selection */}
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-center">Select tip amount (USDC)</h3>
                  <div className="grid grid-cols-3 gap-2">
                    {tipAmounts.map((amount) => (
                      <button
                        key={amount}
                        className={cn(
                          "py-2 px-3 rounded-lg text-sm font-medium transition-colors",
                          selectedAmount === amount 
                            ? "bg-blue-600 text-white" 
                            : "bg-zinc-800 hover:bg-zinc-700 text-zinc-200"
                        )}
                        onClick={() => setSelectedAmount(amount)}
                      >
                        ${amount}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Transaction status */}
                {isTxSuccess ? (
                  <div className="flex items-center justify-center bg-green-500/20 text-green-500 font-medium p-3 rounded-lg">
                    <Check className="h-5 w-5 mr-2" />
                    <span>Tip sent successfully!</span>
                  </div>
                ) : (
                  <button 
                    onClick={handleSendTip}
                    disabled={!selectedAmount || isWritePending || isTxLoading}
                    className={cn(
                      "w-full py-3 rounded-lg font-bold transition-all",
                      selectedAmount && !isWritePending && !isTxLoading
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                    )}
                  >
                    {isWritePending || isTxLoading
                      ? "Processing..."
                      : selectedAmount
                        ? `Send $${selectedAmount} Tip`
                        : "Select an amount first"}
                  </button>
                )}
                
                <div className="text-xs text-zinc-500 text-center pt-2">
                  Tips are sent using USDC on Base
                </div>
              </div>
            ) : (
              <div className="text-center text-yellow-400 text-sm p-3 bg-yellow-400/10 rounded-md">
                Please connect your wallet to send a tip
              </div>
            )}
          </div>
          
          <div className="mt-2">
            <button
              className="w-full bg-zinc-800 hover:bg-zinc-700 py-2 rounded-lg font-medium"
              onClick={() => setShowTipDialog(false)}
            >
              Cancel
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
} 