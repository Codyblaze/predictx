// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";

contract MarketFactory is Ownable {
    struct MarketInfo {
        address market;
        address creator;
        string  question;
        string  category;
        uint256 closingTime;
        uint256 createdAt;
    }

    address public defaultOracle;
    bool    public paused;

    MarketInfo[] public markets;
    mapping(address => address[]) public marketsByCreator;
    mapping(string => address[]) public marketsByCategory;

    uint256 public constant MIN_DURATION  = 1 hours;
    uint256 public constant MAX_DURATION  = 365 days;
    uint256 public constant RESOLUTION_BUFFER = 1 days;

    event MarketCreated(
        address indexed market,
        address indexed creator,
        string question,
        string category,
        uint256 closingTime
    );
    event OracleUpdated(address indexed newOracle);
    event FactoryPaused(bool paused);

    error FactoryIsPaused();
    error InvalidDuration();
    error EmptyQuestion();

    constructor(address _defaultOracle) Ownable(msg.sender) {
        defaultOracle = _defaultOracle;
    }

    function createMarket(
        string calldata _question,
        string calldata _category,
        uint256 _closingTime
    ) external returns (address) {
        if (paused) revert FactoryIsPaused();
        if (bytes(_question).length == 0) revert EmptyQuestion();
        uint256 duration = _closingTime - block.timestamp;
        if (duration < MIN_DURATION || duration > MAX_DURATION) revert InvalidDuration();

        uint256 resolutionTime = _closingTime + RESOLUTION_BUFFER;

        PredictionMarket market = new PredictionMarket(
            msg.sender,
            defaultOracle,
            _question,
            _category,
            _closingTime,
            resolutionTime
        );

        address marketAddr = address(market);

        markets.push(MarketInfo({
            market:      marketAddr,
            creator:     msg.sender,
            question:    _question,
            category:    _category,
            closingTime: _closingTime,
            createdAt:   block.timestamp
        }));

        marketsByCreator[msg.sender].push(marketAddr);
        marketsByCategory[_category].push(marketAddr);

        emit MarketCreated(marketAddr, msg.sender, _question, _category, _closingTime);
        return marketAddr;
    }

    function setDefaultOracle(address _oracle) external onlyOwner {
        defaultOracle = _oracle;
        emit OracleUpdated(_oracle);
    }

    function setPaused(bool _paused) external onlyOwner {
        paused = _paused;
        emit FactoryPaused(_paused);
    }

    function getMarketCount() external view returns (uint256) {
        return markets.length;
    }

    function getMarkets(uint256 offset, uint256 limit)
        external
        view
        returns (MarketInfo[] memory)
    {
        uint256 total = markets.length;
        if (offset >= total) return new MarketInfo[](0);
        uint256 end = offset + limit > total ? total : offset + limit;
        MarketInfo[] memory result = new MarketInfo[](end - offset);
        for (uint256 i = offset; i < end; i++) {
            result[i - offset] = markets[i];
        }
        return result;
    }

    function getMarketsByCreator(address creator) external view returns (address[] memory) {
        return marketsByCreator[creator];
    }

    function getMarketsByCategory(string calldata category) external view returns (address[] memory) {
        return marketsByCategory[category];
    }
}
