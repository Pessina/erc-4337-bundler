import { Injectable } from '@nestjs/common';
import { UserOperationDto } from './dto/user-operation.dto';
import { JsonRpcError } from '../errors/json-rpc.error';
import { JsonRpcErrorCode } from '../types';
import { Hex } from 'viem';
import { entryPointAbi } from './abis/entry-point.abi';
import { AccountService } from '../../account/account.service';
import { TransactionService } from '../../transaction/transaction.service';

@Injectable()
export class UserOperationService {
  constructor(
    private readonly accountService: AccountService,
    private readonly transactionService: TransactionService,
  ) {}

  async sendUserOperation([userOp, entryPoint]: [
    UserOperationDto,
    Hex,
  ]): Promise<string> {
    const walletClient = await this.accountService.getWalletClient();

    if (!walletClient || !walletClient.account) {
      throw new JsonRpcError(
        JsonRpcErrorCode.INTERNAL_ERROR,
        'Unable to get wallet client',
      );
    }

    const hash = await this.transactionService.writeContractWithRetry(
      walletClient,
      {
        chain: walletClient.chain,
        account: walletClient.account,
        address: entryPoint,
        abi: entryPointAbi,
        functionName: 'handleOps',
        args: [[userOp], walletClient.account.address],
      },
    );

    return hash;
  }
}
