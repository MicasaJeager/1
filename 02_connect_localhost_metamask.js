import Web3 from "web3";

export async function connectLocalhostToMetaMask() {
  if (!window.ethereum) {
    throw new Error("MetaMask topilmadi. Iltimos, MetaMask extension ni o'rnating.");
  }

  const ethereum = window.ethereum;
  const localhostChainId = "0x539"; // 1337

  try {
    await ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: localhostChainId }]
    });
  } catch (switchError) {
    if (switchError.code === 4902) {
      await ethereum.request({
        method: "wallet_addEthereumChain",
        params: [
          {
            chainId: localhostChainId,
            chainName: "Localhost 8545",
            nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
            rpcUrls: ["http://127.0.0.1:8545"]
          }
        ]
      });
    } else {
      throw switchError;
    }
  }

  const accounts = await ethereum.request({ method: "eth_requestAccounts" });
  const web3 = new Web3(ethereum);

  return { web3, account: accounts[0] };
}

