import { ethers } from 'ethers';
import { getSigner } from '../signer.js';

export class ERC20Token {
  /**
   * @param {string} address - The ERC20 token contract address
   */
  constructor(address) {
    this.abi = [
      'function approve(address spender, uint256 amount) external returns (bool)',
      'function balanceOf(address owner) external view returns (uint256)',
      'function allowance(address owner, address spender) external view returns (uint256)',
    ];
    this.contract = new ethers.Contract(address, this.abi, getSigner());
  }

  /**
   * Approve tokens for a spender to use
   * @param {string} spender - Address to approve
   * @param {BigInt} amount - Amount of tokens to approve
   */
  async approve(spender, amount) {
    const tx = await this.contract.approve(spender, amount);
    await tx.wait();
  }

  /**
   * Get the current token balance of the signer's address
   * @returns {Promise<BigInt>} The token balance
   */
  async balance() {
    const signer = getSigner();
    const address = await signer.getAddress();
    return await this.contract.balanceOf(address);
  }

  /**
   * Get the current token balance of a specific address
   * @param {string} address - The address to check balance for
   * @returns {Promise<BigInt>} The token balance
   */
  async balanceOf(address) {
    return await this.contract.balanceOf(address);
  }

  /**
   * Check how much a spender is allowed to spend on behalf of owner
   * @param {string} owner - Token owner address
   * @param {string} spender - Spender address
   * @returns {Promise<BigInt>} The allowance amount
   */
  async allowance(owner, spender) {
    return await this.contract.allowance(owner, spender);
  }
}
