import { Alchemy, Network } from "alchemy-sdk";
import { ethers } from "ethers";
// Refer to the README doc for more information about using API
// keys in client-side code. You should never do this in production
// level code.
const settings = {
  apiKey: process.env.REACT_APP_ALCHEMY_API_KEY,
  network: Network.ETH_MAINNET,
};

// Create an Alchemy SDK instance, passing in the settings object
const alchemy = new Alchemy(settings);
export default alchemy;

export const formatDecimal = (number) => {
  // Convertir en string et supprimer les zéros non significatifs
  const str = number.toString();

  // Trouver la première position non nulle après la virgule
  const firstNonZero = str.match(/\.0*(0|[1-9])/);

  if (firstNonZero) {
    // Garder 9 chiffres significatifs après le premier chiffre non nul
    const start = firstNonZero.index + firstNonZero[0].length;
    const end = start + 9;
    return parseFloat(str.substring(0, end));
  }

  return number;
};

export const formatWeiToEth = (wei) => {
  const intValue = wei.toString(); // Convert to string representation
  const ethValue = ethers.formatUnits(intValue, "ether");
  return formatDecimal(ethValue);
};

export const formatGas = (gas) => {
  // Already a BigNumber, no need for parseUnits
  const intValue = gas.toString(); // Convert to string representation

  // Convert to Gwei
  const gasPriceInGwei = ethers.formatUnits(intValue, "gwei");
  return formatDecimal(gasPriceInGwei);
};
