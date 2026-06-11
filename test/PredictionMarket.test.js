const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("PredictionMarket", function () {
  const ONE_DAY = 86400;

  async function deployMarketFixture() {
    const [owner, oracle, alice, bob, charlie] = await ethers.getSigners();
    const now = await time.latest();
    const closingTime = now + ONE_DAY;
    const resolutionTime = closingTime + ONE_DAY;

    const PredictionMarket = await ethers.getContractFactory("PredictionMarket");
    const market = await PredictionMarket.deploy(
      owner.address,
      oracle.address,
      "Will BTC exceed $100k by end of 2026?",
      "crypto",
      closingTime,
      resolutionTime
    );

    return { market, owner, oracle, alice, bob, charlie, closingTime };
  }

  describe("Deployment", function () {
    it("stores all constructor params", async function () {
      const { market, owner, oracle } = await loadFixture(deployMarketFixture);
      expect(await market.question()).to.equal("Will BTC exceed $100k by end of 2026?");
      expect(await market.category()).to.equal("crypto");
      expect(await market.oracle()).to.equal(oracle.address);
      expect(await market.owner()).to.equal(owner.address);
    });

    it("starts UNRESOLVED", async function () {
      const { market } = await loadFixture(deployMarketFixture);
      expect(await market.outcome()).to.equal(0);
    });
  });

  describe("Betting", function () {
    it("accepts YES bets while open", async function () {
      const { market, alice } = await loadFixture(deployMarketFixture);
      const amount = ethers.parseEther("1");
      await expect(market.connect(alice).betYes({ value: amount }))
        .to.emit(market, "BetPlaced")
        .withArgs(alice.address, true, amount);
      expect(await market.totalYes()).to.equal(amount);
    });

    it("accepts NO bets while open", async function () {
      const { market, bob } = await loadFixture(deployMarketFixture);
      const amount = ethers.parseEther("0.5");
      await market.connect(bob).betNo({ value: amount });
      expect(await market.totalNo()).to.equal(amount);
    });

    it("reverts on zero value bet", async function () {
      const { market, alice } = await loadFixture(deployMarketFixture);
      await expect(market.connect(alice).betYes({ value: 0 }))
        .to.be.revertedWithCustomError(market, "ZeroAmount");
    });

    it("reverts after closing time", async function () {
      const { market, alice, closingTime } = await loadFixture(deployMarketFixture);
      await time.increaseTo(closingTime + 1);
      await expect(
        market.connect(alice).betYes({ value: ethers.parseEther("1") })
      ).to.be.revertedWithCustomError(market, "MarketClosed");
    });

    it("accumulates multiple bets from same bettor", async function () {
      const { market, alice } = await loadFixture(deployMarketFixture);
      await market.connect(alice).betYes({ value: ethers.parseEther("1") });
      await market.connect(alice).betYes({ value: ethers.parseEther("0.5") });
      const bet = await market.bets(alice.address);
      expect(bet.yesAmount).to.equal(ethers.parseEther("1.5"));
    });
  });

  describe("Resolution", function () {
    it("oracle can resolve YES after close", async function () {
      const { market, oracle, closingTime } = await loadFixture(deployMarketFixture);
      await time.increaseTo(closingTime + 1);
      await expect(market.connect(oracle).resolve(true))
        .to.emit(market, "MarketResolved")
        .withArgs(1);
    });

    it("oracle can resolve NO after close", async function () {
      const { market, oracle, closingTime } = await loadFixture(deployMarketFixture);
      await time.increaseTo(closingTime + 1);
      await market.connect(oracle).resolve(false);
      expect(await market.outcome()).to.equal(2);
    });

    it("reverts if non-oracle tries to resolve", async function () {
      const { market, alice, closingTime } = await loadFixture(deployMarketFixture);
      await time.increaseTo(closingTime + 1);
      await expect(market.connect(alice).resolve(true))
        .to.be.revertedWithCustomError(market, "NotOracle");
    });

    it("reverts resolve before close", async function () {
      const { market, oracle } = await loadFixture(deployMarketFixture);
      await expect(market.connect(oracle).resolve(true))
        .to.be.revertedWithCustomError(market, "MarketStillOpen");
    });

    it("reverts double-resolution", async function () {
      const { market, oracle, closingTime } = await loadFixture(deployMarketFixture);
      await time.increaseTo(closingTime + 1);
      await market.connect(oracle).resolve(true);
      await expect(market.connect(oracle).resolve(false))
        .to.be.revertedWithCustomError(market, "AlreadyResolved");
    });
  });

  describe("Winnings", function () {
    it("YES winner receives proportional share minus fee", async function () {
      const { market, oracle, alice, bob, closingTime } = await loadFixture(deployMarketFixture);

      await market.connect(alice).betYes({ value: ethers.parseEther("2") });
      await market.connect(bob).betNo({ value: ethers.parseEther("1") });

      await time.increaseTo(closingTime + 1);
      await market.connect(oracle).resolve(true);

      const balanceBefore = await ethers.provider.getBalance(alice.address);
      const tx = await market.connect(alice).claimWinnings();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(alice.address);

      const net = balanceAfter - balanceBefore + gasUsed;
      const expected = ethers.parseEther("3") * 9800n / 10000n;
      expect(net).to.be.closeTo(expected, ethers.parseEther("0.0001"));
    });

    it("loser gets zero payout", async function () {
      const { market, oracle, alice, bob, closingTime } = await loadFixture(deployMarketFixture);
      await market.connect(alice).betYes({ value: ethers.parseEther("1") });
      await market.connect(bob).betNo({ value: ethers.parseEther("1") });
      await time.increaseTo(closingTime + 1);
      await market.connect(oracle).resolve(true);

      await expect(market.connect(bob).claimWinnings())
        .to.be.revertedWithCustomError(market, "NothingToClaim");
    });

    it("cancelled market refunds all bettors", async function () {
      const { market, oracle, alice, bob } = await loadFixture(deployMarketFixture);
      const aliceAmt = ethers.parseEther("1");
      const bobAmt   = ethers.parseEther("0.5");

      await market.connect(alice).betYes({ value: aliceAmt });
      await market.connect(bob).betNo({ value: bobAmt });
      await market.connect(oracle).cancel();

      expect(await market.getPayout(alice.address)).to.equal(aliceAmt);
      expect(await market.getPayout(bob.address)).to.equal(bobAmt);
    });

    it("NO winner receives proportional share minus fee", async function () {
      const { market, oracle, alice, bob, closingTime } = await loadFixture(deployMarketFixture);

      await market.connect(alice).betYes({ value: ethers.parseEther("1") });
      await market.connect(bob).betNo({ value: ethers.parseEther("2") });

      await time.increaseTo(closingTime + 1);
      await market.connect(oracle).resolve(false);

      const balanceBefore = await ethers.provider.getBalance(bob.address);
      const tx = await market.connect(bob).claimWinnings();
      const receipt = await tx.wait();
      const gasUsed = receipt.gasUsed * receipt.gasPrice;
      const balanceAfter = await ethers.provider.getBalance(bob.address);

      const net = balanceAfter - balanceBefore + gasUsed;
      const expected = ethers.parseEther("3") * 9800n / 10000n;
      expect(net).to.be.closeTo(expected, ethers.parseEther("0.0001"));
    });

    it("reverts double-claim", async function () {
      const { market, oracle, alice, closingTime } = await loadFixture(deployMarketFixture);
      await market.connect(alice).betYes({ value: ethers.parseEther("1") });
      await time.increaseTo(closingTime + 1);
      await market.connect(oracle).resolve(true);
      await market.connect(alice).claimWinnings();
      await expect(market.connect(alice).claimWinnings())
        .to.be.revertedWithCustomError(market, "NothingToClaim");
    });
  });

  describe("Bettor Count", function () {
    it("getBettorCount increments per unique address", async function () {
      const { market, alice, bob } = await loadFixture(deployMarketFixture);
      expect(await market.getBettorCount()).to.equal(0);
      await market.connect(alice).betYes({ value: ethers.parseEther("1") });
      await market.connect(bob).betNo({ value: ethers.parseEther("1") });
      await market.connect(alice).betYes({ value: ethers.parseEther("0.1") });
      expect(await market.getBettorCount()).to.equal(2);
    });
  });

  describe("Market Stats", function () {
    it("returns correct stats", async function () {
      const { market, alice, bob } = await loadFixture(deployMarketFixture);
      await market.connect(alice).betYes({ value: ethers.parseEther("2") });
      await market.connect(bob).betNo({ value: ethers.parseEther("1") });

      const [totalYes, totalNo, totalPool, outcome, isOpen] = await market.getMarketStats();
      expect(totalYes).to.equal(ethers.parseEther("2"));
      expect(totalNo).to.equal(ethers.parseEther("1"));
      expect(totalPool).to.equal(ethers.parseEther("3"));
      expect(outcome).to.equal(0);
      expect(isOpen).to.be.true;
    });

    it("reports closed after closingTime", async function () {
      const { market, closingTime } = await loadFixture(deployMarketFixture);
      await time.increaseTo(closingTime + 1);
      const [,,,, isOpen] = await market.getMarketStats();
      expect(isOpen).to.be.false;
    });
  });
});
