# 10 React DApp

Bu papka React.js bilan yozilgan DApp interfeysini beradi. U quyidagilarni bajaradi:

- `Connect Wallet` tugmasi
- 3 ta wallet: MetaMask, WalletConnect, Coinbase Wallet
- Smart-kontraktdan `getValue()` orqali ma'lumot o'qish
- Input formadan `setValue()` orqali ma'lumot yuborish
- Tranzaksiya holatini UI'da ko'rsatish (`pending`, `success`, `error`)
- Localhost va Sepolia testnetga ulanish

## O'rnatish va ishga tushirish

1. Papkaga kiring:
```bash
cd 10_react_dapp
```
2. Paketlarni o'rnating:
```bash
npm install
```
3. `.env.example` ni `.env` ga nusxa qilib qiymatlarni to'ldiring.
4. Dev server:
```bash
npm run dev
```

## Deploy

GitHub Pages deploy uchun rootdagi workflow fayl ishlatiladi:

- `.github/workflows/deploy-pages.yml`

