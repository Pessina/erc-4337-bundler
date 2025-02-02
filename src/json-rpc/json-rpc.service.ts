import { Injectable } from '@nestjs/common';
import { JsonRpcRequest } from './dto/json-rpc.dto';
import { JsonRpcErrorCode, JsonRpcResponse } from './types';
import { JsonRpcError } from './errors/json-rpc.error';
import { UserOperationService } from './user-operation/user-operation.service';
import { UserOperationDto } from './user-operation/dto/user-operation.dto';
import { Hex } from 'viem';

@Injectable()
export class JsonRpcService {
  constructor(private readonly userOperationService: UserOperationService) {}

  processJsonRpcRequest(
    request: JsonRpcRequest | JsonRpcRequest[],
  ): Promise<JsonRpcResponse | JsonRpcResponse[]> {
    if (Array.isArray(request)) {
      return Promise.all(request.map((req) => this.handleSingleRequest(req)));
    }

    return this.handleSingleRequest(request);
  }

  private async handleSingleRequest(
    request: JsonRpcRequest,
  ): Promise<JsonRpcResponse> {
    switch (request.method) {
      // TODO: Consider using enum for methods and maybe validate on the DTO of the JsonRpcRequest
      case 'eth_sendUserOperation': {
        // TODO: Use DTO for validation
        const [userOp, entryPoint] = request.params as [UserOperationDto, Hex];

        const result = await this.userOperationService.sendUserOperation(
          userOp,
          entryPoint,
        );

        return {
          jsonrpc: '2.0',
          id: request.id ?? null,
          result,
        };
      }
      default:
        throw new JsonRpcError(
          JsonRpcErrorCode.METHOD_NOT_FOUND,
          'Method not found',
        );
    }
  }
}
