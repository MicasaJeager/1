---
marp: true
theme: default
paginate: true
---

# HealthQueue NFT Vote DApp

NFT mint + Proposal CRUD + On-chain vote

---

# Muammo

- Klinik navbat va qarorlarni ochiq boshqarish qiyin.
- Foydalanuvchi ishtiroki va audit izi yetarli emas.

---

# Yechim

- Har bir foydalanuvchi NFT mint qiladi (`mintNft`).
- NFT holderlar proposal yaratadi, yangilaydi, o'chiradi.
- NFT holderlar proposalga ovoz beradi.

---

# Smart-Kontrakt

- `HealthQueueNFT.sol`
- ERC721 + URI metadata
- `createProposal`, `updateProposal`, `deleteProposal`, `vote`, `closeProposal`

---

# Web3 Storage Yondashuvi

- Media fayl IPFS ga yuklanadi.
- Metadata JSON ham IPFS ga yuklanadi.
- Kontraktga `tokenUri` sifatida IPFS URI beriladi.

---

# Frontend

- React + ethers
- Wallet connect (MetaMask)
- Mint forma, Proposal CRUD forma, Vote tugmalari
- Tx holati: `pending/success/error`

---

# UX Yaxshilanishlar

- Dashboard stats
- Responsiv layout
- Action tugmalarda bloklash (busy state)
- Foydalanuvchi uchun aniq error matnlari

---

# Testnet Deploy

- Tarmoq: Sepolia
- Skript: `npm run deploy:sepolia`
- Natija: contract address frontendga uzatiladi

---

# GitHub + Demo

- Kod repo: `MicasaJeager/1`
- Modul: `13_nft_vote_dapp`
- Demo: wallet connect -> mint -> create -> vote -> close

---

# Keyingi Qadamlar

- Snapshot strategiyasi
- Gas optimizatsiya
- Role-based admin panel
- IPFS pin monitoring

