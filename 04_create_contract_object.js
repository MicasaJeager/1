import { connectLocalhostToMetaMask } from "./02_connect_localhost_metamask.js";

const CONTRACT_ADDRESS = "0xYourDeployedContractAddress";

async function loadContractAbi() {
  const response = await fetch("./03_contract_abi.json");
  if (!response.ok) {
    throw new Error("ABI fayli yuklanmadi: 03_contract_abi.json");
  }
  return response.json();
}

export async function createContractObject() {
  const { web3, account } = await connectLocalhostToMetaMask();
  const contractAbi = await loadContractAbi();

  const contract = new web3.eth.Contract(contractAbi, CONTRACT_ADDRESS);

  return { web3, account, contract };
}
