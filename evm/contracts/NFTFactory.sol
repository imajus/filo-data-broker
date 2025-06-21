// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "hardhat/console.sol";
import "./NFT.sol";

error NFTFactory__EmptyName();
error NFTFactory__EmptySymbol();
error NFTFactory__NotCollectionOwner();

contract NFTFactory {
    struct Collection {
        address nftContract;
        address owner;
        string name;
        string symbol;
        string baseTokenURI;
        uint256 createdAt;
        bool isActive;
    }

    mapping(address => Collection[]) private s_userCollections;
    mapping(address => Collection) private s_collectionInfo;
    address[] private s_allCollections;
    uint256 private s_totalCollections;

    event CollectionCreated(
        address indexed nftContract,
        address indexed owner,
        string name,
        string symbol,
        string baseTokenURI,
        uint256 indexed collectionId
    );

    event CollectionStatusUpdated(address indexed nftContract, bool isActive);

    function createCollection(
        string memory name,
        string memory symbol,
        string memory baseTokenURI
    ) external returns (address) {
        if (bytes(name).length == 0) {
            revert NFTFactory__EmptyName();
        }
        if (bytes(symbol).length == 0) {
            revert NFTFactory__EmptySymbol();
        }

        NFT newNFT = new NFT(name, symbol, baseTokenURI);
        address nftAddress = address(newNFT);

        Collection memory newCollection = Collection({
            nftContract: nftAddress,
            owner: msg.sender,
            name: name,
            symbol: symbol,
            baseTokenURI: baseTokenURI,
            createdAt: block.timestamp,
            isActive: true
        });

        s_userCollections[msg.sender].push(newCollection);
        s_collectionInfo[nftAddress] = newCollection;
        s_allCollections.push(nftAddress);
        s_totalCollections++;

        console.log("NFT Collection created: %s at address %s", name, nftAddress);

        emit CollectionCreated(
            nftAddress,
            msg.sender,
            name,
            symbol,
            baseTokenURI,
            s_totalCollections - 1
        );

        return nftAddress;
    }

    function mintNFT(address nftContract, address to) external returns (uint256) {
        Collection storage collection = s_collectionInfo[nftContract];
        if (collection.owner != msg.sender) {
            revert NFTFactory__NotCollectionOwner();
        }
        require(collection.isActive, "NFTFactory: Collection is not active");

        NFT nft = NFT(nftContract);
        uint256 tokenId = nft.mint(to);

        console.log("NFT minted in collection %s to %s with tokenId %s", nftContract, to, tokenId);

        return tokenId;
    }

    function batchMintNFTs(
        address nftContract,
        address[] memory recipients
    ) external returns (uint256[] memory) {
        Collection storage collection = s_collectionInfo[nftContract];
        if (collection.owner != msg.sender) {
            revert NFTFactory__NotCollectionOwner();
        }
        require(collection.isActive, "NFTFactory: Collection is not active");
        require(recipients.length > 0, "NFTFactory: No recipients provided");
        require(recipients.length <= 100, "NFTFactory: Too many recipients");

        NFT nft = NFT(nftContract);
        uint256[] memory tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = nft.mint(recipients[i]);
        }

        console.log("Batch minted %s NFTs in collection %s", recipients.length, nftContract);

        return tokenIds;
    }

    function toggleCollectionStatus(address nftContract) external {
        Collection storage collection = s_collectionInfo[nftContract];
        if (collection.owner != msg.sender) {
            revert NFTFactory__NotCollectionOwner();
        }

        collection.isActive = !collection.isActive;

        emit CollectionStatusUpdated(nftContract, collection.isActive);
        console.log("Collection %s status updated to %s", nftContract, collection.isActive);
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

    function getCollectionStats(
        address nftContract
    ) external view returns (uint256 totalSupply, address owner, bool isActive, uint256 createdAt) {
        Collection memory collection = s_collectionInfo[nftContract];
        NFT nft = NFT(nftContract);

        return (
            nft.getCurrentTokenId(),
            collection.owner,
            collection.isActive,
            collection.createdAt
        );
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
}
