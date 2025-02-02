import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { type Env } from '../../config/env.schema';
import { UserOperationDto } from './dto/user-operation.dto';
import { JsonRpcError } from '../errors/json-rpc.error';
import { JsonRpcErrorCode } from '../types';
import { createWalletClient, Hex, http, WalletClient } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { sepolia } from 'viem/chains';
@Injectable()
export class UserOperationService {
  private readonly logger = new Logger(UserOperationService.name);
  private readonly walletClient: WalletClient;

  constructor(private readonly configService: ConfigService<Env, true>) {
    this.walletClient = createWalletClient({
      account: privateKeyToAccount(
        this.configService.get('ETH_PRIVATE_KEY', { infer: true }),
      ),
      chain: sepolia,
      transport: http(),
    });
  }

  async sendUserOperation(
    userOp: UserOperationDto,
    entryPoint: Hex,
  ): Promise<string> {
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
        abi: [
          {
            name: 'handleOps',
            type: 'function',
            stateMutability: 'payable',
            inputs: [
              {
                components: [
                  { name: 'sender', type: 'address' },
                  { name: 'nonce', type: 'uint256' },
                  { name: 'initCode', type: 'bytes' },
                  { name: 'callData', type: 'bytes' },
                  { name: 'callGasLimit', type: 'uint256' },
                  { name: 'verificationGasLimit', type: 'uint256' },
                  { name: 'preVerificationGas', type: 'uint256' },
                  { name: 'maxFeePerGas', type: 'uint256' },
                  { name: 'maxPriorityFeePerGas', type: 'uint256' },
                  { name: 'paymasterAndData', type: 'bytes' },
                  { name: 'signature', type: 'bytes' },
                ],
                name: 'ops',
                type: 'tuple[]',
              },
              { name: 'beneficiary', type: 'address' },
            ],
            outputs: [],
          },
        ],
        functionName: 'handleOps',
        args: [[formattedUserOp], userOp.sender],
      });

      return hash;
    } catch (error) {
      this.logger.error('Error processing UserOperation:', error);
      throw error;
    }
  }
}
