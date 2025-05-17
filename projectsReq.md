# Project Requirements

## Hour 0–1: **Firebase + OnchainKit Setup**

- **Prompt 0.1:** "Initialize Firebase SDK (v9 modular) for auth, firestore, storage. Export auth, db, firebaseApp from lib/firebase.ts."

- **Prompt 0.2:** "Wrap Next.js _app.tsx in <OnchainKitProvider> using Base chain. Add your API key and config with theme. Load @coinbase/onchainkit/styles.css."

- **Prompt 0.3:** "Add Firebase Anonymous Auth: auto-sign anonymous users on load and store uid."

---

## Hour 1–2: **Wallet Connection + Identity Display**

- **Prompt 1.1:** "Create components/WalletConnect.tsx that renders <Wallet />. Show in your site header."

- **Prompt 1.2:** "Create components/ProfileCard.tsx. Inside, use OnchainKit's <Identity /> to show the connected wallet address and ENS/avatar if available."

- **Prompt 1.3:** "Write Firestore update on wallet connect: when user connects wallet, update /users/{uid} with walletAddress."

---

## Hour 2–3: **Fund Wallet UI**

- **Prompt 2.1:** "Create pages/wallet.tsx and add <FundButton /> to let users add funds to their Base wallet."

- **Prompt 2.2:** "Write Firebase rule to allow updating user's wallet data only if request.auth.uid == userId."

---

## Hour 3–5: **NFT Mint Card for Stories**

- **Prompt 3.1:** "Create mock story data in Firestore under /stories/{storyId} with title, coverImage, description."

- **Prompt 3.2:** "Build pages/stories/[id].tsx that loads a story and conditionally shows <NFTMintCard /> if the viewer is the creator."

- **Prompt 3.3:** "On successful mint, write minted: true, txHash, and walletAddress into the story document."

---

## Hour 5–6: **Tipping UI with <Checkout />**

- **Prompt 4.1:** "Create components/TipCard.tsx with a preset tip amount selector and <Checkout productId={creatorWalletAddress} />."

- **Prompt 4.2:** "Add tipping to the story view page (below video). Pass in creator's address as productId to Checkout."

- **Prompt 4.3:** "Write Firestore transactions/{txId} with userId, storyId, creatorWallet, timestamp after successful tip."

---

## Hour 6–7: **Follow/Favorite UI + Identity Readout**

- **Prompt 5.1:** "Create /users/[uid].tsx public profile page. Use <Identity userId={walletAddress} /> and show all stories minted by that user."

- **Prompt 5.2:** "Build a simple follow button. On click, create doc /users/{targetUid}/followers/{currentUid}."

- **Prompt 5.3:** "Show followersCount on user profile by counting subcollection length. Display favorites as separate Firestore query to /users/{uid}/favorites."

---

## Hour 7–8: **Polish + Docs + Deploy**

- **Prompt 6.1:** "Build one-page /docs/onchain.md that documents how OnchainKit was integrated with wallet, minting, tipping, and funding."

- **Prompt 6.2:** "Deploy to Vercel. Enable Firebase Hosting rewrite to forward auth/session if needed."

- **Prompt 6.3:** "Record a 2-minute walkthrough: Connect Wallet → View Profile → Mint Story → Tip Creator → View Mint Badge."
