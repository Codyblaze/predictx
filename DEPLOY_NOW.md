# PredictX — Deploy & Submit (Your Action Items)

Everything is built and tested. These are the **manual steps only you can do**:

---

## STEP 1 — Domain

Domain registered: **predictx1.com** (Namecheap)

Point DNS to Vercel after frontend deploy (see Step 5).

---

## STEP 2 — Social Accounts

**Twitter/X:** `@predict_x1`

**Telegram:** Create channel and post launch message from `deck/gtm-social-content.md`

---

## STEP 3 — Push to GitHub

```bash
cd predictx1
git init
git add .
git commit -m "feat: initial PredictX — AI prediction markets on X1 EcoChain"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/predictx.git
git push -u origin main
```

Set repo description + topics + website from `deck/github-setup-guide.md`.

---

## STEP 4 — Deploy Contracts to X1 Testnet (30 min)

Full instructions in: `deck/testnet-deployment-guide.md`

```bash
cd predictx1
cp .env.example .env
# Edit .env with your wallet private key

# Get testnet coins from https://dev.x1ecochain.com
npm run deploy:testnet
```

---

## STEP 5 — Deploy Frontend to Vercel (20 min, free)

1. Go to https://vercel.com/new → Import GitHub repo `predictx`
2. Set **Root Directory** to `frontend`
3. Add environment variables:
   ```
   NEXT_PUBLIC_CHAIN_ID=10778
   NEXT_PUBLIC_MARKET_FACTORY_ADDRESS=0x...from_step_4
   NEXT_PUBLIC_ORACLE_ADDRESS=0x...from_step_4
   NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID=...from_walletconnect.com
   OPENAI_API_KEY=sk-...from_openai.com
   ```
4. Deploy → get your Vercel URL
5. Add custom domain `predictx1.com` in Vercel settings
6. Copy DNS records from Vercel into Namecheap Advanced DNS

**API keys:**
- WalletConnect: https://cloud.walletconnect.com
- OpenAI: https://platform.openai.com/api-keys

---

## STEP 6 — Submit the Grant Application

Form URL: https://airtable.com/appMvL5KlSmE9J3I4/paglccI2kQaFErlF3/form

Grant answers are in `deck/grant-application-answers.md` (local only, not in git).

**Before submitting, verify:**
- [ ] https://predictx1.com is live
- [ ] @predict_x1 on Twitter exists
- [ ] GitHub repo is public
- [ ] At least 1 contract deployed to X1 Testnet
- [ ] Personal bio filled in on the form

---

## STEP 7 (Post-Grant) — Mainnet

Follow: `deck/mainnet-launch-guide.md`

```bash
npm run deploy:mainnet
```

Update Vercel env vars with mainnet addresses.

---

## What's Already Built

| Item | Status |
|---|---|
| Smart contracts (3) | Complete |
| 40 unit tests (100% line coverage) | Passing |
| Deploy / verify scripts | Ready |
| Next.js frontend (9 components) | Build passes |
| `/api/ai-score` route | Complete |
| Pitch deck | `deck/pitch-deck.md` |
| GTM social content | `deck/gtm-social-content.md` |
| Audit report | `audit/audit-report.md` |
| GitHub Actions CI | `.github/workflows/test.yml` |
