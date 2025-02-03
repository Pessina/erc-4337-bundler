import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.schema';
import { UserOperationDto } from './dto/user-operation.dto';
import { JsonRpcError } from '../errors/json-rpc.error';
import { JsonRpcErrorCode } from '../types';
import {
  Chain,
  createWalletClient,
  Hex,
  http,
  WalletClient,
  WriteContractErrorType,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { entryPointAbi } from './abis/entry-point.abi';
import { getChain } from 'src/utils';

@Injectable()
export class UserOperationService {
  private readonly logger = new Logger(UserOperationService.name);
  private readonly walletClient: WalletClient;
  private readonly chain: Chain;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    this.chain = getChain(this.configService.get('CHAIN_ID', { infer: true }));

    // TODO: Include account rotation
    this.walletClient = createWalletClient({
      account: privateKeyToAccount(
        this.configService.get('ETH_PRIVATE_KEY', { infer: true }),
      ),
      chain: this.chain,
      transport: http(),
    });
  }

  async sendUserOperation([userOp, entryPoint]: [
    UserOperationDto,
    Hex,
  ]): Promise<string> {
    try {
      const account = this.walletClient.account;

      // TODO: Use proper error message
      if (!account) {
        throw new JsonRpcError(
          JsonRpcErrorCode.INTERNAL_ERROR,
          'Internal account not initialized',
        );
      }

      const hash = await this.walletClient.writeContract({
        address: entryPoint,
        chain: this.chain,
        account,
        abi: entryPointAbi,
        functionName: 'handleOps',
        args: [[userOp], account.address],
      });

      if (!hash) {
        throw new JsonRpcError(
          JsonRpcErrorCode.INTERNAL_ERROR,
          'Failed to send user operation',
        );
      }

      return hash;
    } catch (e) {
      const error = e as WriteContractErrorType;
      // This list is not exhaustive and should be extended
      if (error.name === 'ContractFunctionExecutionError') {
        this.logger.error('Contract execution failed:', error.cause.message);
        throw new JsonRpcError(
          JsonRpcErrorCode.INVALID_REQUEST,
          error.cause.message || 'Contract execution failed',
        );
      }
      this.logger.error('Unknown error:', error.message);
      throw new JsonRpcError(
        JsonRpcErrorCode.INTERNAL_ERROR,
        error.message || 'Unknown error occurred',
      );
    }
  }
}
