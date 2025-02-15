const { ethers } = require("hardhat");

async function main() {
  console.log("------------ Start of Interaction with board decision ------");

  const value = ethers.parseEther("100");
  const propsal = "Build a hub";

  const [owner, otherAccount, otherAccount1] = await ethers.getSigners();

    const BoardAgreement = await ethers.getContractFactory("BoardAgreement");
    const MyToken = await ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();

    await myToken.waitForDeployment();

    const addressmember = [owner.address, otherAccount.address];

    const boardAgreement = await BoardAgreement.deploy(
      addressmember,
      myToken.target
    );

    await boardAgreement.waitForDeployment();

    await myToken.mint(boardAgreement.target, ethers.parseEther("1000000"));

    const tokenBalance = await myToken.balanceOf(boardAgreement.target);

    console.log(
      `Deployed to BoardAgreement contract address ${boardAgreement.target.toString()}`
    );
    console.log(await tokenBalance.toString(), "Token balance");

    const creatorBalanceBefore = await myToken.balanceOf(owner.address);

    console.log("Checking creator balance before creating proposal...");
    console.log(creatorBalanceBefore.toString(), "Creator balance after-----");

    
    console.log("------------ End of Deployment ------");
    
    console.log("------------ Start of Interaction with board decision ------");

    console.log("-----minting to smart contract-----")

    await myToken.mint(boardAgreement.target, ethers.parseEther("1000000"));

    
    console.log("-----Submitting decision-----")

    const submmitDecision = await boardAgreement.connect(owner).submitDecision(owner.address, value, propsal);

    await submmitDecision.wait()

    // console.log(submmitDecision);
    

    console.log("------submitted decision------");

    console.log("-----confirming decision by the first address -----")
    
    const confrimDecisionByFirstOwner = await boardAgreement.connect(owner).confirmDecision(0);

    await confrimDecisionByFirstOwner.wait();

    console.log("-----decision confirmed by the first address-----")

    console.log("-----confirming decision by the second address -----")
    
    const confrimDecisionBySecondAddress = await boardAgreement.connect(otherAccount).confirmDecision(0);

    await confrimDecisionBySecondAddress.wait();

    console.log("-----decision confirmed by the second address-----")

    console.log("-----executing decision-----")

    const executeDecision = await boardAgreement.connect(owner).executeDecision(0);

    await executeDecision.wait();

    console.log("-----decision executed-----")

    console.log("-----checking creator balance after-----")

    const creatorBalance = await myToken.balanceOf(owner.address);

    console.log(creatorBalance.toString(), "Creator balance after-----");


  console.log("------------ End of Interaction with board decision ------");
    
    
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
