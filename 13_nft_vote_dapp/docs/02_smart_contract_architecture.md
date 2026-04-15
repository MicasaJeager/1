# Smart-Kontrakt Arxitekturasi Rejasi

## Kontrakt: `HealthQueueNFT`

## Modul bo'linishi

1. NFT qismi:
   - `mintNft(tokenUri)` payable.
   - `mintPrice`, `treasury`.
   - `totalMintedByUser`.
2. Governance qismi:
   - `createProposal`, `updateProposal`, `deleteProposal`.
   - `vote`, `closeProposal`.
   - `hasVoted` mapping.
3. Admin qismi:
   - `setMintPrice`, `setTreasury` (faqat owner).

## Ma'lumot tuzilmalari

- `Proposal` struct:
  - `id`
  - `title`
  - `description`
  - `yesVotes`, `noVotes`
  - `deadline`
  - `isActive`
  - `creator`

## Xavfsizlik qoidalari

- `onlyNftHolder` orqali faqat NFT egasi proposal/vote qila oladi.
- `proposalExists` orqali noto'g'ri `proposalId` ushlanadi.
- `hasVoted` orqali bir foydalanuvchi bir proposalga faqat bir marta ovoz beradi.
- `require` bilan deadline, title, description va payment tekshiruvi.

## Eventlar

- `NftMinted`
- `ProposalCreated`
- `ProposalUpdated`
- `ProposalDeleted`
- `VoteCasted`
- `ProposalClosed`

