import { createContractObject } from "./04_create_contract_object.js";

export async function callViewFunctionAndLog() {
  const { contract } = await createContractObject();
  const value = await contract.methods.getValue().call();

  console.log("View funksiya natijasi (getValue):", value);
  return value;
}

