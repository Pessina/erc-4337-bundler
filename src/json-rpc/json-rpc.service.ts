import { Injectable } from '@nestjs/common';
import { JsonRpcRequest } from './dto/json-rpc.dto';
import { JsonRpcErrorCode, JsonRpcResponse } from './types';
import { JsonRpcError } from './errors/json-rpc.error';
import { UserOperationService } from './user-operation/user-operation.service';
import { SendUserOperationParamsDto } from './user-operation/dto/user-operation.dto';
import { validateOrReject } from '@nestjs/class-validator';
import { plainToInstance } from 'class-transformer';

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
        try {
          const sendUserOpObject = plainToInstance(
            SendUserOperationParamsDto,
            request,
          );

          await validateOrReject(sendUserOpObject);

          const result = await this.userOperationService.sendUserOperation(
            sendUserOpObject.params,
          );

          return {
            jsonrpc: '2.0',
            id: request.id ?? null,
            result,
          };
        } catch (error) {
          // TODO: Consider high-level validation of the params
          throw new JsonRpcError(
            JsonRpcErrorCode.INVALID_PARAMS,
            'Invalid UserOperation params',
            error instanceof Error ? error.message : 'Validation failed',
          );
        }
      }
      default:
        throw new JsonRpcError(
          JsonRpcErrorCode.METHOD_NOT_FOUND,
          'Method not found',
        );
    }
  }
}
