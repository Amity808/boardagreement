const hre = require("hardhat");

async function main() {

    const BoardAgreement = await hre.ethers.getContractFactory("BoardAgreement");
    const MyToken = await hre.ethers.getContractFactory("MyToken");
    const myToken = await MyToken.deploy();
    await myToken.waitForDeployment();

    const [owner, otherAccount] = await ethers.getSigners();
    const addressmember = [owner.address, otherAccount.address]

    console.log(addressmember)

    const boardAgreement = await BoardAgreement.deploy(addressmember, myToken.target);


    await boardAgreement.waitForDeployment();

    const address = await boardAgreement.getAddress()


    console.log(
        `deployed to BoardAgreement contract address ${address.toString()}}`
    );
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});