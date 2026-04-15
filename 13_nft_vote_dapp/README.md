# 13. NFT Yaratish Va Vote DApp

Bu modul siz so'ragan barcha bandlarni bitta mini-loyiha sifatida bajaradi:

1. NFT yaratish va Web3 (IPFS URI) asosida joylash reja hujjati.
2. Smart-kontrakt arxitektura rejasi.
3. Solidity asosiy kontrakt (`HealthQueueNFT`).
4. Sepolia testnet deploy skripti.
5. Frontend interfeys (React + ethers).
6. Frontendni kontrakt bilan bog'lash.
7. Foydalanuvchi funksiyalari: NFT mint + Proposal CRUD + Vote.
8. Dizayn/UX yaxshilashlar.
9. README va GitHub uchun tayyor loyiha.
10. Demo slaydlar.

## Papka tuzilmasi

- `contracts/HealthQueueNFT.sol`
- `scripts/deploy-sepolia.js`
- `docs/01_nft_web3_plan.md`
- `docs/02_smart_contract_architecture.md`
- `frontend/` (React UI)
- `presentation/NFT_DAPP_DEMO_SLIDES.md`

## Smart-kontrakt funksiyalari

- `mintNft(string tokenUri) payable`
- `createProposal(string title, string description, uint64 durationHours)`
- `updateProposal(uint256 proposalId, string newTitle, string newDescription)`
- `deleteProposal(uint256 proposalId)`
- `vote(uint256 proposalId, bool support)`
- `closeProposal(uint256 proposalId)`
- `totalProposals()`, `getProposal(uint256 proposalId)`

## Local ishga tushirish

1. `13_nft_vote_dapp` papkasiga kiring:
```bash
cd 13_nft_vote_dapp
```
2. Dependency o'rnatish:
```bash
npm install
```
3. `.env.example` ni `.env` ga nusxa qilib to'ldiring.
4. Kontraktni compile qiling:
```bash
npm run compile
```

## Testnet deploy (Sepolia)

```bash
npm run deploy:sepolia
```

Deploydan keyin skript frontend uchun `frontend/src/contracts/deployment.json` faylini ham yangilaydi.

## Frontend ishga tushirish

1. Frontend dependency:
```bash
npm run frontend:install
```
2. `frontend/.env.example` ni `frontend/.env` ga ko'chiring va `VITE_CONTRACT_ADDRESS` ni deploy qilingan adresga qo'ying.
3. Frontend run:
```bash
npm run frontend:dev
```

## UX yaxshilanishlari

- Status panel: `idle`, `pending`, `success`, `error`.
- Dashboard stats (mint narxi, proposal soni, network, wallet).
- Responsiv card-grid layout.
- Proposallar uchun aniq action tugmalar (`Vote Yes/No`, `Close`).

## Deploy (GitHub Pages yoki Vercel)

- GitHub Actions workflow: `.github/workflows/deploy-nft-vote-pages.yml`
- Vercel:
  - Root Directory: `13_nft_vote_dapp/frontend`
  - Env: `VITE_CONTRACT_ADDRESS`, `VITE_NETWORK_NAME`

