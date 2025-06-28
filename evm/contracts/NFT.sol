// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract NFT is ERC721, Ownable {
    string private _baseTokenURI;
    uint256 private _currentTokenId;
    string private _description;
    string private _privateColumns;
    string private _publicColumns;
    string private _cid;

    constructor(
        string memory name,
        string memory symbol,
        string memory baseTokenURI,
        string memory description,
        string memory privateColumns,
        string memory publicColumns
    ) ERC721(name, symbol) Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
        _description = description;
        _privateColumns = privateColumns;
        _publicColumns = publicColumns;
    }

    function mint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = _currentTokenId;
        _currentTokenId++;
        _safeMint(to, tokenId);
        return tokenId;
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function getDescription() public view returns (string memory) {
        return _description;
    }

    function getPrivateColumns() public view returns (string memory) {
        return _privateColumns;
    }

    function getPublicColumns() public view returns (string memory) {
        return _publicColumns;
    }

    function getCid() public view returns (string memory) {
        return _cid;
    }

    function setCid(string memory cid) public onlyOwner {
        _cid = cid;
    }
}
