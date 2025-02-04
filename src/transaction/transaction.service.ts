import { Injectable } from '@nestjs/common';
import {
  WalletClient,
  Hash,
  WriteContractParameters,
  WriteContractErrorType,
} from 'viem';
import { JsonRpcError } from '../json-rpc/errors/json-rpc.error';
import { JsonRpcErrorCode } from '../json-rpc/types';

@Injectable()
export class TransactionService {
  private readonly MAX_RETRIES = 3;
  private readonly BASE_DELAY = 1000;

  async writeContractWithRetry(
    walletClient: WalletClient,
    writeContractParameters: WriteContractParameters,
  ): Promise<Hash> {
    try {
      // TODO: Review this error
      if (!walletClient.account) {
        throw new JsonRpcError(
          JsonRpcErrorCode.INTERNAL_ERROR,
          'Unable to get wallet client',
        );
      }

      const hash = await walletClient.writeContract(writeContractParameters);

      return hash;
    } catch (error) {
      const writeContractError = error as WriteContractErrorType;
      // TODO: The list is not exhaustive
      if (writeContractError.name === 'ContractFunctionExecutionError') {
        const cause = writeContractError.cause;
        if (cause.name === 'ContractFunctionRevertedError') {
          const args = cause.data?.args;
          if (args) {
            throw new JsonRpcError(
              JsonRpcErrorCode.INVALID_REQUEST,
              `User operation failed: ${args.toString()}`,
            );
          }
        }
      }
      throw error;
    }
  }
}
