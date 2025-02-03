import { Injectable, Logger } from '@nestjs/common';
import { UserOperationDto } from './dto/user-operation.dto';
import { JsonRpcError } from '../errors/json-rpc.error';
import { JsonRpcErrorCode } from '../types';
import { Hex, WriteContractErrorType } from 'viem';
import { entryPointAbi } from './abis/entry-point.abi';
import { AccountService } from '../../account/account.service';

@Injectable()
export class UserOperationService {
  private readonly logger = new Logger(UserOperationService.name);

  constructor(private readonly accountService: AccountService) {}

  async sendUserOperation([userOp, entryPoint]: [
    UserOperationDto,
    Hex,
  ]): Promise<string> {
    const walletClient = this.accountService.getWalletClient();

    try {
      // TODO: Use proper error message
      if (!walletClient || !walletClient.account) {
        throw new JsonRpcError(
          JsonRpcErrorCode.INTERNAL_ERROR,
          'Internal account not initialized',
        );
      }

      return walletClient.writeContract({
        chain: walletClient.chain,
        account: walletClient.account,
        address: entryPoint,
        abi: entryPointAbi,
        functionName: 'handleOps',
        args: [[userOp], walletClient.account.address],
      });
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
