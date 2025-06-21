// SPDX-License-Identifier: MIT
pragma solidity ^0.8.23;

import "hardhat/console.sol";

interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes calldata data
    ) external;
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function setApprovalForAll(address operator, bool approved) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function isApprovedForAll(address owner, address operator) external view returns (bool);
}

interface IERC721Metadata {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

error NFT__TokenDoesNotExist();
error NFT__NotOwnerOrApproved();
error NFT__TransferToZeroAddress();
error NFT__ApprovalToCurrentOwner();
error NFT__TransferToNonERC721Receiver();

contract NFT is IERC165, IERC721, IERC721Metadata {
    mapping(uint256 => address) private s_owners;
    mapping(address => uint256) private s_balances;
    mapping(uint256 => address) private s_tokenApprovals;
    mapping(address => mapping(address => bool)) private s_operatorApprovals;

    string private s_name;
    string private s_symbol;
    string private s_baseTokenURI;
    uint256 private s_currentTokenId;
    address private s_owner;

    event TokenMinted(address indexed to, uint256 indexed tokenId);

    modifier onlyOwner() {
        require(msg.sender == s_owner, "NFT: caller is not the owner");
        _;
    }

    constructor(string memory name, string memory symbol, string memory baseTokenURI) {
        s_name = name;
        s_symbol = symbol;
        s_baseTokenURI = baseTokenURI;
        s_owner = msg.sender;
        console.log("NFT contract deployed: %s (%s)", name, symbol);
    }

    function supportsInterface(bytes4 interfaceId) public view virtual override returns (bool) {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    function balanceOf(address owner) public view virtual override returns (uint256) {
        require(owner != address(0), "NFT: balance query for the zero address");
        return s_balances[owner];
    }

    function ownerOf(uint256 tokenId) public view virtual override returns (address) {
        address owner = s_owners[tokenId];
        if (owner == address(0)) {
            revert NFT__TokenDoesNotExist();
        }
        return owner;
    }

    function name() public view virtual override returns (string memory) {
        return s_name;
    }

    function symbol() public view virtual override returns (string memory) {
        return s_symbol;
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        if (s_owners[tokenId] == address(0)) {
            revert NFT__TokenDoesNotExist();
        }
        return
            bytes(s_baseTokenURI).length > 0
                ? string(abi.encodePacked(s_baseTokenURI, _toString(tokenId), ".json"))
                : "";
    }

    function approve(address to, uint256 tokenId) public virtual override {
        address owner = ownerOf(tokenId);
        if (to == owner) {
            revert NFT__ApprovalToCurrentOwner();
        }
        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "NFT: approve caller is not owner nor approved for all"
        );
        _approve(to, tokenId);
    }

    function getApproved(uint256 tokenId) public view virtual override returns (address) {
        if (s_owners[tokenId] == address(0)) {
            revert NFT__TokenDoesNotExist();
        }
        return s_tokenApprovals[tokenId];
    }

    function setApprovalForAll(address operator, bool approved) public virtual override {
        require(operator != msg.sender, "NFT: approve to caller");
        s_operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    function isApprovedForAll(
        address owner,
        address operator
    ) public view virtual override returns (bool) {
        return s_operatorApprovals[owner][operator];
    }

    function transferFrom(address from, address to, uint256 tokenId) public virtual override {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) {
            revert NFT__NotOwnerOrApproved();
        }
        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId) public virtual override {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public virtual override {
        if (!_isApprovedOrOwner(msg.sender, tokenId)) {
            revert NFT__NotOwnerOrApproved();
        }
        _safeTransfer(from, to, tokenId, data);
    }

    function mint(address to) public onlyOwner returns (uint256) {
        uint256 tokenId = s_currentTokenId++;
        _mint(to, tokenId);
        console.log("NFT minted to %s with tokenId %s", to, tokenId);
        return tokenId;
    }

    function getCurrentTokenId() public view returns (uint256) {
        return s_currentTokenId;
    }

    function getContractOwner() public view returns (address) {
        return s_owner;
    }

    function _mint(address to, uint256 tokenId) internal virtual {
        require(to != address(0), "NFT: mint to the zero address");
        require(s_owners[tokenId] == address(0), "NFT: token already minted");
        s_balances[to] += 1;
        s_owners[tokenId] = to;
        emit Transfer(address(0), to, tokenId);
        emit TokenMinted(to, tokenId);
    }

    function _transfer(address from, address to, uint256 tokenId) internal virtual {
        require(ownerOf(tokenId) == from, "NFT: transfer from incorrect owner");
        if (to == address(0)) {
            revert NFT__TransferToZeroAddress();
        }
        _approve(address(0), tokenId);
        s_balances[from] -= 1;
        s_balances[to] += 1;
        s_owners[tokenId] = to;
        emit Transfer(from, to, tokenId);
    }

    function _approve(address to, uint256 tokenId) internal virtual {
        s_tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function _safeTransfer(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) internal virtual {
        _transfer(from, to, tokenId);
        require(
            _checkOnERC721Received(from, to, tokenId, data),
            "NFT: transfer to non ERC721Receiver implementer"
        );
    }

    function _isApprovedOrOwner(
        address spender,
        uint256 tokenId
    ) internal view virtual returns (bool) {
        if (s_owners[tokenId] == address(0)) {
            revert NFT__TokenDoesNotExist();
        }
        address owner = ownerOf(tokenId);
        return (spender == owner ||
            isApprovedForAll(owner, spender) ||
            getApproved(tokenId) == spender);
    }

    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (
                bytes4 retval
            ) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert NFT__TransferToNonERC721Receiver();
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        } else {
            return true;
        }
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}

interface IERC721Receiver {
    function onERC721Received(
        address operator,
        address from,
        uint256 tokenId,
        bytes calldata data
    ) external returns (bytes4);
}
