// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "./NFT.sol";
import "./fws/payments/Payments.sol";

error FDBRegistry__EmptyName();
error FDBRegistry__EmptySymbol();
error FDBRegistry__NotCollectionOwner();
error FDBRegistry__InsufficientPayment();
error FDBRegistry__InsufficientBalance();
error FDBRegistry__TransferFailed();
error FDBRegistry__InsufficientAllowance();

contract FDBRegistry {
    string public constant BASE_TOKEN_URI =
        "https://pub-f1180ac09e05439c9475cf61f4ce0099.r2.dev/metadata/";

    // ERC20 token used for payments
    IERC20 private immutable paymentToken;

    // Payments contract reference
    Payments private immutable paymentsContract;

    // Contract deployer address for fee collection
    address private immutable deployer;

    struct Collection {
        address nftContract;
        address owner;
        string name;
        string symbol;
        string description;
        string privateColumns;
        string publicColumns;
        string publicCid;
        string privateCid;
        uint256 price;
        uint256 createdAt;
        bool isActive;
    }

    mapping(address => Collection[]) private s_userCollections;
    mapping(address => Collection) private s_collectionInfo;
    mapping(address => uint256) private s_balances;
    address[] private s_allCollections;
    uint256 private s_totalCollections;

    event CollectionCreated(
        address indexed nftContract,
        address indexed owner,
        string name,
        string symbol,
        string description,
        string privateColumns,
        string publicColumns,
        uint256 price,
        uint256 indexed collectionId
    );

    event CollectionStatusUpdated(address indexed nftContract, bool isActive);

    event NFTPurchased(
        address indexed nftContract,
        address indexed buyer,
        uint256 indexed tokenId,
        uint256 price
    );

    event BalanceWithdrawn(address indexed owner, uint256 amount);

    constructor(address _paymentsContract, address _paymentToken) {
        require(
            _paymentsContract != address(0),
            "FDBRegistry: Payments contract address cannot be zero"
        );
        require(_paymentToken != address(0), "FDBRegistry: Payment token address cannot be zero");

        paymentToken = IERC20(_paymentToken);
        paymentsContract = Payments(_paymentsContract);
        deployer = msg.sender;
    }

    function createCollection(
        string memory name,
        string memory symbol,
        string memory description,
        string memory privateColumns,
        string memory publicColumns,
        uint256 price
    ) external returns (address) {
        if (bytes(name).length == 0) {
            revert FDBRegistry__EmptyName();
        }
        if (bytes(symbol).length == 0) {
            revert FDBRegistry__EmptySymbol();
        }

        NFT newNFT = new NFT(name, symbol, BASE_TOKEN_URI);
        address nftAddress = address(newNFT);

        Collection memory newCollection = Collection({
            nftContract: nftAddress,
            owner: msg.sender,
            name: name,
            symbol: symbol,
            description: description,
            privateColumns: privateColumns,
            publicColumns: publicColumns,
            publicCid: "",
            privateCid: "",
            price: price,
            createdAt: block.timestamp,
            isActive: false
        });

        s_userCollections[msg.sender].push(newCollection);
        s_collectionInfo[nftAddress] = newCollection;
        s_allCollections.push(nftAddress);
        s_totalCollections++;

        emit CollectionCreated(
            nftAddress,
            msg.sender,
            name,
            symbol,
            description,
            privateColumns,
            publicColumns,
            price,
            s_totalCollections - 1
        );

        return nftAddress;
    }

    function purchase(address nftContract) external returns (uint256) {
        Collection storage collection = s_collectionInfo[nftContract];
        require(collection.nftContract != address(0), "FDBRegistry: Collection does not exist");
        require(collection.isActive, "FDBRegistry: Collection is not active");

        // Check if buyer has sufficient token balance
        if (paymentToken.balanceOf(msg.sender) < collection.price) {
            revert FDBRegistry__InsufficientPayment();
        }

        // Check if buyer has given sufficient allowance
        if (paymentToken.allowance(msg.sender, address(this)) < collection.price) {
            revert FDBRegistry__InsufficientAllowance();
        }

        // Transfer tokens from buyer to contract
        bool success = paymentToken.transferFrom(msg.sender, address(this), collection.price);
        if (!success) {
            revert FDBRegistry__TransferFailed();
        }

        NFT nft = NFT(nftContract);
        uint256 tokenId = nft.mint(msg.sender);

        // Split payment: 10% to deployer, 10% to payments contract, 80% to collection owner
        uint256 deployerFee = (collection.price * 10) / 100;
        uint256 paymentsFee = (collection.price * 10) / 100;
        uint256 ownerAmount = collection.price - deployerFee - paymentsFee;

        // Add deployer fee to deployer's balance
        s_balances[deployer] += deployerFee;

        // Approve and deposit the payments fee to the payments contract
        paymentToken.approve(address(paymentsContract), paymentsFee);
        paymentsContract.deposit(address(paymentToken), collection.owner, paymentsFee);

        // Add remaining amount to collection owner's balance
        s_balances[collection.owner] += ownerAmount;

        emit NFTPurchased(nftContract, msg.sender, tokenId, collection.price);

        return tokenId;
    }

    function withdraw() external {
        uint256 balance = s_balances[msg.sender];
        if (balance == 0) {
            revert FDBRegistry__InsufficientBalance();
        }

        s_balances[msg.sender] = 0;

        bool success = paymentToken.transfer(msg.sender, balance);
        if (!success) {
            s_balances[msg.sender] = balance;
            revert FDBRegistry__TransferFailed();
        }

        emit BalanceWithdrawn(msg.sender, balance);
    }

    function hasNFT(address nftContract) external view returns (bool) {
        Collection storage collection = s_collectionInfo[nftContract];
        require(collection.nftContract != address(0), "FDBRegistry: Collection does not exist");

        NFT nft = NFT(nftContract);
        return nft.balanceOf(msg.sender) > 0;
    }

    function mintNFT(address nftContract, address to) external returns (uint256) {
        Collection storage collection = s_collectionInfo[nftContract];
        if (collection.owner != msg.sender) {
            revert FDBRegistry__NotCollectionOwner();
        }
        require(collection.isActive, "FDBRegistry: Collection is not active");

        NFT nft = NFT(nftContract);
        uint256 tokenId = nft.mint(to);

        return tokenId;
    }

    function batchMintNFTs(
        address nftContract,
        address[] memory recipients
    ) external returns (uint256[] memory) {
        Collection storage collection = s_collectionInfo[nftContract];
        if (collection.owner != msg.sender) {
            revert FDBRegistry__NotCollectionOwner();
        }
        require(collection.isActive, "FDBRegistry: Collection is not active");
        require(recipients.length > 0, "FDBRegistry: No recipients provided");
        require(recipients.length <= 100, "FDBRegistry: Too many recipients");

        NFT nft = NFT(nftContract);
        uint256[] memory tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = nft.mint(recipients[i]);
        }

        return tokenIds;
    }

    function toggleCollectionStatus(address nftContract) external {
        Collection storage collection = s_collectionInfo[nftContract];
        if (collection.owner != msg.sender) {
            revert FDBRegistry__NotCollectionOwner();
        }

        collection.isActive = !collection.isActive;

        emit CollectionStatusUpdated(nftContract, collection.isActive);
    }

    function getUserCollections(address user) external view returns (Collection[] memory) {
        return s_userCollections[user];
    }

    function getCollectionInfo(address nftContract) external view returns (Collection memory) {
        return s_collectionInfo[nftContract];
    }

    function getAllCollections() external view returns (address[] memory) {
        return s_allCollections;
    }

    function getTotalCollections() external view returns (uint256) {
        return s_totalCollections;
    }

    function isCollectionOwner(address nftContract, address user) external view returns (bool) {
        return s_collectionInfo[nftContract].owner == user;
    }

    function getUserCollectionCount(address user) external view returns (uint256) {
        return s_userCollections[user].length;
    }

    function getActiveCollections() external view returns (address[] memory) {
        uint256 activeCount = 0;
        for (uint256 i = 0; i < s_allCollections.length; i++) {
            if (s_collectionInfo[s_allCollections[i]].isActive) {
                activeCount++;
            }
        }

        address[] memory activeCollections = new address[](activeCount);
        uint256 currentIndex = 0;

        for (uint256 i = 0; i < s_allCollections.length; i++) {
            if (s_collectionInfo[s_allCollections[i]].isActive) {
                activeCollections[currentIndex] = s_allCollections[i];
                currentIndex++;
            }
        }

        return activeCollections;
    }

    function setCollectionCid(
        address nftContract,
        string memory publicCid,
        string memory privateCid
    ) external {
        Collection storage collection = s_collectionInfo[nftContract];
        if (collection.owner != msg.sender) {
            revert FDBRegistry__NotCollectionOwner();
        }
        collection.publicCid = publicCid;
        collection.privateCid = privateCid;

        if (!collection.isActive) {
            collection.isActive = true;
            emit CollectionStatusUpdated(nftContract, true);
        }
    }

    function getBalance(address user) external view returns (uint256) {
        return s_balances[user];
    }

    function getPaymentToken() external view returns (address) {
        return address(paymentToken);
    }
}
