# PredictX — Security & Test Summary

**Network:** X1 Maculatus Testnet (chain ID `10778`)  
**Contracts:** `MarketFactory.sol`, `PredictionMarket.sol`, `MockOracle.sol`  
**Compiler:** Solidity ^0.8.24 (optimizer: 200 runs)  
**OpenZeppelin:** v5.0.0

## Test results

| Metric | Result |
|---|---|
| Tests | 40 passing, 0 failing |
| Statements | 98.70% |
| Branches | 79.55% |
| Functions | 100% |
| Lines | 100% |

| Contract | Statements | Branches | Functions | Lines |
|---|---|---|---|---|
| MarketFactory.sol | 100% | 93.75% | 100% | 100% |
| MockOracle.sol | 100% | 71.43% | 100% | 100% |
| PredictionMarket.sol | 97.62% | 77.59% | 100% | 100% |

CI runs compile, test, and coverage on every push to `main`.

## Maculatus testnet deployments

| Contract | Address |
|---|---|
| MarketFactory | `0xF99C07d08dfDA19DDb6640008386d9b67e327ED3` |
| MockOracle | `0x9811DA5da02cb74A2C66406abE1f506D53C216d2` |

Explorer: https://maculatus-scan.x1eco.com

## Security patterns

- `ReentrancyGuard` on bet and claim functions
- OpenZeppelin `Ownable` and `onlyOracle` access control
- Solidity 0.8.x overflow protection
- Custom errors on hot paths
- Checks-effects-interactions on claims (`claimed` flag before transfer)
- `call{value}` with return check for payouts
- Isolated market contracts via factory pattern

## Automated analysis

Slither static analysis is run via `scripts/audit.js`. No Critical or High severity findings in v1.0 scope.

Third-party audit planned before mainnet deployment.
