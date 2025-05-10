import PolkadotLogo from "./polkadot.svg";
import AssetHubLogo from "./assethub.svg";
import PaseoLogo from "./paseo.svg";
import PaseoAssethubLogo from "./paseo-assethub.svg";

export const logos = {
  polkadot: <img src={PolkadotLogo} alt="Polkadot" width={24} height={24} />,
  assetHub: <img src={AssetHubLogo} alt="Asset Hub" width={24} height={24} />,
  paseo: <img src={PaseoLogo} alt="Paseo" width={24} height={24} />,
  paseoAssethub: (
    <img src={PaseoAssethubLogo} alt="Paseo Assethub" width={24} height={24} />
  ),
};
