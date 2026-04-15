// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract HealthQueueNFT is ERC721URIStorage, Ownable {
    struct Proposal {
        uint256 id;
        string title;
        string description;
        uint256 yesVotes;
        uint256 noVotes;
        uint64 deadline;
        bool isActive;
        address creator;
    }

    uint256 public mintPrice;
    address payable public treasury;
    uint256 public nextTokenId = 1;
    uint256 public nextProposalId = 1;

    mapping(uint256 => Proposal) private proposals;
    mapping(uint256 => mapping(address => bool)) public hasVoted;
    mapping(address => uint256) public totalMintedByUser;

    event NftMinted(address indexed user, uint256 indexed tokenId, string tokenUri, uint256 paidAmount);
    event ProposalCreated(
        uint256 indexed proposalId,
        address indexed creator,
        string title,
        uint64 deadline
    );
    event ProposalUpdated(uint256 indexed proposalId, string newTitle, string newDescription);
    event ProposalDeleted(uint256 indexed proposalId, address indexed by);
    event VoteCasted(uint256 indexed proposalId, address indexed voter, bool support);
    event ProposalClosed(uint256 indexed proposalId, bool accepted, uint256 yesVotes, uint256 noVotes);
    event MintPriceUpdated(uint256 oldPrice, uint256 newPrice);
    event TreasuryUpdated(address indexed oldTreasury, address indexed newTreasury);

    modifier onlyNftHolder() {
        require(balanceOf(msg.sender) > 0, "NFT required");
        _;
    }

    modifier proposalExists(uint256 proposalId) {
        require(proposalId > 0 && proposalId < nextProposalId, "Proposal not found");
        _;
    }

    constructor(address payable _treasury, uint256 _mintPrice) ERC721("Health Queue NFT", "HQNFT") {
        require(_treasury != address(0), "Invalid treasury");
        treasury = _treasury;
        mintPrice = _mintPrice;
    }

    function mintNft(string calldata tokenUri) external payable returns (uint256 tokenId) {
        require(bytes(tokenUri).length > 0, "Token URI required");
        require(msg.value >= mintPrice, "Low payment");

        tokenId = nextTokenId;
        nextTokenId += 1;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenUri);
        totalMintedByUser[msg.sender] += 1;

        (bool sent, ) = treasury.call{value: msg.value}("");
        require(sent, "Treasury transfer failed");

        emit NftMinted(msg.sender, tokenId, tokenUri, msg.value);
    }

    function createProposal(
        string calldata title,
        string calldata description,
        uint64 durationHours
    ) external onlyNftHolder returns (uint256 proposalId) {
        require(bytes(title).length > 0, "Title required");
        require(bytes(description).length > 0, "Description required");
        require(durationHours > 0 && durationHours <= 720, "Duration 1..720 hours");

        proposalId = nextProposalId;
        nextProposalId += 1;

        proposals[proposalId] = Proposal({
            id: proposalId,
            title: title,
            description: description,
            yesVotes: 0,
            noVotes: 0,
            deadline: uint64(block.timestamp + (uint256(durationHours) * 1 hours)),
            isActive: true,
            creator: msg.sender
        });

        emit ProposalCreated(proposalId, msg.sender, title, proposals[proposalId].deadline);
    }

    // CRUD - update part.
    function updateProposal(
        uint256 proposalId,
        string calldata newTitle,
        string calldata newDescription
    ) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.creator == msg.sender, "Only creator");
        require(proposal.isActive, "Proposal inactive");
        require(block.timestamp <= proposal.deadline, "Expired proposal");
        require(proposal.yesVotes + proposal.noVotes == 0, "Already voted");
        require(bytes(newTitle).length > 0, "Title required");
        require(bytes(newDescription).length > 0, "Description required");

        proposal.title = newTitle;
        proposal.description = newDescription;

        emit ProposalUpdated(proposalId, newTitle, newDescription);
    }

    // CRUD - delete part.
    function deleteProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.creator == msg.sender || msg.sender == owner(), "Not allowed");
        require(proposal.isActive, "Already inactive");

        proposal.isActive = false;
        emit ProposalDeleted(proposalId, msg.sender);
    }

    function vote(uint256 proposalId, bool support) external proposalExists(proposalId) onlyNftHolder {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.isActive, "Proposal inactive");
        require(block.timestamp <= proposal.deadline, "Voting ended");
        require(!hasVoted[proposalId][msg.sender], "Already voted");

        hasVoted[proposalId][msg.sender] = true;
        if (support) {
            proposal.yesVotes += 1;
        } else {
            proposal.noVotes += 1;
        }

        emit VoteCasted(proposalId, msg.sender, support);
    }

    function closeProposal(uint256 proposalId) external proposalExists(proposalId) {
        Proposal storage proposal = proposals[proposalId];
        require(proposal.isActive, "Already inactive");
        require(
            block.timestamp > proposal.deadline || msg.sender == proposal.creator || msg.sender == owner(),
            "Not closable yet"
        );

        proposal.isActive = false;
        bool accepted = proposal.yesVotes > proposal.noVotes;
        emit ProposalClosed(proposalId, accepted, proposal.yesVotes, proposal.noVotes);
    }

    function getProposal(uint256 proposalId) external view proposalExists(proposalId) returns (Proposal memory) {
        return proposals[proposalId];
    }

    function totalProposals() external view returns (uint256) {
        return nextProposalId - 1;
    }

    function setMintPrice(uint256 newPrice) external onlyOwner {
        uint256 old = mintPrice;
        mintPrice = newPrice;
        emit MintPriceUpdated(old, newPrice);
    }

    function setTreasury(address payable newTreasury) external onlyOwner {
        require(newTreasury != address(0), "Invalid treasury");
        address old = treasury;
        treasury = newTreasury;
        emit TreasuryUpdated(old, newTreasury);
    }
}
