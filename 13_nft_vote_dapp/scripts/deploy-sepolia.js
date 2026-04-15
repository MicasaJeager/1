const fs = require("fs");
const path = require("path");
const hre = require("hardhat");
require("dotenv").config();

async function main() {
  if (!process.env.SEPOLIA_RPC_URL || !process.env.PRIVATE_KEY) {
    throw new Error("SEPOLIA_RPC_URL and PRIVATE_KEY must be set in .env before deployment.");
  }

  const [deployer] = await hre.ethers.getSigners();
  const treasuryAddress = process.env.TREASURY_ADDRESS || deployer.address;
  const mintPrice = process.env.MINT_PRICE_WEI
    ? BigInt(process.env.MINT_PRICE_WEI)
    : hre.ethers.parseEther("0.01");

  console.log("Deploying with account:", deployer.address);
  console.log("Treasury:", treasuryAddress);
  console.log("Mint price (wei):", mintPrice.toString());

  const factory = await hre.ethers.getContractFactory("HealthQueueNFT");
  const contract = await factory.deploy(treasuryAddress, mintPrice);
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("HealthQueueNFT deployed to:", address);

  const artifact = await hre.artifacts.readArtifact("HealthQueueNFT");
  const outDir = path.join(__dirname, "..", "frontend", "src", "contracts");
  const outFile = path.join(outDir, "deployment.json");

  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    outFile,
    JSON.stringify(
      {
        network: "sepolia",
        chainId: 11155111,
        address,
        abi: artifact.abi
      },
      null,
      2
    )
  );

  console.log("Frontend deployment file updated:", outFile);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
