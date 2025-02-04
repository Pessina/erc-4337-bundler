import { Injectable } from '@nestjs/common';
import {
  WalletClient,
  Hash,
  WriteContractParameters,
  WriteContractErrorType,
} from 'viem';
import { JsonRpcError } from '../json-rpc/errors/json-rpc.error';
import { JsonRpcErrorCode } from '../json-rpc/types';

// TODO: Avoid using error message and check if the RPC has standard error codes
export const JSON_RPC_RETRY_ERROR_MESSAGES = [
  'nonce too low',
  'insufficient gas',
  'gas required exceeds allowance',
  'intrinsic gas too low',
] as const;

@Injectable()
export class TransactionService {
  private readonly MAX_RETRIES = 3;
  private readonly TIMEOUT = 30_000;

  // TODO: Ideally it should be generic to handle any type of transaction (sendRawTransaction)
  // But I had issues with the error decoding so I made it specific to writeContract
  async writeContractWithRetry(
    walletClient: WalletClient,
    writeContractParameters: WriteContractParameters,
  ): Promise<Hash> {
    try {
      const result = await this.withRetry(() =>
        walletClient.writeContract(writeContractParameters),
      );

      return result;
    } catch (error) {
      const writeContractError = error as WriteContractErrorType;
      // TODO: The list is not exhaustive
      if (writeContractError.name === 'ContractFunctionExecutionError') {
        const cause = writeContractError.cause;
        if (cause.name === 'ContractFunctionRevertedError') {
          // TODO: As we know this is a bundler we could improve the error message based on the EntryPoint ABI
          const args = cause.data?.args;
          if (args) {
            throw new JsonRpcError(
              JsonRpcErrorCode.INVALID_REQUEST,
              `Write contract failed: ${args.toString()}`,
            );
          }
        }
      }

      throw new JsonRpcError(
        JsonRpcErrorCode.INTERNAL_ERROR,
        `Write contract failed: ${writeContractError.message}`,
      );
    }
  }

  private async withRetry<T>(operation: () => Promise<T>): Promise<T> {
    let attempt = 0;

    while (attempt <= this.MAX_RETRIES) {
      try {
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(() => {
            reject(new Error('Transaction timed out'));
          }, this.TIMEOUT);
        });

        const operationPromise = operation();
        const result = await Promise.race([operationPromise, timeoutPromise]);
        return result;
      } catch (error: unknown) {
        attempt++;

        if (error instanceof Error) {
          // TODO: Consider using NestJs Logger
          console.log({
            error: error.message,
            attemptNumber: attempt,
            retriesLeft: this.MAX_RETRIES - attempt,
          });
        }

        const shouldRetry =
          attempt < this.MAX_RETRIES &&
          error instanceof Error &&
          'message' in error &&
          JSON_RPC_RETRY_ERROR_MESSAGES.some((message) =>
            error.message.toLowerCase().includes(message),
          );

        if (!shouldRetry) {
          throw error;
        }
      }
    }

    throw new Error('Max retries exceeded');
  }
}
