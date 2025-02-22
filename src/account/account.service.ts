import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../config/env.schema';
import { getChain } from '../utils';
import {
  createWalletClient,
  createPublicClient,
  http,
  PrivateKeyAccount,
  PublicClient,
  WalletClient,
  Address,
  Chain,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { JsonRpcError } from '../json-rpc/errors/json-rpc.error';
import { JsonRpcErrorCode } from '../json-rpc/types';

@Injectable()
export class AccountService implements OnModuleInit {
  private readonly accounts: PrivateKeyAccount[] = [];
  private readonly publicClient: PublicClient;
  private readonly chain: Chain;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    this.chain = getChain(this.configService.get('CHAIN_ID', { infer: true }));
    this.publicClient = createPublicClient({
      chain: this.chain,
      transport: http(),
    });
  }

  onModuleInit() {
    this.initializeAccounts();
  }

  private initializeAccounts(): void {
    const privateKeys = this.configService.get('ETH_PRIVATE_KEYS', {
      infer: true,
    });
    for (const key of privateKeys) {
      const account = privateKeyToAccount(key);
      this.accounts.push(account);
    }
  }

  async getWalletClient(): Promise<WalletClient> {
    const account = await this.selectOptimalAccount();

    const walletClient = createWalletClient({
      account,
      chain: this.chain,
      transport: http(),
    });

    return walletClient;
  }

  // The current implementation relies on the node mempool, that can be out of sync.
  // Consider other account selection/scoring mechanisms such as time-based, balance-based, etc.
  private async selectOptimalAccount(): Promise<PrivateKeyAccount> {
    try {
      const accountStates = await this.getAccountStates();
      return accountStates.sort((a, b) => b.score - a.score)[0].account;
    } catch {
      throw new JsonRpcError(
        JsonRpcErrorCode.INTERNAL_ERROR,
        'Failed to select optimal account',
      );
    }
  }

  private async getAccountStates() {
    return Promise.all(
      this.accounts.map(async (account) => {
        try {
          const state = await this.getAccountState(account);
          return {
            ...state,
            account,
          };
        } catch {
          return null;
        }
      }),
    ).then((states) => states.filter((state) => state !== null));
  }

  private async getAccountState(account: PrivateKeyAccount) {
    const [confirmedNonce, pendingNonce, pendingTxCount] = await Promise.all([
      this.publicClient.getTransactionCount({ address: account.address }),
      this.publicClient.getTransactionCount({
        address: account.address,
        blockTag: 'pending',
      }),
      this.checkPendingTransactions(account.address),
    ]);

    const nonceGap = Number(pendingNonce - confirmedNonce);
    const score = this.calculateAccountScore(nonceGap, pendingTxCount);

    return { nonceGap, pendingTxCount, score };
  }

  private calculateAccountScore(
    nonceGap: number,
    pendingTxCount: number,
  ): number {
    const MAX_ACCEPTABLE_NONCE_GAP = 5;
    const MAX_ACCEPTABLE_PENDING = 10;

    if (
      nonceGap > MAX_ACCEPTABLE_NONCE_GAP ||
      pendingTxCount > MAX_ACCEPTABLE_PENDING
    ) {
      return -Infinity;
    }

    return 100 - (nonceGap * 15 + pendingTxCount * 5);
  }

  private async checkPendingTransactions(address: Address): Promise<number> {
    const block = await this.publicClient.getBlock({
      blockTag: 'pending',
      includeTransactions: true,
    });

    return block.transactions.filter(
      (tx) =>
        typeof tx !== 'string' &&
        tx.from.toLowerCase() === address.toLowerCase(),
    ).length;
  }
}
