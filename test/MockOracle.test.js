const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time } = require("@nomicfoundation/hardhat-network-helpers");

describe("MockOracle", function () {
  let oracle, factory, owner, resolver, alice;
  const ONE_DAY = 86400;

  beforeEach(async function () {
    [owner, resolver, alice] = await ethers.getSigners();

    const MockOracle = await ethers.getContractFactory("MockOracle");
    oracle = await MockOracle.deploy();

    const MarketFactory = await ethers.getContractFactory("MarketFactory");
    factory = await MarketFactory.deploy(await oracle.getAddress());
  });

  async function createAndGetMarket() {
    const closingTime = (await time.latest()) + ONE_DAY;
    const tx = await factory.createMarket("Test?", "test", closingTime);
    const receipt = await tx.wait();
    const event = receipt.logs.find((l) => {
      try { return factory.interface.parseLog(l)?.name === "MarketCreated"; }
      catch { return false; }
    });
    const parsed = factory.interface.parseLog(event);
    return { address: parsed.args.market, closingTime };
  }

  it("owner is default resolver", async function () {
    expect(await oracle.resolvers(owner.address)).to.be.true;
  });

  it("owner can add/remove resolvers", async function () {
    await oracle.addResolver(resolver.address);
    expect(await oracle.resolvers(resolver.address)).to.be.true;

    await oracle.removeResolver(resolver.address);
    expect(await oracle.resolvers(resolver.address)).to.be.false;
  });

  it("resolver can resolve a market", async function () {
    const { address, closingTime } = await createAndGetMarket();
    await time.increaseTo(closingTime + 1);
    await expect(oracle.resolveMarket(address, true))
      .to.emit(oracle, "MarketResolved")
      .withArgs(address, true);
  });

  it("non-resolver cannot resolve", async function () {
    const { address, closingTime } = await createAndGetMarket();
    await time.increaseTo(closingTime + 1);
    await expect(oracle.connect(alice).resolveMarket(address, true))
      .to.be.revertedWithCustomError(oracle, "NotResolver");
  });

  it("batch resolve works", async function () {
    const m1 = await createAndGetMarket();
    const m2 = await createAndGetMarket();
    const laterClose = Math.max(m1.closingTime, m2.closingTime);
    await time.increaseTo(laterClose + 1);

    await expect(
      oracle.batchResolve([m1.address, m2.address], [true, false])
    ).to.emit(oracle, "MarketResolved");
  });

  it("batch resolve reverts on length mismatch", async function () {
    const { address } = await createAndGetMarket();
    await expect(
      oracle.batchResolve([address], [true, false])
    ).to.be.revertedWith("Length mismatch");
  });

  it("resolver can cancel a market", async function () {
    const { address } = await createAndGetMarket();
    await expect(oracle.cancelMarket(address))
      .to.emit(oracle, "MarketCancelled")
      .withArgs(address);
  });
});
