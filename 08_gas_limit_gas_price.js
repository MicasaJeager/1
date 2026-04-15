import { createContractObject } from "./04_create_contract_object.js";

export async function sendWithGasSettings(newValue) {
  const { web3, contract, account } = await createContractObject();

  const dataMethod = contract.methods.setValue(newValue);
  const estimatedGas = await dataMethod.estimateGas({ from: account });
  const networkGasPrice = await web3.eth.getGasPrice();

  const gasLimit = Number(estimatedGas) + 10000;
  const gasPrice = (BigInt(networkGasPrice) + 1_000_000_000n).toString();

  const receipt = await dataMethod.send({
    from: account,
    gas: gasLimit,
    gasPrice
  });

  console.log("Gas bilan yuborildi:", {
    txHash: receipt.transactionHash,
    gasLimit,
    gasPrice
  });

  return receipt;
}

