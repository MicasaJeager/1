# Web3.js va DApp Topshiriqlar

Bu repoda avvalgi 8 ta Web3.js topshiriq va yangi frontend/DApp topshiriqlari mavjud.

## 1-bosqich: Web3.js asoslari

- `01_web3js_install.md`
- `02_connect_localhost_metamask.js`
- `03_contract_abi.json`
- `04_create_contract_object.js`
- `05_call_view_function.js`
- `06_send_transaction.js`
- `07_error_handling.js`
- `08_gas_limit_gas_price.js`

## 2-bosqich: Frontend va DApp

- `09_vanilla_dapp/` - HTML/CSS/JS frontend (`Connect Wallet`, read/write, tx status)
- `10_react_dapp/` - React.js bilan qayta yozilgan DApp
- `11_testnet_deploy_guide.md` - testnetga ulash va deploy bo'yicha qo'llanma

## 3-bosqich: Solidity Topshiriq

- `12_hospital_queue_contract/` - shifoxona navbat olish smart-kontrakti (`payable`, `require`, `mapping`, `owner-only withdraw`, `event`, `if/else`)

## 4-bosqich: NFT + Vote DApp

- `13_nft_vote_dapp/` - NFT yaratish, Sepolia deploy, React frontend, ethers integratsiya, proposal CRUD/vote, UX va demo slaydlar

## React DApp ishga tushirish

```bash
cd 10_react_dapp
npm install
npm run dev
```

## Deploy

- GitHub Pages workflow: `.github/workflows/deploy-pages.yml`
- Vercel config: `10_react_dapp/vercel.json`
