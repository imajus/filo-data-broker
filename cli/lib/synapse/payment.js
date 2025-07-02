import {
  TOKENS,
  TIME_CONSTANTS,
  SIZE_CONSTANTS,
  CONTRACT_ADDRESSES,
  PandoraService,
} from '@filoz/synapse-sdk';
import { getSynapse } from './synapse.js';

export class SynapsePayment {
  /** @type {string} */
  #address;
  /** @type {import('@filoz/synapse-sdk').Synapse} */
  #synapse;
  /** @type {PandoraService} */
  #pandora;
  /** @type {boolean} */
  #withCDN = true;
  /** @type {number} */
  #persistencePeriodDays = 30;
  /** @type {number} */
  #storageCapacity = 10 * Number(SIZE_CONSTANTS.GiB);
  /** @type {bigint} */
  #minDaysThreshold = BigInt(10);

  /** Price per TB per month in wei (3 USDFC) */
  static #PRICE_PER_TB_PER_MONTH = 3n * 10n ** 18n;
  static #PROOF_SET_CREATION_FEE = BigInt(0.1 * 10 ** 18);
  static #PAYMENTS_ADDRESS = CONTRACT_ADDRESSES.PAYMENTS['calibration'];

  /**
   * @param {import('@filoz/synapse-sdk').Synapse} synapse
   * @param {string} address
   */
  constructor(synapse, address) {
    this.#address = address;
    this.#synapse = synapse;
    this.#pandora = new PandoraService(
      synapse.getProvider(),
      synapse.getPandoraAddress()
    );
  }

  /**
   * @param {import('ethers').Wallet} wallet
   * @returns {Promise<SynapsePayment>}
   */
  static async create(wallet) {
    const synapse = await getSynapse(wallet);
    return new SynapsePayment(synapse, wallet.address);
  }

  async getWalletBalance() {
    return this.#synapse.payments.walletBalance();
  }

  async getWalletBalanceUSDFC() {
    return this.#synapse.payments.walletBalance(TOKENS.USDFC);
  }

  async getBalanceUSDFC() {
    return this.#synapse.payments.balance(TOKENS.USDFC);
  }

  async getPaymentAllowanceUSDFC() {
    return this.#synapse.payments.allowance(
      TOKENS.USDFC,
      SynapsePayment.#PAYMENTS_ADDRESS
    );
  }

  /**
   * Calculates the storage capacity in GB that can be supported by a given rate allowance
   * @param {bigint} rateAllowance
   * @returns {number}
   */
  #calculateRateAllowance(rateAllowance) {
    const monthlyRate = rateAllowance * BigInt(TIME_CONSTANTS.EPOCHS_PER_MONTH);
    const bytes =
      (monthlyRate * SIZE_CONSTANTS.TiB) /
      SynapsePayment.#PRICE_PER_TB_PER_MONTH;
    return { bytes, gigaBytes: Number(bytes) / Number(SIZE_CONSTANTS.GiB) };
  }

  /**
   * Calculates current storage usage based on rate usage
   * @param {bigint} currentRateUsed
   * @param {bigint} rateAllowanceNeeded
   * @param {number} storageCapacity
   */
  #calculateCurrentStorageUsage(
    currentRateUsed,
    rateAllowanceNeeded,
    storageCapacity
  ) {
    let bytes = 0n;
    let gigaBytes = 0;
    if (currentRateUsed > 0n && rateAllowanceNeeded > 0n) {
      bytes = (currentRateUsed * BigInt(storageCapacity)) / rateAllowanceNeeded;
      gigaBytes = Number(bytes) / Number(SIZE_CONSTANTS.GiB);
    }
    return { bytes, gigaBytes };
  }

  /**
   * Calculates storage metrics for Pandora service based on balance data
   */
  async #calculateStorageMetrics() {
    const balance = await this.#pandora.checkAllowanceForStorage(
      this.#storageCapacity,
      this.#withCDN,
      this.#synapse.payments,
      this.#persistencePeriodDays
    );
    // Calculate rate-related metrics
    const rateNeeded = balance.costs.perEpoch;
    // Calculate daily lockup requirements
    const lockupPerDay = TIME_CONSTANTS.EPOCHS_PER_DAY * rateNeeded;
    const lockupPerDayAtCurrentRate =
      TIME_CONSTANTS.EPOCHS_PER_DAY * balance.currentRateUsed;
    // Calculate remaining lockup and persistence days
    const currentLockupRemaining =
      balance.currentLockupAllowance - balance.currentLockupUsed;
    const persistenceDaysLeft =
      Number(currentLockupRemaining) / Number(lockupPerDay);
    const persistenceDaysLeftAtCurrentRate =
      lockupPerDayAtCurrentRate > 0n
        ? Number(currentLockupRemaining) / Number(lockupPerDayAtCurrentRate)
        : currentLockupRemaining > 0n
        ? Infinity
        : 0;
    // Calculate current storage usage
    const { bytes: currentStorageBytes, gigaBytes: currentStorageGB } =
      this.#calculateCurrentStorageUsage(
        balance.currentRateUsed,
        balance.rateAllowanceNeeded,
        this.#storageCapacity
      );
    // Determine sufficiency of allowances
    const isRateSufficient = balance.currentRateAllowance >= rateNeeded;
    const isLockupSufficient = persistenceDaysLeft >= this.#minDaysThreshold;
    const isSufficient = isRateSufficient && isLockupSufficient;
    const { gigaBytes: currentRateAllowanceGB } = this.#calculateRateAllowance(
      balance.currentRateAllowance
    );
    const depositNeeded = balance.depositAmountNeeded;
    return {
      rateNeeded,
      rateUsed: balance.currentRateUsed,
      currentStorageBytes,
      currentStorageGB,
      totalLockupNeeded: balance.lockupAllowanceNeeded,
      depositNeeded,
      persistenceDaysLeft,
      persistenceDaysLeftAtCurrentRate,
      isRateSufficient,
      isLockupSufficient,
      isSufficient,
      currentRateAllowanceGB,
      currentLockupAllowance: balance.currentLockupAllowance,
    };
  }

  /**
   * Pick the proofset with the most used storage
   * @returns {Promise<import('@filoz/synapse-sdk').EnhancedProofSetInfo | null>}
   */
  async selectProofset() {
    const proofSets = await this.#pandora.getClientProofSetsWithDetails(
      this.#address
    );
    const proofSet = proofSets
      .filter((proofSet) => proofSet.withCDN === this.#withCDN)
      .reduce((max, ps) => {
        return ps.currentRootCount > max.currentRootCount ? ps : max;
      }, proofSets[0]);
    return proofSet;
  }

  /**
   * Pick the provider for a proofset
   * @param {import('@filoz/synapse-sdk').EnhancedProofSetInfo} proofSet
   * @returns {Promise<string>}
   */
  async getProviderId(proofSet) {
    const providerId = await this.#pandora.getProviderIdByAddress(
      proofSet.payee
    );
    return providerId;
  }

  /**
   * Reserve storage
   */
  async reserve() {
    const usdfcBalance = await this.getWalletBalanceUSDFC();
    const proofSet = await this.selectProofset();
    const metrics = await this.#calculateStorageMetrics();
    const fee = proofSet ? 0n : SynapsePayment.#PROOF_SET_CREATION_FEE;
    const amount = metrics.depositNeeded + fee;
    if (amount > 0n) {
      if (usdfcBalance < amount) {
        throw new Error(
          `Insufficient USDFC balance: ${ethers.formatEther(
            usdfcBalance
          )} < ${ethers.formatEther(amount)}`
        );
      }
      await this.deposit(amount);
    }
    const tx = await this.#synapse.payments.approveService(
      this.#synapse.getPandoraAddress(),
      metrics.rateNeeded,
      metrics.totalLockupNeeded + fee
    );
    await tx.wait();
  }

  /**
   * Deposit USDFC to cover storage costs
   * @param {bigint} amount - Amount of USDFC to deposit (in wei)
   */
  async deposit(amount) {
    const allowance = await this.getPaymentAllowanceUSDFC();
    if (allowance < amount) {
      const tx = await this.#synapse.payments.approve(
        TOKENS.USDFC,
        SynapsePayment.#PAYMENTS_ADDRESS,
        amount
      );
      await tx.wait();
    }
    const tx = await this.#synapse.payments.deposit(amount);
    await tx.wait();
  }
}
