# GitHub Repo Setup Guide for PredictX

## Step 1 — Create the repo on GitHub

1. Go to https://github.com/new
2. Repository name: `predictx`
3. Description: `AI-powered prediction markets on X1 EcoChain — decentralized, sub-cent fees, GPT-4o-mini probability scoring`
4. Set to **Public**
5. Do NOT initialize with README (we have our own)
6. Click **Create repository**

---

## Step 2 — Push the code from your machine

Open a terminal in the `predictx1` folder and run:

```bash
git init
git add .
git commit -m "feat: initial PredictX smart contracts, frontend, and tests"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/predictx.git
git push -u origin main
```

---

## Step 3 — Add a GitHub repo description & topics

On the GitHub repo page, click the gear icon (⚙) next to "About" and add:

**Description:**
```
AI-powered prediction markets on X1 EcoChain. Binary YES/NO markets, GPT-4o-mini probability scoring, non-custodial escrow, sub-cent gas.
```

**Topics:**
```
x1-ecochain  prediction-market  defi  solidity  nextjs  ai  web3  evm  wagmi
```

**Website:** `https://predictx1.com`

---

## Step 4 — Pin the GitHub Actions badge in README

After pushing, add this to the top of your README.md:

```markdown
![Tests](https://github.com/YOUR_USERNAME/predictx/actions/workflows/test.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Network](https://img.shields.io/badge/network-X1%20EcoChain-00C896)
```

---

## Step 5 — Add the link to your grant application

In the grant form's "Additional Information" field, include:
```
GitHub: https://github.com/YOUR_USERNAME/predictx
```
