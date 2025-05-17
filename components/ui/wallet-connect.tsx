"use client"

import { Avatar, Name } from "@coinbase/onchainkit/identity"
import { Wallet, ConnectWallet, WalletDropdown, WalletDropdownDisconnect } from "@coinbase/onchainkit/wallet"

export function WalletConnect() {
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