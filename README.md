# Kusama Boilerplate

This project uses a script to prepare contract data for the frontend. The script reads deployment addresses and ABIs from Hardhat Ignition deployments and combines them into a single file for easy access.

## How It Works

1. The `prepare-contracts.js` script runs before development or build processes
2. It reads `deployed_addresses.json` from your Hardhat Ignition deployments
3. It matches these with the corresponding ABIs in the artifacts directory
4. It generates a single `contracts-data.json` file in your `src` directory
5. The React components import this file directly, avoiding runtime loading issues

## Usage

### Automatic (Integrated with Build Process)

The script automatically runs when you start development or build the app:

```bash
# Run the development server (automatically runs prepare-contracts:dev first)
npm run dev

# Build for production (automatically runs prepare-contracts:prod first)
npm run build
```

### Manual

You can also run the script manually after new deployments:

```bash
# Generate contract data for development chain
npm run prepare-contracts:dev

# Generate contract data for production chain
npm run prepare-contracts:prod

# Generate contract data for a specific chain
node prepare-contracts.js chain-123456
```

## Adding New Deployments

When you deploy new contracts:

1. After deployment, your contract artifacts will be in `hardhat/ignition/deployments/chain-[chainId]/`
2. Run the appropriate prepare-contracts script for your environment
3. The React app will automatically use the updated contract data

## Troubleshooting

If you see "No deployed contracts found" in the UI:

1. Check that the `prepare-contracts.js` script ran successfully
2. Verify that your `deployed_addresses.json` file exists and is correct
3. Check that the `contracts-data.json` file was properly generated in the `src` directory
4. Make sure the import path in your React component matches the location of the generated file
