import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvConfig } from '../../config/env.schema';
import { UserOperationDto } from './dto/user-operation.dto';
import { JsonRpcError } from '../errors/json-rpc.error';
import { JsonRpcErrorCode } from '../types';
import {
  createWalletClient,
  Hex,
  http,
  WalletClient,
  WriteContractErrorType,
} from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
import { entryPointAbi } from './abis/entry-point.abi';

@Injectable()
export class UserOperationService {
  private readonly logger = new Logger(UserOperationService.name);
  private readonly walletClient: WalletClient;

  constructor(private readonly configService: ConfigService<EnvConfig, true>) {
    this.walletClient = createWalletClient({
      account: privateKeyToAccount(
        this.configService.get('ETH_PRIVATE_KEY', { infer: true }),
      ),
      chain: sepolia,
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
          'Account not found',
        );
      }

      const formattedUserOp = {
        ...userOp,
        nonce: BigInt(userOp.nonce),
        callGasLimit: BigInt(userOp.callGasLimit),
        verificationGasLimit: BigInt(userOp.verificationGasLimit),
        preVerificationGas: BigInt(userOp.preVerificationGas),
        maxFeePerGas: BigInt(userOp.maxFeePerGas),
        maxPriorityFeePerGas: BigInt(userOp.maxPriorityFeePerGas),
      };

      const hash = await this.walletClient.writeContract({
        address: entryPoint,
        chain: sepolia,
        account,
        abi: entryPointAbi,
        functionName: 'handleOps',
        args: [[formattedUserOp], userOp.sender],
      });

      return hash;
    } catch (e) {
      const error = e as WriteContractErrorType;
      // This list is not exhaustive and should be improved
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
