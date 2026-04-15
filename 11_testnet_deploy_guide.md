# 11. Testnet va Deploy Qo'llanma

## Localhostdan testnetga o'tish

1. `10_react_dapp/.env` faylida:
   - `VITE_SEPOLIA_RPC_URL`
   - `VITE_CONTRACT_ADDRESS`
2. UI ichida `Network` dan `Sepolia Testnet` tanlang.
3. Wallet ham Sepolia tarmog'iga ulanishini tekshiring.

## GitHub Pages deploy

Bu repo ichida workflow tayyor:

- `.github/workflows/deploy-pages.yml`

Kerakli `Repository secrets`:

- `VITE_CONTRACT_ADDRESS`
- `VITE_WALLETCONNECT_PROJECT_ID`
- `VITE_SEPOLIA_RPC_URL`

`main` ga push qiling, workflow avtomatik build va deploy qiladi.

## Vercel deploy

1. Vercel'da `MicasaJeager/1` repozitoriyani import qiling.
2. Root Directory sifatida `10_react_dapp` ni tanlang.
3. Env variables kiriting:
   - `VITE_CONTRACT_ADDRESS`
   - `VITE_WALLETCONNECT_PROJECT_ID`
   - `VITE_SEPOLIA_RPC_URL`
4. Deploy bosing.

