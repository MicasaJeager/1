import { createContractObject } from "./04_create_contract_object.js";

export async function sendTransactionWithSendMethod(newValue) {
  const { contract, account } = await createContractObject();

  const receipt = await contract.methods.setValue(newValue).send({
    from: account
  });

  console.log("Tranzaksiya yuborildi. Tx hash:", receipt.transactionHash);
  return receipt;
}

