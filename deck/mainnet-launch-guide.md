# Mainnet Launch Guide — X1 EcoChain

## Pre-launch Checklist

- [ ] Audit report published to GitHub (`audit/audit-report.md`)
- [ ] All Critical and High findings resolved
- [ ] Frontend tested end-to-end on testnet for 1 week with 10+ wallets
- [ ] Domain `predictx1.com` pointing to Vercel deployment
- [ ] WalletConnect project ID set to production domain
- [ ] OpenAI API key has sufficient credits
- [ ] Telegram channel has at least 100 members

---

## Step 1 — Deploy to X1 Mainnet

```bash
cd predictx1
npm run deploy:mainnet
```

Update `frontend/.env.local` (for Vercel production env vars):
```env
NEXT_PUBLIC_CHAIN_ID=204004
NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x...MAINNET_FACTORY
NEXT_PUBLIC_ORACLE_ADDRESS=0x...MAINNET_ORACLE
NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=your_production_project_id
OPENAI_API_KEY=sk-...
```

---

## Step 2 — Deploy Frontend to Vercel

1. Push code to GitHub
2. Go to https://vercel.com/new
3. Import the `predictx` GitHub repo
4. Set root directory to `frontend`
5. Add all environment variables from `.env.local`
6. Deploy

Vercel will auto-assign a `.vercel.app` URL. Point your custom domain:
- In Vercel → Settings → Domains → Add `predictx1.com`
- In your DNS registrar → Add CNAME record:
  - Name: `@` or `www`
  - Value: `cname.vercel-dns.com`

---

## Step 3 — Seed Initial Markets on Mainnet

After deployment, use the frontend to create at least 3 compelling markets:

1. "Will BTC reach $150,000 before end of 2026?"
2. "Will X1 EcoChain reach 1,000 active dApps by Q4 2026?"
3. "Will the X1 TGE happen before September 2026?"

These markets will drive initial on-chain activity and appear in marketing content.

---

## Step 4 — Execute GTM Launch

Day 1 — Mainnet Launch:
- Post the Twitter/X announcement thread (see `gtm-social-content.md`)
- Send the Telegram launch message
- Post in crypto Discord servers (Polymarket, Augur communities)
- Submit to DeFi Llama new protocol listing

Week 1 goal: 50 on-chain transactions

---

## Milestone 3 Evidence to Submit

- [ ] `deployments/x1mainnet.json` contents
- [ ] Live URL (predictx1.com)
- [ ] Published audit report link
- [ ] X1 Mainnet explorer links for contracts
- [ ] Transaction count screenshot (50+ in first 7 days)

---

## Milestone 4 Tracking (Weeks 13-16)

Track weekly via the testnet/mainnet explorer:

```bash
# Check factory market count
# Run in Hardhat console connected to mainnet:
npx hardhat console --network x1mainnet

const factory = await ethers.getContractAt("MarketFactory", "0x...MAINNET_FACTORY")
await factory.getMarketCount()
```

Weekly report template is in `gtm-social-content.md`.
