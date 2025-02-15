const {
  time,
  loadFixture,
} = require("@nomicfoundation/hardhat-toolbox/network-helpers");
const { anyValue } = require("@nomicfoundation/hardhat-chai-matchers/withArgs");
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("BoardAgreement", async function () {
  const value = ethers.parseEther("100");
  const propsal = "Build a hub";
  async function deployBoardAgreementFixture() {
    const [owner, otherAccount, otherAccount1] = await ethers.getSigners();

    const BoardAgreement = await ethers.getContractFactory("BoardAgreement");
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();

    const addressmember = [owner.address, otherAccount.address];

    const boardAgreement = await BoardAgreement.deploy(
      addressmember,
      myToken.target
    );

    await myToken.mint(boardAgreement.target, ethers.parseEther("1000000"));

    const tokenBalance = await myToken.balanceOf(boardAgreement.target);
    console.log(await tokenBalance.toString(), "Token balance");
    return { boardAgreement, owner, otherAccount, myToken, otherAccount1 };
  }

  describe("Deployment", () => {
    it("it should pass Deployment", async () => {
      const { boardAgreement, owner, otherAccount, myToken } =
        await loadFixture(deployBoardAgreementFixture);
      const balance = await myToken.balanceOf(boardAgreement.target);
      await expect(balance).to.be.equal(ethers.parseEther("1000000"));
    });

    it("It should pass if address is board member", async () => {
      const { boardAgreement, owner, otherAccount, myToken } =
        await loadFixture(deployBoardAgreementFixture);
      const isBoardMember = await boardAgreement.isBoardMember(
        otherAccount.address
      );
      await expect(isBoardMember).to.be.true;
    });

    it("it should revert with custom error NOT_UNIQUE_BOARD_MEMBER", async () => {
      const { boardAgreement, owner, otherAccount, myToken, otherAccount1 } =
        await loadFixture(deployBoardAgreementFixture);
      const isBoardMember = await boardAgreement.isBoardMember(
        otherAccount1.address
      );
      await expect(isBoardMember).to.be.false;
    });
  });

  describe("submitDecision", async () => {
    it("it should pass submit decision", async () => {
      const { boardAgreement, owner, otherAccount, myToken, otherAccount1 } =
        await loadFixture(deployBoardAgreementFixture);
        const submmitDecision = await boardAgreement.connect(owner).submitDecision(owner.address, value, propsal);
        await expect(submmitDecision).to.emit(boardAgreement, "SubmitDecision").withArgs(owner.address, 0, owner.address, value, propsal);
    });

    it("it should revert with a custome error ", async () => {
        const { boardAgreement, owner, otherAccount, myToken, otherAccount1 } =
          await loadFixture(deployBoardAgreementFixture);
          await expect(boardAgreement.connect(otherAccount1).submitDecision(owner.address, value, propsal))
            .to.be.revertedWithCustomError(boardAgreement, "NOT_A_BOARDMEMBER");
      });
  });

  describe("ConfirmDecision", async () => {
    it("it should pass member to confirm decision on budget", async () => {
      const { boardAgreement, owner, otherAccount, myToken, otherAccount1 } =
        await loadFixture(deployBoardAgreementFixture);
        const submmitDecision = await boardAgreement.connect(owner).submitDecision(owner.address, value, propsal);
        
        const confrimDecision =await boardAgreement.connect(owner).confirmDecision(0);
        await expect(confrimDecision).to.emit(boardAgreement, "ConfirmDecision").withArgs(owner.address, 0);
    });

    it("it should revert with a custome error MEMBER_ALREADY_CONFIRM_DECISION", async () => {
        const { boardAgreement, owner, otherAccount, myToken, otherAccount1 } =
          await loadFixture(deployBoardAgreementFixture);
          const submmitDecision = await boardAgreement.connect(owner).submitDecision(owner.address, value, propsal);
          await boardAgreement.connect(owner).confirmDecision(0);
          await expect(boardAgreement.connect(owner).confirmDecision(0))
            .to.be.revertedWithCustomError(boardAgreement, "MEMBER_ALREADY_CONFIRM_DECISION()");
      });
  });

  describe("executeDecision", async () => {
    it("it should pass the the execution decision", async () => {
    const { boardAgreement, owner, otherAccount, myToken, otherAccount1 } = await loadFixture(deployBoardAgreementFixture);
    await boardAgreement.connect(owner).submitDecision(owner.address, value, propsal);
    await boardAgreement.connect(owner).confirmDecision(0);
    await boardAgreement.connect(otherAccount).confirmDecision(0);
    const executeDecision = await boardAgreement.connect(owner).executeDecision(0);

    await expect(executeDecision).to.be.emit(boardAgreement, "ExecuteDecision").withArgs(owner.address, 0);
    });

    it("it should revert the the ALLBOARD_MUST_CONFIRM", async () => {
        const { boardAgreement, owner, otherAccount, myToken, otherAccount1 } = await loadFixture(deployBoardAgreementFixture);
        await boardAgreement.connect(owner).submitDecision(owner.address, value, propsal);
        await boardAgreement.connect(owner).confirmDecision(0);
         await expect(boardAgreement.connect(owner).executeDecision(0)).to.be.revertedWithCustomError(boardAgreement,"ALLBOARD_MUST_CONFIRM()")
        });

  })
});
