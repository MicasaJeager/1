# NFT Yaratish Va Web3 Ga Joylash Rejasi

## 1. Maqsad

- Foydalanuvchi NFT mint qiladi.
- NFT `tokenURI` orqali Web3 storage (IPFS/Pinata/NFT.Storage) metadata bilan saqlanadi.
- NFT egalariga on-chain taklif yaratish va ovoz berish (vote) imkoni beriladi.

## 2. Bosqichlar

1. Media tayyorlash:
   - Rasm/video fayl.
   - Faylni IPFS gateway xizmatiga yuklash.
2. Metadata tayyorlash:
   - `name`, `description`, `image` maydonlari.
   - Metadata JSON ni ham IPFS ga yuklash.
3. Smart-kontrakt:
   - ERC721 mint + proposal CRUD + vote.
4. Testnet deploy:
   - Sepolia ga deploy.
   - Contract address va ABI ni frontendga berish.
5. Frontend:
   - Wallet connect.
   - Mint forma.
   - Proposal create/update/delete.
   - Vote (yes/no), status kuzatish.
6. UX va dizayn:
   - Holat indikatorlari (`pending/success/error`).
   - Mobil moslashuv.
7. Deploy:
   - GitHub Pages yoki Vercel.

## 3. Risk va yechim

- IPFS pin yo'qolishi: pinning xizmatini tanlash.
- Gas yuqori bo'lishi: metadata on-chain emas, URI saqlash.
- Foydalanuvchi xatosi: UI error handling va aniq xabarlar.

