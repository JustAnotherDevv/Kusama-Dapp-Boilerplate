"use client";

import {
  // polkadot,
  // polkadot_asset_hub,
  // paseo,
  // paseo_asset_hub,
  westend_asset_hub,
} from "@polkadot-api/descriptors";
import type { TypedApi } from "polkadot-api";
import { logos } from "../icons/logos";
// import { chainSpec as polkadotChainSpec } from "polkadot-api/chains/polkadot";
// import { chainSpec as polkadotAssetHubChainSpec } from "polkadot-api/chains/polkadot_asset_hub";
// import { chainSpec as paseoChainSpec } from "polkadot-api/chains/paseo";
// import { chainSpec as paseoAssetHubChainSpec } from "polkadot-api/chains/paseo_asset_hub";
import { chainSpec as westendAssetHubChainSpec } from "polkadot-api/chains/westend2_asset_hub";
import { chainSpec as westendChainSpec } from "polkadot-api/chains/westend2";

export interface ChainSpec {
  name: string;
  id: string;
  chainType: string;
  bootNodes: string[];
  telemetryEndpoints: string[];
  protocolId: string;
  properties: {
    tokenDecimals: number;
    tokenSymbol: string;
  };
  relay_chain: string;
  para_id: number;
  codeSubstitutes: Record<string, string>;
  genesis: {
    stateRootHash: string;
  };
}
export interface ChainConfig {
  key: string;
  name: string;
  descriptors: typeof westend_asset_hub;
  endpoints: string[];
  explorerUrl?: string;
  icon?: React.ReactNode;
  chainSpec: ChainSpec;
  relayChainSpec?: ChainSpec;
}

export type AvailableApis = TypedApi<typeof westend_asset_hub>;

// TODO: add all chains your dapp supports here
export const chainConfig: ChainConfig[] = [
  {
    key: "westend_asset_hub",
    name: "Westend Asset Hub",
    descriptors: westend_asset_hub,
    endpoints: ["wss://asset-hub-westend.rpc.permanence.io"],
    icon: logos.paseoAssethub,
    chainSpec: JSON.parse(westendAssetHubChainSpec),
    relayChainSpec: JSON.parse(westendChainSpec),
  },
];
