import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from 'src/config/env.schema';
import { JsonRpcError } from 'src/json-rpc/errors/json-rpc.error';
import { JsonRpcErrorCode } from 'src/json-rpc/types';
import { getChain } from 'src/utils';
import {
  createWalletClient,
  http,
  PrivateKeyAccount,
  WalletClient,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';

@Injectable()
export class AccountService implements OnModuleInit {
  private readonly accounts: PrivateKeyAccount[] = [];

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {}

  onModuleInit() {
    this.initializeAccounts();
  }

  private initializeAccounts(): void {
    const privateKeys = this.configService.get<string[]>('ETH_PRIVATE_KEYS');

    for (const key of privateKeys) {
      const account = privateKeyToAccount(key as `0x${string}`);
      this.accounts.push(account);
    }
  }

  getWalletClient(): WalletClient {
    if (this.accounts.length === 0) {
      throw new JsonRpcError(
        JsonRpcErrorCode.INTERNAL_ERROR,
        'No accounts available',
      );
    }

    // Select account based on current minute
    const currentMinute = new Date().getMinutes();
    const accountIndex = currentMinute % this.accounts.length;
    const account = this.accounts[accountIndex];

    return createWalletClient({
      account,
      chain: getChain(this.configService.get('CHAIN_ID')),
      transport: http(),
    });
  }
}
