"use client";

import { type ReactNode } from "react";
import { baseSepolia } from "wagmi/chains";
import { OnchainKitProvider } from "@coinbase/onchainkit";
import { AuthProvider } from "@/lib/auth-context";

export function Providers(props: { children: ReactNode }) {
  return (
    <OnchainKitProvider
      apiKey={process.env.NEXT_PUBLIC_ONCHAINKIT_API_KEY}
      chain={baseSepolia}
    >
      <AuthProvider>
        {props.children}
      </AuthProvider>
    </OnchainKitProvider>
  );
}
