// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract PredictionMarket is ReentrancyGuard, Ownable {
    enum Outcome { UNRESOLVED, YES, NO, CANCELLED }

    struct Bet {
        uint256 yesAmount;
        uint256 noAmount;
        bool claimed;
    }

    string  public question;
    string  public category;
    uint256 public closingTime;
    uint256 public resolutionTime;
    address public oracle;

    uint256 public totalYes;
    uint256 public totalNo;
    Outcome public outcome;

    uint256 public constant FEE_BPS = 200;
    uint256 public constant BPS_DENOM = 10_000;

    mapping(address => Bet) public bets;
    address[] private bettors;

    event BetPlaced(address indexed bettor, bool isYes, uint256 amount);
    event MarketResolved(Outcome outcome);
    event WinningsClaimed(address indexed bettor, uint256 amount);
    event MarketCancelled();

    error MarketClosed();
    error MarketStillOpen();
    error AlreadyResolved();
    error NotOracle();
    error NothingToClaim();
    error ZeroAmount();

    modifier onlyOracle() {
        if (msg.sender != oracle) revert NotOracle();
        _;
    }

    modifier whileOpen() {
        if (block.timestamp >= closingTime) revert MarketClosed();
        _;
    }

    modifier afterClose() {
        if (block.timestamp < closingTime) revert MarketStillOpen();
        _;
    }

    constructor(
        address _owner,
        address _oracle,
        string memory _question,
        string memory _category,
        uint256 _closingTime,
        uint256 _resolutionTime
    ) Ownable(_owner) {
        require(_closingTime > block.timestamp, "Closing time must be future");
        require(_resolutionTime > _closingTime, "Resolution after closing");

        oracle = _oracle;
        question = _question;
        category = _category;
        closingTime = _closingTime;
        resolutionTime = _resolutionTime;
        outcome = Outcome.UNRESOLVED;
    }

    function betYes() external payable whileOpen nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        if (bets[msg.sender].yesAmount == 0 && bets[msg.sender].noAmount == 0) {
            bettors.push(msg.sender);
        }
        bets[msg.sender].yesAmount += msg.value;
        totalYes += msg.value;
        emit BetPlaced(msg.sender, true, msg.value);
    }

    function betNo() external payable whileOpen nonReentrant {
        if (msg.value == 0) revert ZeroAmount();
        if (bets[msg.sender].yesAmount == 0 && bets[msg.sender].noAmount == 0) {
            bettors.push(msg.sender);
        }
        bets[msg.sender].noAmount += msg.value;
        totalNo += msg.value;
        emit BetPlaced(msg.sender, false, msg.value);
    }

    function resolve(bool _yesWon) external onlyOracle afterClose {
        if (outcome != Outcome.UNRESOLVED) revert AlreadyResolved();
        outcome = _yesWon ? Outcome.YES : Outcome.NO;
        emit MarketResolved(outcome);
    }

    function cancel() external onlyOracle {
        if (outcome != Outcome.UNRESOLVED) revert AlreadyResolved();
        outcome = Outcome.CANCELLED;
        emit MarketCancelled();
    }

    function claimWinnings() external nonReentrant {
        Bet storage bet = bets[msg.sender];
        if (bet.claimed) revert NothingToClaim();
        if (outcome == Outcome.UNRESOLVED) revert NothingToClaim();

        bet.claimed = true;
        uint256 payout = _calculatePayout(msg.sender);
        if (payout == 0) revert NothingToClaim();

        (bool sent, ) = msg.sender.call{value: payout}("");
        require(sent, "Transfer failed");
        emit WinningsClaimed(msg.sender, payout);
    }

    function _calculatePayout(address bettor) internal view returns (uint256) {
        Bet storage bet = bets[bettor];

        if (outcome == Outcome.CANCELLED) {
            return bet.yesAmount + bet.noAmount;
        }

        uint256 winningStake;
        uint256 losingPool;

        if (outcome == Outcome.YES) {
            winningStake = bet.yesAmount;
            losingPool = totalNo;
        } else {
            winningStake = bet.noAmount;
            losingPool = totalYes;
        }

        if (winningStake == 0) return 0;

        uint256 winningTotal = outcome == Outcome.YES ? totalYes : totalNo;
        uint256 grossPayout = winningStake + (winningStake * losingPool) / winningTotal;
        uint256 fee = (grossPayout * FEE_BPS) / BPS_DENOM;
        return grossPayout - fee;
    }

    function getPayout(address bettor) external view returns (uint256) {
        if (bets[bettor].claimed) return 0;
        return _calculatePayout(bettor);
    }

    function getMarketStats() external view returns (
        uint256 _totalYes,
        uint256 _totalNo,
        uint256 _totalPool,
        Outcome _outcome,
        bool _isOpen
    ) {
        return (
            totalYes,
            totalNo,
            totalYes + totalNo,
            outcome,
            block.timestamp < closingTime
        );
    }

    function getBettorCount() external view returns (uint256) {
        return bettors.length;
    }
}
