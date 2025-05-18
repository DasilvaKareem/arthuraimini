"use client"

import { useState, useEffect } from "react"
import { Heart, MessageCircle, DollarSign, Check, AlertCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useChainId, useSwitchChain } from "wagmi"
import { baseSepolia } from "wagmi/chains"
import { usdcContractConfig, getTransferArgs } from "@/lib/token-service"
import { db } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"

interface VideoActionsProps {
  video: {
    id: string | number
    likes: number
    comments: number
    username: string
    authorId?: string
  }
  onCommentClick: () => void
}

export default function VideoActions({ video, onCommentClick }: VideoActionsProps) {
  const [liked, setLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(video.likes)
  const [showTipDialog, setShowTipDialog] = useState(false)
  const [selectedAmount, setSelectedAmount] = useState<string>("")
  const [creatorWalletAddress, setCreatorWalletAddress] = useState<string | null>(null)
  const [isLoadingWallet, setIsLoadingWallet] = useState(false)
  const [chainSwitchError, setChainSwitchError] = useState<string | null>(null)
  const [txError, setTxError] = useState<string | null>(null)
  
  const { address } = useAccount()
  const chainId = useChainId()
  const { switchChain, isPending: isSwitchingChain } = useSwitchChain()

  // Check if user is on the correct chain (Base)
  const isCorrectChain = chainId === baseSepolia.id

  // Fallback creator addresses based on username - used if Firebase query fails
  const fallbackAddresses: Record<string, string> = {
    "@creativeminds": "0x0000000000000000000000000000000000000001",
    "@techexplorer": "0x0000000000000000000000000000000000000002",
    "@aimasters": "0x0000000000000000000000000000000000000003"
  }

  // Tip amount options
  const tipAmounts = ["0.01", "0.05", "0.10"]

  // Clear transaction error when amount changes
  useEffect(() => {
    if (txError) {
      setTxError(null);
    }
  }, [selectedAmount]);

  // Fetch creator's wallet address from Firebase when needed
  useEffect(() => {
    const fetchCreatorWalletAddress = async () => {
      if (!showTipDialog || creatorWalletAddress || !db) return;
      
      setIsLoadingWallet(true);
      
      try {
        // If we have an authorId, use it to query for the wallet address
        if (video.authorId) {
          console.log(`Querying wallet address for author ID: ${video.authorId}`);
          const userRef = doc(db, 'users', video.authorId);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists() && userSnap.data().walletAddress) {
            const walletAddress = userSnap.data().walletAddress;
            console.log(`Found wallet address: ${walletAddress}`);
            setCreatorWalletAddress(walletAddress);
          } else {
            console.log(`No wallet address found for author ID: ${video.authorId}`);
            // Fall back to mock address
            setCreatorWalletAddress(fallbackAddresses[video.username] || fallbackAddresses["@creativeminds"]);
          }
        } else {
          // Fall back to mock address if no authorId
          console.log("No author ID available, using fallback address");
          setCreatorWalletAddress(fallbackAddresses[video.username] || fallbackAddresses["@creativeminds"]);
        }
      } catch (error) {
        console.error("Error fetching wallet address:", error);
        // Fall back to mock address
        setCreatorWalletAddress(fallbackAddresses[video.username] || fallbackAddresses["@creativeminds"]);
      } finally {
        setIsLoadingWallet(false);
      }
    };

    fetchCreatorWalletAddress();
  }, [showTipDialog, video.authorId, video.username, creatorWalletAddress]);

  // Reset chain error when chain changes
  useEffect(() => {
    if (isCorrectChain) {
      setChainSwitchError(null);
    }
  }, [isCorrectChain]);

  // Setup contract write for USDC transfer
  const {
    data: hash,
    isPending: isWritePending,
    writeContract,
    error: writeError,
    isError: isWriteError
  } = useWriteContract()

  // Update txError state when writeError changes
  useEffect(() => {
    if (isWriteError && writeError) {
      const errorMessage = typeof writeError === 'object' && writeError.message 
        ? writeError.message 
        : 'Transaction failed. Please try again.';
      
      // Format and display a user-friendly error message
      const userFriendlyError = errorMessage.includes('insufficient funds') 
        ? 'Insufficient funds to complete the transaction.' 
        : errorMessage.length > 100 
          ? 'Transaction failed. Please try again.' 
          : errorMessage;
      
      setTxError(userFriendlyError);
      console.error("Transaction error:", writeError);
    }
  }, [writeError, isWriteError]);

  // Track the transaction status
  const {
    isLoading: isTxLoading,
    isSuccess: isTxSuccess,
    error: txReceiptError,
    isError: isTxReceiptError
  } = useWaitForTransactionReceipt({
    hash,
  })

  // Update txError state when txReceiptError changes
  useEffect(() => {
    if (isTxReceiptError && txReceiptError) {
      const errorMessage = typeof txReceiptError === 'object' && txReceiptError.message 
        ? txReceiptError.message 
        : 'Transaction failed. Please try again.';
      
      setTxError(errorMessage.length > 100 ? 'Transaction failed to complete.' : errorMessage);
      console.error("Transaction receipt error:", txReceiptError);
    }
  }, [txReceiptError, isTxReceiptError]);

  // Handle transaction success in useEffect to prevent hanging
  useEffect(() => {
    if (isTxSuccess && showTipDialog) {
      // Clear any errors
      setTxError(null);
      
      // Add delay to show success message before closing dialog
      const timer = setTimeout(() => {
        setShowTipDialog(false);
        setSelectedAmount("");
      }, 2000);
      
      return () => clearTimeout(timer); // Clean up timeout
    }
  }, [isTxSuccess, showTipDialog]);

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

  // Function to switch to Base chain
  const handleSwitchToBase = async () => {
    try {
      setChainSwitchError(null);
      await switchChain({ chainId: baseSepolia.id });
    } catch (error) {
      console.error("Error switching chain:", error);
      setChainSwitchError("Failed to switch to Base network. Please try again or switch manually.");
    }
  };

  const handleSendTip = async () => {
    if (!selectedAmount || !address || !creatorWalletAddress) return;
    
    // Reset any previous errors
    setTxError(null);
    
    // Check if on correct chain first
    if (!isCorrectChain) {
      await handleSwitchToBase();
      return;
    }
    
    // If we got here, we're on the correct chain, so execute the transfer
    try {
      // Get the transfer arguments
      const args = getTransferArgs(creatorWalletAddress, selectedAmount);
      
      // Execute the transfer
      writeContract({
        ...usdcContractConfig,
        functionName: 'transfer',
        args
      });
      
      // Log transaction initiation
      console.log("Tip transaction initiated");
    } catch (error) {
      console.error("Error sending tip:", error);
      setTxError(typeof error === 'object' && error && 'message' in error 
        ? (error.message as string) 
        : 'Failed to send transaction. Please try again.');
    }
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
                {isLoadingWallet ? (
                  <div className="text-center p-3">
                    <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mx-auto mb-2"></div>
                    <p className="text-sm text-zinc-400">Loading creator wallet...</p>
                  </div>
                ) : !creatorWalletAddress ? (
                  <div className="text-center text-yellow-400 text-sm p-3 bg-yellow-400/10 rounded-md">
                    Could not find creator wallet address
                  </div>
                ) : (
                  <>
                    {!isCorrectChain && (
                      <div className="flex items-center justify-center bg-yellow-500/20 text-yellow-500 font-medium p-3 rounded-lg mb-4">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">You need to switch to Base network</span>
                      </div>
                    )}

                    {chainSwitchError && (
                      <div className="flex items-center justify-center bg-red-500/20 text-red-500 font-medium p-3 rounded-lg mb-4">
                        <AlertCircle className="h-5 w-5 mr-2" />
                        <span className="text-sm">{chainSwitchError}</span>
                      </div>
                    )}
                    
                    {txError && (
                      <div className="flex items-center bg-red-500/20 text-red-500 font-medium p-3 rounded-lg mb-4">
                        <XCircle className="h-5 w-5 mr-2 flex-shrink-0" />
                        <span className="text-sm">{txError}</span>
                      </div>
                    )}

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
                        disabled={!selectedAmount || isWritePending || isTxLoading || isSwitchingChain}
                        className={cn(
                          "w-full py-3 rounded-lg font-bold transition-all",
                          selectedAmount && !isWritePending && !isTxLoading && !isSwitchingChain
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-zinc-800 text-zinc-500 cursor-not-allowed"
                        )}
                      >
                        {isWritePending || isTxLoading
                          ? "Processing..."
                          : isSwitchingChain
                            ? "Switching Chain..."
                            : !isCorrectChain
                              ? "Switch to Base Network"
                              : selectedAmount
                                ? `Send $${selectedAmount} Tip`
                                : "Select an amount first"}
                      </button>
                    )}
                  </>
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