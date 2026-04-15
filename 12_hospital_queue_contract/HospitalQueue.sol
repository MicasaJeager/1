// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract HospitalQueue {
    address public owner;
    address public allowedPayer;
    address payable public standardTreasury;
    address payable public vipTreasury;
    uint256 public minPayment;
    uint256 public vipThreshold;
    uint256 public nextTicketId;

    struct QueueTicket {
        uint256 ticketId;
        address patient;
        string fullName;
        uint256 paidAmount;
        bool isVip;
        uint256 createdAt;
    }

    mapping(uint256 => QueueTicket) public tickets;
    mapping(address => uint256) public userBalance;

    event QueuePayment(
        address indexed payer,
        uint256 indexed ticketId,
        uint256 amount,
        bool isVip,
        address indexed forwardedTo
    );
    event OwnerWithdrawal(address indexed to, uint256 amount);
    event AllowedPayerChanged(address indexed oldPayer, address indexed newPayer);
    event PaymentConfigChanged(uint256 minPayment, uint256 vipThreshold);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner");
        _;
    }

    constructor(
        address _allowedPayer,
        address payable _standardTreasury,
        address payable _vipTreasury,
        uint256 _minPayment,
        uint256 _vipThreshold
    ) {
        require(_allowedPayer != address(0), "Invalid payer");
        require(_standardTreasury != address(0), "Invalid standard treasury");
        require(_vipTreasury != address(0), "Invalid VIP treasury");
        require(_vipThreshold >= _minPayment, "Threshold must be >= min payment");

        owner = msg.sender;
        allowedPayer = _allowedPayer;
        standardTreasury = _standardTreasury;
        vipTreasury = _vipTreasury;
        minPayment = _minPayment;
        vipThreshold = _vipThreshold;
    }

    function bookQueue(string calldata fullName) external payable returns (uint256 ticketId) {
        require(msg.sender == allowedPayer, "Payment only from allowed address");
        require(msg.value >= minPayment, "Insufficient minimum payment");

        bool isVip = msg.value >= vipThreshold;
        address payable receiver;
        uint256 forwardedAmount;

        // if/else yordamida turli holatlarda turli tranzaksiya yo'nalishlari.
        if (isVip) {
            receiver = vipTreasury;
            forwardedAmount = (msg.value * 85) / 100;
        } else {
            receiver = standardTreasury;
            forwardedAmount = (msg.value * 70) / 100;
        }

        userBalance[msg.sender] += msg.value;

        nextTicketId += 1;
        ticketId = nextTicketId;
        tickets[ticketId] = QueueTicket({
            ticketId: ticketId,
            patient: msg.sender,
            fullName: fullName,
            paidAmount: msg.value,
            isVip: isVip,
            createdAt: block.timestamp
        });

        (bool sent, ) = receiver.call{value: forwardedAmount}("");
        require(sent, "Forward transfer failed");

        emit QueuePayment(msg.sender, ticketId, msg.value, isVip, receiver);
    }

    function ownerWithdraw(uint256 amount, address payable to) external onlyOwner {
        require(to != address(0), "Invalid receiver");
        require(amount <= address(this).balance, "Insufficient contract balance");

        (bool ok, ) = to.call{value: amount}("");
        require(ok, "Withdraw failed");

        emit OwnerWithdrawal(to, amount);
    }

    function setAllowedPayer(address newPayer) external onlyOwner {
        require(newPayer != address(0), "Invalid payer");
        address old = allowedPayer;
        allowedPayer = newPayer;
        emit AllowedPayerChanged(old, newPayer);
    }

    function setPaymentConfig(uint256 newMinPayment, uint256 newVipThreshold) external onlyOwner {
        require(newVipThreshold >= newMinPayment, "Threshold must be >= min payment");
        minPayment = newMinPayment;
        vipThreshold = newVipThreshold;
        emit PaymentConfigChanged(newMinPayment, newVipThreshold);
    }

    function getContractBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

