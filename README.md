# Westend Asset Hub Boilerplate

A modern full-stack dApp development boilerplate for building on Westend Asset Hub. This project combines Polkadot and EVM wallet connectivity with a seamless interface for interacting with native Substrate precompiles, pallets, and Solidity smart contracts deployed to Westend Asset Hub.

<p align="center">
  <img src="/screenshot2.png" alt="Dapp landing" width="1000" height="auto">
</p>

<p align="center">
  <img src="/screenshot.png" alt="Dapp" width="1000" height="auto">
</p>

## Features

### EVM + Polkadot Wallet Integration

- Connect to Polkadot wallets (Polkadot.js, Talisman, SubWallet)
- Connect to EVM wallets (MetaMask, Talisman)

### Substrate Integration

- Interact with native Substrate precompiles(mocked for now since the precompiles aren't live on Westend Asset Hub yet)

### EVM Smart Contract Support

- Integrated Hardhat development environment with Polkadot plugin
- Auto-generated UI from contract ABIs

### Developer Experience

- Modern React + TypeScript + Vite setup
- tyled with Tailwind CSS and shadcn/ui

### Vesting Module

This project also includes the mock interface for the precompile vesting module which I created based on the provided ideas from the issues in the hackathon github repo. It exposes emitted events, errors, public functions.

## Quick Start

### Clone the repository

- `git clone https://github.com/JustAnotherDevv/Kusama-Dapp-Boilerplate`
- `cd Kusama-Dapp-Boilerplate`

### Smart Contracts

- `cd hardhat`
- `npm install`
- `npx hardhat vars set WESTEND_HUB_PK` (your westend asset hub private key)
- (optional) `npm install --save-dev solc@<WHATEVER-VERSION-YOU-NEED>` (if you need a specific solc version or you get errors regarding your solc version)
- `npx hardhat compile`
- `npx hardhat ignition deploy ./ignition/modules/MyToken.ts --network westendAssetHub`
- `node prepare-contracts.js`

### Web App

- `npm install`
- create `.env` file and set `VITE_WALLET_CONNECT` env variable
- `npm run dev`
- visit http://localhost:5173 to open the app

## Automatic UI Generation

### How It Works

1. The `prepare-contracts.js` script runs before development or build processes
2. It reads `deployed_addresses.json` from your Hardhat Ignition deployments
3. It matches these with the corresponding ABIs in the artifacts directory
4. It generates a single `contracts-data.json` file in your `src` directory
5. The React components import this file directly, avoiding runtime loading issues

### Usage

```bash
# Generate contract data for development chain
node prepareContracts.js

# Generate contract data for a specific chain
node prepareContracts.js chain-123456
```

### Adding New Deployments

When you deploy new contracts:

1. After deployment, your contract artifacts will be in `hardhat/ignition/deployments/chain-[chainId]/`
2. Run the appropriate prepare-contracts script for your environment
3. The React app will automatically use the updated contract data

### Troubleshooting

If you see "No deployed contracts found" in the UI:

1. Check that the `prepareContracts.js` script ran successfully
2. Verify that your `deployed_addresses.json` file exists and is correct
3. Check that the `contracts-data.json` file was properly generated in the `src` directory
4. Make sure the import path in your React component matches the location of the generated file
