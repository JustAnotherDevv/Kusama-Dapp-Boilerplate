/**
 * Script to prepare contract data for frontend
 *
 * This script:
 * 1. Reads deployment addresses from deployed_addresses.json file
 * 2. Finds ABIs for each contract
 * 3. Combines them into a single frontend-friendly JSON
 *
 * Usage: node prepare-contracts.js [chain-id]
 * e.g.  node prepare-contracts.js chain-420420421
 */

const fs = require("fs");
const path = require("path");

// For now hardcoded to Westend Asset Hub testnet
const DEFAULT_CHAIN_ID = "chain-420420421";

const chainId = process.argv[2] || DEFAULT_CHAIN_ID;

const basePath = path.join(
  __dirname,
  //   "hardhat",
  "ignition",
  "deployments",
  chainId
);
const addressesPath = path.join(basePath, "deployed_addresses.json");
const artifactsPath = path.join(basePath, "artifacts");
const outputPath = path.join(
  __dirname,
  "/../",
  "webapp",
  "src",
  "contracts-data.json"
);

const outputDir = path.dirname(outputPath);
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

async function prepareContractsData() {
  console.log(`Preparing contracts data for chain: ${chainId}`);

  try {
    if (!fs.existsSync(addressesPath)) {
      throw new Error(`Deployment addresses file not found: ${addressesPath}`);
    }

    const addressesData = JSON.parse(fs.readFileSync(addressesPath, "utf8"));
    console.log(
      `Found ${Object.keys(addressesData).length} deployed contracts`
    );

    const contractsData = [];

    for (const [contractName, contractData] of Object.entries(addressesData)) {
      console.log(`Processing contract: ${contractName}`);

      const address =
        typeof contractData === "object" ? contractData.address : contractData;

      const abiFilePath = path.join(artifactsPath, `${contractName}.json`);

      let abi = [];
      if (fs.existsSync(abiFilePath)) {
        const artifactData = JSON.parse(fs.readFileSync(abiFilePath, "utf8"));
        abi = artifactData.abi || [];
        console.log(`  Found ABI with ${abi.length} entries`);
      } else {
        console.warn(`  WARNING: ABI file not found for ${contractName}`);
      }

      contractsData.push({
        name: contractName,
        address,
        abi,
      });
    }

    fs.writeFileSync(outputPath, JSON.stringify(contractsData, null, 2));
    console.log(`Successfully wrote contracts data to: ${outputPath}`);
  } catch (error) {
    console.error("Error preparing contracts data:", error);
    process.exit(1);
  }
}

prepareContractsData();
