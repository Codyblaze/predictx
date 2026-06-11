# Testnet Deployment Guide — X1 Maculatus Testnet

## Step 1 — Get a wallet and testnet coins

1. Install MetaMask (https://metamask.io) if you don't have it
2. Add X1 Maculatus Testnet to MetaMask:
   - Network Name: `X1 EcoChain Testnet`
   - RPC URL: `https://rpc-testnet.x1ecochain.com`
   - Chain ID: `204005`
   - Currency Symbol: `X1`
   - Block Explorer: `https://explorer-testnet.x1ecochain.com`
3. Copy your wallet address
4. Go to https://dev.x1ecochain.com → "Testnet Coin" faucet → request coins
5. Verify balance in MetaMask (should receive testnet X1)

---

## Step 2 — Configure the deployer wallet

In the `predictx` folder, create a `.env` file:

```bash
# Copy from .env.example
cp .env.example .env
```

Edit `.env`:
```
PRIVATE_KEY=0x[YOUR_METAMASK_PRIVATE_KEY]
X1_TESTNET_RPC=https://rpc-testnet.x1ecochain.com
X1_MAINNET_RPC=https://rpc.x1ecochain.com
```

> ⚠️ NEVER commit the `.env` file. It's already in `.gitignore`.

To export your private key from MetaMask:
Account Details → Export Private Key → Enter password → Copy key

---

## Step 3 — Deploy to Maculatus Testnet

```bash
cd predictx
npm run deploy:testnet
```

Expected output:
```
Deploying on: x1testnet
Deployer: 0xYOUR_ADDRESS
Balance: X.XX X1

1. Deploying MockOracle...
   MockOracle deployed at: 0xAAA...

2. Deploying MarketFactory...
   MarketFactory deployed at: 0xBBB...

3. Creating demo markets...
   Market "Will BTC exceed $100,000..." → 0xCCC...
   Market "Will ETH 2.0 staking APY..." → 0xDDD...
   Market "Will X1 EcoChain reach..." → 0xEEE...

Deployment saved to: deployments/x1testnet.json

--- Add to frontend/.env.local ---
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0xBBB...
NEXT_PUBLIC_ORACLE_ADDRESS=0xAAA...
NEXT_PUBLIC_CHAIN_ID=204005
```

---

## Step 4 — Verify on the testnet explorer

1. Go to https://explorer-testnet.x1ecochain.com
2. Search for your `MarketFactory` address
3. Screenshot the deployed contract for grant evidence

---

## Step 5 — Update frontend environment

Create `frontend/.env.local` from the deploy output:

```env
NEXT_PUBLIC_CHAIN_ID=204005
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0xBBB...YOUR_FACTORY_ADDRESS
NEXT_PUBLIC_ORACLE_ADDRESS=0xAAA...YOUR_ORACLE_ADDRESS
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_project_id_from_walletconnect_cloud
OPENAI_API_KEY=sk-...your_openai_api_key
```

Get a free WalletConnect project ID at: https://cloud.walletconnect.com
Get OpenAI API key at: https://platform.openai.com/api-keys

---

## Step 6 — Run the frontend locally

```bash
cd predictx/frontend
npm install
npm run dev
```

Open http://localhost:3000 — connect MetaMask to X1 Testnet and test the full flow.

---

## Milestone 1 Evidence to Submit

When claiming Milestone 1, provide:
- [ ] `deployments/x1testnet.json` file contents
- [ ] Screenshots of deployed contracts on testnet explorer
- [ ] GitHub repo link showing passing CI
- [ ] 3 live market addresses on testnet
- [ ] Screenshot of `npx hardhat test` showing 40 passing tests
