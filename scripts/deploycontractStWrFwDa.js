// Hardhat Deployment Script
//const hre = require("hardhat");
const hre = require("hardhat");

async function main() {
    // Fetch contract factory
    const StoreWaterFlowData_0107 = await hre.ethers.getContractFactory("StoreWaterFlowData_0107");

    // Deploy the contract
    const contract = await StoreWaterFlowData_0107.deploy();
    
    await contract.waitForDeployment();

    console.log("StoreWaterFlowData_0107 Contract deployed to:", await contract.getAddress());
}

main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
});