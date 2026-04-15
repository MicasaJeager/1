# 12. Shifoxona Navbat Smart-Kontrakti

Fayl: `HospitalQueue.sol`

Ushbu kontrakt siz so'ragan barcha bandlarni qamrab oladi:

1. Shifoxona navbat (ticket) logikasi (`bookQueue`).
2. `payable` funksiya mavjud.
3. Faqat bitta ruxsat etilgan adres (`allowedPayer`) to'lov qila oladi.
4. Minimal to'lov `require` bilan tekshiriladi (`minPayment`).
5. Shart bajarilganda mablag' treasury adresiga o'tkaziladi.
6. `if/else` orqali VIP va oddiy to'lovlar turlicha yo'naltiriladi.
7. `mapping(address => uint256) userBalance` orqali foydalanuvchi to'lov balansi saqlanadi.
8. Faqat owner `ownerWithdraw` bilan pul yecha oladi.
9. To'lovda `QueuePayment` event chiqariladi (`emit`).

## Asosiy funksiyalar

- `bookQueue(string fullName) payable`
- `ownerWithdraw(uint256 amount, address payable to) onlyOwner`
- `setAllowedPayer(address newPayer) onlyOwner`
- `setPaymentConfig(uint256 newMinPayment, uint256 newVipThreshold) onlyOwner`

