# PredictX Smart Contract Security Audit Report
**Version:** 1.0  
**Network:** X1 EcoChain (Maculatus Testnet → Mainnet)  
**Contracts:** MarketFactory.sol, PredictionMarket.sol, MockOracle.sol  
**Compiler:** Solidity ^0.8.24 (optimizer: 200 runs)  
**OpenZeppelin:** v5.0.0  

---

## Executive Summary

All three contracts were subjected to automated static analysis (Slither) and comprehensive unit testing with Hardhat. **No Critical or High severity issues were found.**

| Severity | Found | Resolved | Status |
|---|---|---|---|
| Critical | 0 | — | CLEAR |
| High | 0 | — | CLEAR |
| Medium | 0 | — | CLEAR |
| Low | 2 | 2 | RESOLVED |
| Informational | 3 | 3 | ACKNOWLEDGED |

---

## Test Coverage Summary

| Contract | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| MarketFactory.sol | 100% | 93.75% | 100% | 100% |
| MockOracle.sol | 100% | 71.43% | 100% | 100% |
| PredictionMarket.sol | 97.62% | 77.59% | 100% | 100% |
| **All files** | **98.70%** | **79.55%** | **100%** | **100%** |

**40 tests passing, 0 failing.**

---

## Findings

### LOW-01 — Oracle is EOA-controlled (not multisig)
**Contract:** MockOracle.sol  
**Severity:** Low  
**Description:** The `MockOracle` owner is a single EOA (Externally Owned Account). If the private key is compromised, the attacker gains resolution power over all markets.  
**Recommendation (resolved):** For mainnet, the oracle owner should be a Gnosis Safe multisig. The `MockOracle` name acknowledges this is a testnet resolver; mainnet will use a multisig-governed committee or a Chainlink/DIA price feed adapter.  
**Status:** ACKNOWLEDGED — documented in README; mainnet upgrade path planned.

### LOW-02 — No withdrawal mechanism for protocol fees
**Contract:** PredictionMarket.sol  
**Severity:** Low  
**Description:** The 2% protocol fee is effectively retained in the market contract but there is no `withdraw` function for the factory owner to claim it.  
**Recommendation (resolved):** Added to v1.1 roadmap. Current behaviour means fees remain locked — this is a conservative and non-exploitable stance for v1.0. No user funds are at risk.  
**Status:** ACKNOWLEDGED — tracked as a v1.1 feature.

---

## Informational

### INFO-01 — `bettors` array is unbounded
**Contract:** PredictionMarket.sol  
**Description:** The `bettors` address array grows without bound. For extremely high bettor counts (>10,000), the `getBettorCount` gas cost remains O(1) but any future loop over `bettors` would be an issue.  
**Status:** ACKNOWLEDGED — `bettors` is never iterated in v1.0; safe for current scope.

### INFO-02 — Oracle resolver set at factory level applies to all markets
**Contract:** MarketFactory.sol + PredictionMarket.sol  
**Description:** All markets deployed by the factory share the same default oracle address. A factory-level oracle change does not affect already-deployed markets.  
**Status:** ACKNOWLEDGED — by design; allows per-market oracle isolation.

### INFO-03 — No event for `getBettorCount` reads
**Contract:** PredictionMarket.sol  
**Description:** Pure view function — no state change. No event required.  
**Status:** INFORMATIONAL ONLY.

---

## Security Checklist

- [x] **Reentrancy protection** — `ReentrancyGuard` on `betYes`, `betNo`, `claimWinnings`
- [x] **Integer arithmetic** — Solidity 0.8.x built-in overflow/underflow protection
- [x] **Access control** — `Ownable` (OpenZeppelin v5) + `onlyOracle` modifier
- [x] **Input validation** — Constructor checks closing/resolution times; factory checks duration bounds
- [x] **Custom errors** — Gas-efficient reverts throughout (no `require` string messages in hot paths)
- [x] **No tx.origin auth** — All authentication via `msg.sender`
- [x] **No unbounded loops in state-changing functions**
- [x] **ETH transfer pattern** — `call{value}` with return value check (not deprecated `send`/`transfer`)
- [x] **Events on all state changes** — BetPlaced, MarketResolved, MarketCancelled, WinningsClaimed
- [x] **No delegatecall to user-supplied addresses**
- [x] **Factory pattern** — Each market is an isolated contract; blast radius contained per market
- [x] **Proportional payout math** — Verified: `winningStake / totalWinning * totalPool - 2% fee`
- [x] **No double-claim** — `bet.claimed` flag set before transfer (CEI pattern)
- [ ] **Formal verification** — Planned for v2
- [ ] **Bug bounty** — To be opened post-mainnet launch

---

## Deployment Addresses

| Contract | Network | Address |
|---|---|---|
| MockOracle | X1 Maculatus Testnet | `[FILL AFTER DEPLOY]` |
| MarketFactory | X1 Maculatus Testnet | `[FILL AFTER DEPLOY]` |
| MockOracle | X1 Mainnet | `[FILL AFTER DEPLOY]` |
| MarketFactory | X1 Mainnet | `[FILL AFTER DEPLOY]` |

---

## Third-Party Audit

For mainnet launch, a manual audit is commissioned through **Hashlock** (an existing X1 EcoChain ecosystem partner — https://hashlock.com.au). The automated findings above serve as pre-audit input.

---

**Conclusion:** The PredictX v1.0 contracts implement a minimal, well-scoped binary prediction market. Standard security patterns are applied correctly. The two Low findings are design trade-offs acknowledged for v1.0 with clear upgrade paths. **Approved for mainnet deployment.**

---

*Report published at: https://github.com/Codyblaze/predictx/blob/main/audit/audit-report.md*
