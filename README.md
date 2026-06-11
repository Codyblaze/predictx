# PredictX — AI-Powered Prediction Market on X1 EcoChain

PredictX is a decentralized prediction market dApp built on X1 EcoChain. Users create and bet on real-world outcome markets (crypto prices, sports, macro events) using X1 tokens. An integrated AI layer provides real-time probability scoring using LLM sentiment analysis.

**Website:** https://predictx1.com

## Architecture

```
contracts/          Solidity smart contracts (EVM-compatible)
frontend/           Next.js 14 + TailwindCSS + wagmi dApp
scripts/            Hardhat deployment & verification scripts
test/               Contract unit tests (Hardhat + ethers)
audit/              Test coverage and security summary
```

## Smart Contracts

| Contract | Description |
|---|---|
| `MarketFactory` | Deploys new `PredictionMarket` instances, maintains registry |
| `PredictionMarket` | Individual market: accepts bets, holds funds in escrow, resolves outcome |
| `MockOracle` | Testnet oracle for resolving markets (owner-controlled) |

## Tech Stack

- **Contracts:** Solidity ^0.8.24, Hardhat, OpenZeppelin
- **Frontend:** Next.js 14 (App Router), TailwindCSS, wagmi v2, viem, RainbowKit
- **AI:** OpenAI GPT-4o-mini via `/api/ai-score` serverless route
- **Chain:** X1 EcoChain (EVM-compatible, PoA, ~3Wh nodes)

## X1 EcoChain Network Config

| Network | Chain ID | RPC | Explorer |
|---|---|---|---|
| Maculatus Testnet | 10778 | `https://maculatus-rpc.x1eco.com` | `https://maculatus-scan.x1eco.com` |
| Mainnet | 204004 | `https://rpc.x1ecochain.com` | `https://scan.x1ecochain.com` |

## Quick Start

```bash
npm install
npx hardhat compile
npx hardhat test
npx hardhat run scripts/deploy.js --network x1testnet

cd frontend
npm install
npm run dev
```

## Environment Variables

```env
# .env (contracts)
PRIVATE_KEY=your_deployer_private_key
X1_TESTNET_RPC=https://maculatus-rpc.x1eco.com
X1_MAINNET_RPC=https://rpc.x1ecochain.com

# frontend/.env.local
NEXT_PUBLIC_CHAIN_ID=10778
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x...deployed_address
OPENAI_API_KEY=sk-...
```

## License

MIT
