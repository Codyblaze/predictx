# PredictX — Pitch Deck
### AI-Powered Prediction Markets on X1 EcoChain

---

## Slide 1 — Problem

The prediction market space is dominated by slow, expensive chains (Ethereum, Polygon)
with gas fees that make small bets economically unviable.

- **$2-5 gas per transaction** on Ethereum kills retail participation
- No AI layer — users bet blind without data-backed probability context  
- Complex UX deters mainstream adoption

---

## Slide 2 — Solution: PredictX

A fully decentralized, AI-augmented prediction market built exclusively on X1 EcoChain.

**Core features:**
- Binary (YES/NO) outcome markets on crypto prices, sports, macro events
- Real-time AI probability scoring (GPT-4o-mini sentiment analysis)
- Sub-cent gas fees (~$0.01) on X1 EcoChain
- Non-custodial escrow — smart contracts hold and distribute funds
- 90-second transaction finality on X1 PoN consensus

---

## Slide 3 — Market Opportunity

| Metric | Value |
|---|---|
| Prediction Market TAM (2026) | $14.1B |
| Polymarket 2025 volume | $3.8B |
| Average Ethereum gas per bet | ~$3.50 |
| Average X1 EcoChain gas per bet | ~$0.01 |
| Cost advantage | **350x cheaper** |

X1's fee structure makes PredictX accessible to the long tail of bettors priced out of current solutions.

---

## Slide 4 — Product

### Smart Contracts (Solidity, EVM)
- `MarketFactory` — creates and indexes markets
- `PredictionMarket` — binary escrow, bet tracking, payout calculation
- `MockOracle` → upgradeable to Chainlink/DIA on mainnet

### Frontend (Next.js 14 + wagmi)
- Connect any EVM wallet (MetaMask, WalletConnect)
- Browse markets by category with live YES/NO pool ratios
- Real-time AI probability badges on every market
- One-click bet placement and winnings claim

### AI Layer (OpenAI GPT-4o-mini)
- Serverless `/api/ai-score` route
- Analyzes question text + current market distribution
- Returns: YES%, NO%, confidence, 2-sentence summary
- Cached 5 minutes to minimize API costs

---

## Slide 5 — Tech Stack

```
Smart Contracts   Solidity ^0.8.24 + OpenZeppelin + Hardhat
Frontend          Next.js 14, TailwindCSS, wagmi v2, RainbowKit
AI                OpenAI GPT-4o-mini (serverless route)
Hosting           Vercel (frontend) + X1 Maculatus Testnet
Chain             X1 EcoChain (EVM, PoA, Chain ID 10778/204004)
```

---

## Slide 6 — Traction / Roadmap

| Phase | Timeline | Milestone |
|---|---|---|
| M1 — Contracts | Day 1-28 | Deployed on X1 Testnet, 3 live demo markets, 100% tests |
| M2 — Frontend | Day 29-56 | Live staging URL, 10+ testnet wallets, AI scoring live |
| M3 — Mainnet | Day 57-84 | Audit complete, deployed to X1 Mainnet, public beta |
| M4 — Growth | Day 85-112 | 100+ wallets, 500+ on-chain txns, 10+ active markets |

---

## Slide 7 — Budget ($35,000)

| Item | Amount |
|---|---|
| Developer time (112 days, solo) | $29,500 |
| Smart contract audit (3rd party) | $3,000 |
| Marketing & community growth | $1,500 |
| Infrastructure (hosting, RPC, domain) | $500 |
| AI API costs (3 months) | $500 |
| **Total** | **$35,000** |

**Payment schedule:** 20% upfront ($7,000) + 4 x milestone tranches of $7,000.

---

## Slide 8 — Why X1 EcoChain

- **EVM-compatible**: zero migration effort for Solidity contracts
- **350x cheaper gas** than Ethereum — enables micro-bets
- **~3Wh node energy** — aligns with PredictX's sustainability narrative
- **Active grant program** — ecosystem co-marketing support
- **Q3 2026 TGE roadmap** — PredictX launches ahead of mainnet for early mover advantage

---

## Slide 9 — Team

**Solo Builder** (1 person)
- Full-Stack Blockchain Developer
- Solidity smart contract development
- Next.js / React frontend
- AI/ML API integration
- Web3 UX design

*Team size: 1 — deliberately scoped to MVP for maximum execution speed.*

---

## Slide 10 — Ask

**$35,000 non-dilutive grant from X1 EcoChain Ecosystem Program**

In return, X1 EcoChain gets:
- A high-activity dApp driving daily on-chain transactions
- A flagship AI + DeFi product for ecosystem showcasing
- 100+ new wallet addresses onboarded to X1 in 112 days
- Co-marketing content and community growth

---

*PredictX — Bet on what you know. Powered by X1 EcoChain.*
