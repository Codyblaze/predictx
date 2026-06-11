// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./PredictionMarket.sol";

contract MockOracle is Ownable {
    mapping(address => bool) public resolvers;

    event ResolverAdded(address indexed resolver);
    event ResolverRemoved(address indexed resolver);
    event MarketResolved(address indexed market, bool yesWon);
    event MarketCancelled(address indexed market);

    error NotResolver();

    constructor() Ownable(msg.sender) {
        resolvers[msg.sender] = true;
    }

    modifier onlyResolver() {
        if (!resolvers[msg.sender]) revert NotResolver();
        _;
    }

    function addResolver(address resolver) external onlyOwner {
        resolvers[resolver] = true;
        emit ResolverAdded(resolver);
    }

    function removeResolver(address resolver) external onlyOwner {
        resolvers[resolver] = false;
        emit ResolverRemoved(resolver);
    }

    function resolveMarket(address market, bool yesWon) external onlyResolver {
        PredictionMarket(market).resolve(yesWon);
        emit MarketResolved(market, yesWon);
    }

    function cancelMarket(address market) external onlyResolver {
        PredictionMarket(market).cancel();
        emit MarketCancelled(market);
    }

    function batchResolve(address[] calldata _markets, bool[] calldata _outcomes)
        external
        onlyResolver
    {
        require(_markets.length == _outcomes.length, "Length mismatch");
        for (uint256 i = 0; i < _markets.length; i++) {
            PredictionMarket(_markets[i]).resolve(_outcomes[i]);
            emit MarketResolved(_markets[i], _outcomes[i]);
        }
    }
}
