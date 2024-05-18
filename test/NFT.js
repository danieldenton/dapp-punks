const { expect } = require("chai");
const { ethers } = require("hardhat");

const tokens = (n) => {
  return ethers.utils.parseUnits(n.toString(), "ether");
};

const ether = tokens;

describe("NFT", () => {
  const NAME = "Dapp Punks";
  const SYMBOL = "DP";
  const COST = ether(10);
  const MAX_SUPPLY = 25;
  const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";
  let nft, deployer, minter;

  beforeEach(async () => {
    let accounts = await ethers.getSigners();
    deployer = accounts[0];
    minter = accounts[1];
  });

  describe("Deployment", () => {
    const ALLOW_MINTING_ON = (Date.now() + 120000).toString().slice(0, 10);
    beforeEach(async () => {
      const NFT = await ethers.getContractFactory("NFT");
      nft = await NFT.deploy(
        NAME,
        SYMBOL,
        COST,
        MAX_SUPPLY,
        ALLOW_MINTING_ON,
        BASE_URI
      );
    });
    it("has correct name", async () => {
      expect(await nft.name()).to.equal(NAME);
    });
    it("has correct symbol", async () => {
      expect(await nft.symbol()).to.equal(SYMBOL);
    });
    it("returns the cost to mint", async () => {
      expect(await nft.cost()).to.equal(COST);
    });
    it("returns the maximum total supply", async () => {
      expect(await nft.maxSupply()).to.equal(MAX_SUPPLY);
    });
    it("returns the minting time allowed", async () => {
      expect(await nft.allowMintingOn()).to.equal(ALLOW_MINTING_ON);
    });
    it("returns the baseURI", async () => {
      expect(await nft.baseURI()).to.equal(BASE_URI);
    });
    it("returns the owner", async () => {
      expect(await nft.owner()).to.equal(deployer.address);
    });
  });

  describe("Minting", () => {
    let result, transaction;

    describe("Success", () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
      beforeEach(async () => {
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );

        transaction = await nft.connect(minter).mint(1, { value: COST });
        result = await transaction.wait();
      });
      it("updates the total supply", async () => {
        expect(await nft.totalSupply()).to.equal(1);
      });
      it("updates the contract ether balance", async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST);
      });
    });
    it("", async () => {});
    it("", async () => {});
    describe("Failure", () => {
      it("rejects insufficient payment", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await expect(nft.connect(minter).mint(1, { value: ether(1) })).to.be
          .reverted;
      });
      it("rejects miniting before allowed time", async () => {
        const ALLOW_MINTING_ON = new Date("May 26, 2030 18:00:00")
          .getTime()
          .toString()
          .slice(0, 10);
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await expect(nft.connect(minter).mint(1, { value: COST })).to.be
          .reverted;
      });
      it("requires at least 1 nft to be minted", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await expect(nft.connect(minter).mint(0, { value: COST })).to.be
          .reverted;
      });
    });
  });
});