import { BrowserProvider, Contract } from "https://esm.sh/ethers@6.13.2";
import CoinbaseWalletSDK from "https://esm.sh/@coinbase/wallet-sdk@4.3.0";
import EthereumProvider from "https://esm.sh/@walletconnect/ethereum-provider@2.17.4";

const NETWORKS = {
  localhost: {
    name: "Localhost 8545",
    chainId: 1337,
    chainHex: "0x539",
    rpcUrl: "http://127.0.0.1:8545"
  },
  sepolia: {
    name: "Sepolia",
    chainId: 11155111,
    chainHex: "0xaa36a7",
    rpcUrl: "https://sepolia.infura.io/v3/YOUR_INFURA_OR_ALCHEMY_KEY"
  }
};

const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";
const WALLETCONNECT_PROJECT_ID = "YOUR_WALLETCONNECT_PROJECT_ID";

const els = {
  walletType: document.getElementById("walletType"),
  networkType: document.getElementById("networkType"),
  connectWalletBtn: document.getElementById("connectWalletBtn"),
  accountInfo: document.getElementById("accountInfo"),
  readValueBtn: document.getElementById("readValueBtn"),
  currentValue: document.getElementById("currentValue"),
  writeForm: document.getElementById("writeForm"),
  newValueInput: document.getElementById("newValueInput"),
  txStatus: document.getElementById("txStatus"),
  txDetails: document.getElementById("txDetails")
};

let walletProvider = null;
let ethersProvider = null;
let signer = null;
let contract = null;

const toFriendlyError = (error) => {
  if (!error) return "Unknown error";
  if (error.code === 4001) return "User rejected the request in wallet";
  if (error.message?.includes("missing provider")) return "Wallet provider not found";
  if (error.message?.includes("insufficient funds")) return "Insufficient funds for gas";
  return error.shortMessage || error.message || "Unexpected error";
};

const setStatus = (type, details) => {
  els.txStatus.className = `status status-${type}`;
  els.txStatus.textContent = type;
  els.txDetails.textContent = details;
};

const getSelectedNetwork = () => NETWORKS[els.networkType.value];

const ensureAbi = async () => {
  const response = await fetch("./contractAbi.json");
  if (!response.ok) {
    throw new Error("contractAbi.json was not found");
  }
  return response.json();
};

const switchOrAddNetwork = async (provider, network) => {
  try {
    await provider.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: network.chainHex }]
    });
  } catch (error) {
    if (error.code === 4902) {
      await provider.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: network.chainHex,
            chainName: network.name,
            rpcUrls: [network.rpcUrl],
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 }
          }
        ]
      });
    } else {
      throw error;
    }
  }
};

const initWalletConnectProvider = async (network) => {
  const provider = await EthereumProvider.init({
    projectId: WALLETCONNECT_PROJECT_ID,
    showQrModal: true,
    chains: [network.chainId],
    optionalChains: [1337, 11155111],
    rpcMap: {
      1337: NETWORKS.localhost.rpcUrl,
      11155111: NETWORKS.sepolia.rpcUrl
    }
  });
  await provider.connect();
  return provider;
};

const initCoinbaseProvider = async (network) => {
  const coinbase = new CoinbaseWalletSDK({
    appName: "Simple Vanilla DApp"
  });
  const provider = coinbase.makeWeb3Provider(network.rpcUrl, network.chainId);
  await provider.request({ method: "eth_requestAccounts" });
  return provider;
};

const initMetaMaskProvider = async (network) => {
  const provider = window.ethereum;
  if (!provider) {
    throw new Error("MetaMask not found in this browser");
  }
  await provider.request({ method: "eth_requestAccounts" });
  await switchOrAddNetwork(provider, network);
  return provider;
};

const resolveWalletProvider = async (walletType, network) => {
  if (walletType === "metamask") return initMetaMaskProvider(network);
  if (walletType === "walletconnect") return initWalletConnectProvider(network);
  if (walletType === "coinbase") return initCoinbaseProvider(network);
  throw new Error(`Unsupported wallet type: ${walletType}`);
};

const connectWallet = async () => {
  const walletType = els.walletType.value;
  const network = getSelectedNetwork();

  try {
    setStatus("pending", "Connecting wallet...");
    walletProvider = await resolveWalletProvider(walletType, network);

    ethersProvider = new BrowserProvider(walletProvider);
    signer = await ethersProvider.getSigner();
    const abi = await ensureAbi();
    contract = new Contract(CONTRACT_ADDRESS, abi, signer);

    const account = await signer.getAddress();
    const net = await ethersProvider.getNetwork();
    els.accountInfo.textContent = `${account} | chainId: ${net.chainId}`;

    setStatus("success", `${walletType} connected on ${network.name}`);
  } catch (error) {
    setStatus("error", toFriendlyError(error));
  }
};

const readValue = async () => {
  if (!contract) {
    setStatus("error", "Please connect wallet first");
    return;
  }

  try {
    const value = await contract.getValue();
    els.currentValue.textContent = value.toString();
    setStatus("success", "getValue() executed successfully");
  } catch (error) {
    setStatus("error", toFriendlyError(error));
  }
};

const sendValue = async (event) => {
  event.preventDefault();
  if (!contract) {
    setStatus("error", "Please connect wallet first");
    return;
  }

  try {
    const nextValue = BigInt(els.newValueInput.value);
    setStatus("pending", "Waiting wallet confirmation...");

    const tx = await contract.setValue(nextValue);
    setStatus("pending", `Pending... txHash: ${tx.hash}`);

    const receipt = await tx.wait();
    setStatus("success", `Success in block ${receipt.blockNumber}`);

    await readValue();
  } catch (error) {
    setStatus("error", toFriendlyError(error));
  }
};

els.connectWalletBtn.addEventListener("click", connectWallet);
els.readValueBtn.addEventListener("click", readValue);
els.writeForm.addEventListener("submit", sendValue);

