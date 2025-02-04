import { Injectable } from '@nestjs/common';
import { JsonRpcRequest } from './dto/json-rpc.dto';
import { JsonRpcErrorCode, JsonRpcResponse } from './types';
import { JsonRpcError } from './errors/json-rpc.error';
import { UserOperationService } from './user-operation/user-operation.service';
import { SendUserOperationParamsDto } from './user-operation/dto/user-operation.dto';
import { JSON_RPC_VERSION } from '../constants';
import { assertSchema } from '../utils';

@Injectable()
export class JsonRpcService {
  constructor(private readonly userOperationService: UserOperationService) {}

  handleJsonRpcRequest(
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
        const sendUserOpObject = await assertSchema(
          SendUserOperationParamsDto,
          request,
        );

        const result = await this.userOperationService.sendUserOperation(
          sendUserOpObject.params,
        );

        return {
          jsonrpc: JSON_RPC_VERSION,
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
