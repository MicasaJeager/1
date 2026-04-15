import { callViewFunctionAndLog } from "./05_call_view_function.js";
import { sendTransactionWithSendMethod } from "./06_send_transaction.js";

function toUserFriendlyError(error) {
  if (!error) return "Noma'lum xatolik yuz berdi.";

  if (error.code === 4001) {
    return "Foydalanuvchi MetaMask oynasida amalni bekor qildi.";
  }

  if (error.code === -32603) {
    return "Ichki node xatoligi yuz berdi. Localhost RPC ni tekshiring.";
  }

  return error.message || "Noma'lum xatolik yuz berdi.";
}

export async function runWithErrorHandling() {
  try {
    await callViewFunctionAndLog();
    await sendTransactionWithSendMethod(42);
  } catch (error) {
    const message = toUserFriendlyError(error);

    console.error("Xatolik:", message);

    const errorBox = document.getElementById("errorBox");
    if (errorBox) {
      errorBox.textContent = message;
    } else {
      alert(message);
    }
  }
}

