"use client"

import { Avatar, Name } from "@coinbase/onchainkit/identity"
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet"
import { useAccount } from "wagmi"
import { useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { updateUserWalletAddress } from "@/lib/user-hooks"

export function WalletConnect() {
  const { user } = useAuth()
  const { address, isConnected } = useAccount()

  // When wallet gets connected, update the user's information in Firestore
  useEffect(() => {
    if (isConnected && address && user) {
      updateUserWalletAddress(user.uid, address)
        .then((success) => {
          if (success) {
            console.log("Wallet info updated in Firebase")
          }
        })
        .catch((error) => {
          console.error("Error updating wallet info:", error)
        })
    }
  }, [isConnected, address, user])

  return (
    <div className="flex justify-center">
      <Wallet>
        <ConnectWallet className="flex items-center bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg py-2 px-3 text-sm font-medium">
          <Avatar className="h-5 w-5 mr-2" />
          <Name />
        </ConnectWallet>
        <WalletDropdown>
          <WalletDropdownDisconnect className="text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-md p-2" />
        </WalletDropdown>
      </Wallet>
    </div>
  )
} 