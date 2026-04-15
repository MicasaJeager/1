# 09 Vanilla DApp

Bu papka HTML/CSS/JS asosida oddiy DApp frontend beradi:

- `Connect Wallet` tugmasi
- 3 ta wallet: MetaMask, WalletConnect, Coinbase Wallet
- `getValue()` orqali kontraktdan o'qish
- `setValue()` orqali inputdan kontraktga yozish
- Tranzaksiya holatini UI'da ko'rsatish (`pending`, `success`, `error`)
- Localhost va Sepolia testnet tanlash

## Ishga tushirish

Oddiy static server bilan oching (`file://` emas):

```bash
npx serve .
```

Keyin `http://localhost:3000/09_vanilla_dapp/` manzilini oching.

## Muhim sozlamalar

`app.js` ichida quyidagilarni almashtiring:

- `CONTRACT_ADDRESS`
- `WALLETCONNECT_PROJECT_ID`
- `NETWORKS.sepolia.rpcUrl`

