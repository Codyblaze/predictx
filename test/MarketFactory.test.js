const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("MarketFactory", function () {
  let factory, oracle, owner, alice, bob;
  const ONE_HOUR = 3600;
  const ONE_DAY  = 86400;

  beforeEach(async function () {
    [owner, alice, bob] = await ethers.getSigners();

    const MockOracle = await ethers.getContractFactory("MockOracle");
    oracle = await MockOracle.deploy();

    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    factory = await MarketFactory.deploy(await oracle.getAddress());
  });

  describe("Deployment", function () {
    it("sets the default oracle", async function () {
      expect(await factory.defaultOracle()).to.equal(await oracle.getAddress());
    });

    it("sets the owner", async function () {
      expect(await factory.owner()).to.equal(owner.address);
    });

    it("starts with zero markets", async function () {
      expect(await factory.getMarketCount()).to.equal(0);
    });
  });

  describe("createMarket", function () {
    async function futureTime(offsetSeconds) {
      return (await time.latest()) + offsetSeconds;
    }

    it("creates a market and emits MarketCreated", async function () {
      const closing = await futureTime(ONE_DAY);
      await expect(
        factory.connect(alice).createMarket("Will BTC hit $100k?", "crypto", closing)
      ).to.emit(factory, "MarketCreated");

      expect(await factory.getMarketCount()).to.equal(1);
    });

    it("reverts on empty question", async function () {
      const closing = await futureTime(ONE_DAY);
      await expect(
        factory.createMarket("", "crypto", closing)
      ).to.be.revertedWithCustomError(factory, "EmptyQuestion");
    });

    it("reverts if closing time is too soon (< 1 hour)", async function () {
      const closing = await futureTime(ONE_HOUR - 10);
      await expect(
        factory.createMarket("Test?", "crypto", closing)
      ).to.be.revertedWithCustomError(factory, "InvalidDuration");
    });

    it("reverts if closing time exceeds max duration", async function () {
      const closing = await futureTime(366 * ONE_DAY);
      await expect(
        factory.createMarket("Test?", "crypto", closing)
      ).to.be.revertedWithCustomError(factory, "InvalidDuration");
    });

    it("indexes markets by creator", async function () {
      const closing = await futureTime(ONE_DAY);
      await factory.connect(alice).createMarket("Q1?", "crypto", closing);
      await factory.connect(alice).createMarket("Q2?", "sports", closing);
      await factory.connect(bob).createMarket("Q3?", "crypto", closing);

      const aliceMarkets = await factory.getMarketsByCreator(alice.address);
      const bobMarkets   = await factory.getMarketsByCreator(bob.address);

      expect(aliceMarkets.length).to.equal(2);
      expect(bobMarkets.length).to.equal(1);
    });

    it("indexes markets by category", async function () {
      const closing = await futureTime(ONE_DAY);
      await factory.createMarket("Q1?", "crypto", closing);
      await factory.createMarket("Q2?", "crypto", closing);
      await factory.createMarket("Q3?", "sports", closing);

      const cryptoMarkets  = await factory.getMarketsByCategory("crypto");
      const sportsMarkets  = await factory.getMarketsByCategory("sports");

      expect(cryptoMarkets.length).to.equal(2);
      expect(sportsMarkets.length).to.equal(1);
    });
  });

  describe("Admin", function () {
    it("owner can update oracle", async function () {
      await factory.setDefaultOracle(alice.address);
      expect(await factory.defaultOracle()).to.equal(alice.address);
    });

    it("non-owner cannot update oracle", async function () {
      await expect(
        factory.connect(alice).setDefaultOracle(alice.address)
      ).to.be.reverted;
    });

    it("owner can pause/unpause factory", async function () {
      const closing = (await time.latest()) + ONE_DAY;

      await factory.setPaused(true);
      await expect(
        factory.createMarket("Paused?", "crypto", closing)
      ).to.be.revertedWithCustomError(factory, "FactoryIsPaused");

      await factory.setPaused(false);
      await expect(
        factory.createMarket("Unpaused?", "crypto", closing)
      ).to.emit(factory, "MarketCreated");
    });
  });

  describe("Pagination", function () {
    it("getMarkets returns correct slice", async function () {
      const closing = (await time.latest()) + ONE_DAY;
      for (let i = 0; i < 5; i++) {
        await factory.createMarket(`Q${i}?`, "test", closing);
      }

      const page = await factory.getMarkets(2, 2);
      expect(page.length).to.equal(2);
      expect(page[0].question).to.equal("Q2?");

      const overflowPage = await factory.getMarkets(4, 10);
      expect(overflowPage.length).to.equal(1);

      const emptyPage = await factory.getMarkets(10, 5);
      expect(emptyPage.length).to.equal(0);
    });
  });
});
