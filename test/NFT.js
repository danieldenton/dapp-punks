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
  const MAX_MINTING_AMOUNT = 3;
  const BASE_URI = "ipfs://QmQ2jnDYecFhrf3asEWjyjZRX1pZSsNWG3qHzmNDvXa9qg/";
  let nft, deployer, minter, nonMinter;

  beforeEach(async () => {
    let accounts = await ethers.getSigners();
    deployer = accounts[0];
    minter = accounts[1];
    nonMinter = accounts[2];
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
        MAX_MINTING_AMOUNT,
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
    it("returns the maximum minting amount", async () => {
      expect(await nft.maxMintingAmount()).to.equal(MAX_MINTING_AMOUNT);
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
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
       await nft.connect(deployer).addMintersToWhitelist(minter.address);
        transaction = await nft.connect(minter).mint(1, { value: COST });
        result = await transaction.wait();
      });
      it("updates the total supply", async () => {
        expect(await nft.totalSupply()).to.equal(1);
      });
      it("returns the address of the minter", async () => {
        expect(await nft.ownerOf(1)).to.equal(minter.address);
      });
      it("returns the total number of tokens the minter owns", async () => {
        expect(await nft.balanceOf(minter.address)).to.equal(1);
      });
      it("returns IPFS URI", async () => {
        expect(await nft.tokenURI(1)).to.equal(`${BASE_URI}1.json`);
      });
      it("updates the contract ether balance", async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(COST);
      });
      it("emits Mint event", async () => {
        await expect(transaction)
          .to.emit(nft, "Mint")
          .withArgs(1, minter.address);
      });
    });
    describe("Failure", () => {
      it("rejects insufficient payment", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await nft.connect(deployer).addMintersToWhitelist(minter.address);
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
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await nft.connect(deployer).addMintersToWhitelist(minter.address);
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
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await nft.connect(deployer).addMintersToWhitelist(minter.address);
        await expect(nft.connect(minter).mint(0, { value: COST })).to.be
          .reverted;
      });
      it("rejects more nfts to be minted than maxSupply", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await nft.connect(deployer).addMintersToWhitelist(minter.address);
        await expect(nft.connect(minter).mint(100, { value: ether(1000) })).to
          .be.reverted;
      });
      it("rejects more nfts to be minted than maxMintingAmount", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await nft.connect(deployer).addMintersToWhitelist(minter.address);
        await expect(nft.connect(minter).mint(4, { value: ether(40) })).to.be
          .reverted;
      });

      it("does not return URIs for invalid tokens", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await nft.connect(deployer).addMintersToWhitelist(minter.address);
        await nft.connect(minter).mint(1, { value: COST });
        await expect(nft.tokenURI(99)).to.be.reverted;
      });
    });
  });
  describe("Pause Minting", () => {
    let transaction, result;
    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
    beforeEach(async () => {
      const NFT = await ethers.getContractFactory("NFT");
      nft = await NFT.deploy(
        NAME,
        SYMBOL,
        COST,
        MAX_SUPPLY,
        MAX_MINTING_AMOUNT,
        ALLOW_MINTING_ON,
        BASE_URI
      );
      await nft.connect(deployer).addMintersToWhitelist(minter.address);
    });
    describe("Success", () => {
      beforeEach(async () => {
        await nft.connect(deployer).mintingPause();
      });
      it("pauses minting", async () => {
        await expect(nft.connect(minter).mint(1, { value: COST })).to.be
          .reverted;
      });
      it("unpauses minting", async () => {
        await nft.connect(deployer).mintingPause();
        transaction = await nft.connect(minter).mint(1, { value: COST });
        result = await transaction.wait();
        expect(await nft.balanceOf(minter.address)).to.equal(1);
      });
    });
    describe("Failure", () => {
      it("doesn't allow a non-owner to pause", async () => {
        await expect(nft.connect(minter).mintingPause()).to.be.reverted;
      });
    });
  });
  describe("Displaying NFTs", () => {
    let result, transaction;
    const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
    beforeEach(async () => {
      const NFT = await ethers.getContractFactory("NFT");
      nft = await NFT.deploy(
        NAME,
        SYMBOL,
        COST,
        MAX_SUPPLY,
        MAX_MINTING_AMOUNT,
        ALLOW_MINTING_ON,
        BASE_URI
      );
      await nft.connect(deployer).addMintersToWhitelist(minter.address);
      transaction = await nft.connect(minter).mint(3, { value: ether(30) });
      result = await transaction.wait();
    });
    it("returns all NFTs for a given owner", async () => {
      let tokenIds = await nft.walletOfOwner(minter.address);
      expect(tokenIds.length).to.equal(3);
      expect(tokenIds[0].toString()).to.equal("1");
      expect(tokenIds[1].toString()).to.equal("2");
      expect(tokenIds[2].toString()).to.equal("3");
    });
  });
  describe("Withdrawal", () => {
    let result, transaction, balanceBefore;

    describe("Success", () => {
      const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
      beforeEach(async () => {
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await nft.connect(deployer).addMintersToWhitelist(minter.address);
        transaction = await nft.connect(minter).mint(1, { value: COST });
        result = await transaction.wait();

        balanceBefore = await ethers.provider.getBalance(deployer.address);

        transaction = await nft.connect(deployer).withdraw();
        result = await transaction.wait();
      });
      it("deduct the contract balance", async () => {
        expect(await ethers.provider.getBalance(nft.address)).to.equal(0);
      });
      it("sends funds to the owner", async () => {
        expect(
          await ethers.provider.getBalance(deployer.address)
        ).to.greaterThan(balanceBefore);
      });
      it("emits Withdraw event", async () => {
        expect(transaction)
          .to.emit(nft, "Withdraw")
          .withArgs(COST, deployer.address);
      });
    });

    it("", async () => {});
    describe("Failure", () => {
      it("rejects non-owner from withdrawal", async () => {
        const ALLOW_MINTING_ON = Date.now().toString().slice(0, 10);
        const NFT = await ethers.getContractFactory("NFT");
        nft = await NFT.deploy(
          NAME,
          SYMBOL,
          COST,
          MAX_SUPPLY,
          MAX_MINTING_AMOUNT,
          ALLOW_MINTING_ON,
          BASE_URI
        );
        await nft.connect(deployer).addMintersToWhitelist(minter.address);
        nft.connect(minter).mint(1, { value: COST });
        await expect(nft.connect(minter).withdraw()).to.be.reverted;
      });
    });
  });
});
