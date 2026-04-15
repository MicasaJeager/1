import { useMemo, useState } from "react";
import { BrowserProvider, Contract } from "ethers";
import CoinbaseWalletSDK from "@coinbase/wallet-sdk";
import EthereumProvider from "@walletconnect/ethereum-provider";
import contractAbi from "./contractAbi.json";
import "./App.css";

const SEPOLIA_RPC_URL =
  import.meta.env.VITE_SEPOLIA_RPC_URL || "https://sepolia.infura.io/v3/YOUR_INFURA_OR_ALCHEMY_KEY";
const CONTRACT_ADDRESS = import.meta.env.VITE_CONTRACT_ADDRESS || "0xYourDeployedContractAddress";
const WALLETCONNECT_PROJECT_ID =
  import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || "YOUR_WALLETCONNECT_PROJECT_ID";

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
    rpcUrl: SEPOLIA_RPC_URL
  }
};

const initialStatus = {
  type: "idle",
  message: "No transaction yet"
};

const toFriendlyError = (error) => {
  if (!error) return "Unknown error";
  if (error.code === 4001) return "User rejected the wallet request";
  if (error.message?.includes("insufficient funds")) return "Insufficient funds for transaction fee";
  if (error.message?.includes("project")) return "WalletConnect project ID is missing or invalid";
  return error.shortMessage || error.message || "Unexpected error";
};

async function switchOrAddNetwork(provider, network) {
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
      return;
    }
    throw error;
  }
}

async function initMetaMask(network) {
  if (!window.ethereum) throw new Error("MetaMask not found");
  await window.ethereum.request({ method: "eth_requestAccounts" });
  await switchOrAddNetwork(window.ethereum, network);
  return window.ethereum;
}

async function initWalletConnect(network) {
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
}

async function initCoinbase(network) {
  const coinbase = new CoinbaseWalletSDK({
    appName: "React DApp"
  });
  const provider = coinbase.makeWeb3Provider(network.rpcUrl, network.chainId);
  await provider.request({ method: "eth_requestAccounts" });
  return provider;
}

async function resolveWalletProvider(walletType, network) {
  if (walletType === "metamask") return initMetaMask(network);
  if (walletType === "walletconnect") return initWalletConnect(network);
  if (walletType === "coinbase") return initCoinbase(network);
  throw new Error(`Unsupported wallet type: ${walletType}`);
}

function App() {
  const [walletType, setWalletType] = useState("metamask");
  const [networkKey, setNetworkKey] = useState("localhost");
  const [account, setAccount] = useState("");
  const [value, setValue] = useState("-");
  const [inputValue, setInputValue] = useState("");
  const [status, setStatus] = useState(initialStatus);
  const [busy, setBusy] = useState(false);
  const [dapp, setDapp] = useState({
    provider: null,
    signer: null,
    contract: null
  });

  const network = useMemo(() => NETWORKS[networkKey], [networkKey]);

  const connectWallet = async () => {
    setBusy(true);
    setStatus({ type: "pending", message: "Connecting wallet..." });
    try {
      const walletProvider = await resolveWalletProvider(walletType, network);
      const provider = new BrowserProvider(walletProvider);
      const signer = await provider.getSigner();
      const contract = new Contract(CONTRACT_ADDRESS, contractAbi, signer);
      const address = await signer.getAddress();
      const chain = await provider.getNetwork();

      setAccount(`${address} | chainId: ${chain.chainId}`);
      setDapp({ provider, signer, contract });
      setStatus({ type: "success", message: `${walletType} connected on ${network.name}` });
    } catch (error) {
      setStatus({ type: "error", message: toFriendlyError(error) });
    } finally {
      setBusy(false);
    }
  };

  const readValue = async () => {
    if (!dapp.contract) {
      setStatus({ type: "error", message: "Please connect wallet first" });
      return;
    }
    setBusy(true);
    try {
      const currentValue = await dapp.contract.getValue();
      setValue(currentValue.toString());
      setStatus({ type: "success", message: "getValue() completed" });
    } catch (error) {
      setStatus({ type: "error", message: toFriendlyError(error) });
    } finally {
      setBusy(false);
    }
  };

  const writeValue = async (event) => {
    event.preventDefault();
    if (!dapp.contract) {
      setStatus({ type: "error", message: "Please connect wallet first" });
      return;
    }

    setBusy(true);
    try {
      const tx = await dapp.contract.setValue(BigInt(inputValue));
      setStatus({ type: "pending", message: `Pending... txHash: ${tx.hash}` });
      const receipt = await tx.wait();

      setStatus({ type: "success", message: `Success in block ${receipt.blockNumber}` });
      await readValue();
    } catch (error) {
      setStatus({ type: "error", message: toFriendlyError(error) });
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="container">
      <h1>React DApp Interface</h1>
      <p className="muted">
        Connect MetaMask / WalletConnect / Coinbase Wallet, then read and write smart contract data.
      </p>

      <section className="card">
        <h2>Wallet</h2>
        <div className="line">
          <label htmlFor="wallet">Wallet</label>
          <select id="wallet" value={walletType} onChange={(e) => setWalletType(e.target.value)}>
            <option value="metamask">MetaMask</option>
            <option value="walletconnect">WalletConnect</option>
            <option value="coinbase">Coinbase Wallet</option>
          </select>
        </div>
        <div className="line">
          <label htmlFor="network">Network</label>
          <select id="network" value={networkKey} onChange={(e) => setNetworkKey(e.target.value)}>
            <option value="localhost">Localhost 8545</option>
            <option value="sepolia">Sepolia Testnet</option>
          </select>
        </div>
        <button disabled={busy} onClick={connectWallet}>
          Connect Wallet
        </button>
        <p className="mono muted">{account || "Wallet not connected"}</p>
      </section>

      <section className="card">
        <h2>Contract Read</h2>
        <button disabled={busy} onClick={readValue}>
          Read getValue()
        </button>
        <p className="mono">
          Current value: <strong>{value}</strong>
        </p>
      </section>

      <section className="card">
        <h2>Contract Write</h2>
        <form onSubmit={writeValue} className="form">
          <input
            type="number"
            min="0"
            required
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Enter new uint256 value"
          />
          <button disabled={busy} type="submit">
            Send setValue()
          </button>
        </form>
      </section>

      <section className="card">
        <h2>Transaction State</h2>
        <p className={`status status-${status.type}`}>{status.type}</p>
        <p className="mono muted">{status.message}</p>
      </section>
    </main>
  );
}

export default App;

