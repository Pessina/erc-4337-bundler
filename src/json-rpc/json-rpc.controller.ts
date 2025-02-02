import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { JsonRpcService } from './json-rpc.service';
import { JsonRpcRequest } from './dto/json-rpc.dto';
import { JsonRpcExceptionFilter } from './filters/json-rpc-exception.filter';
import { JsonRpcError } from './errors/json-rpc.error';
import { JsonRpcErrorCode, JsonRpcResponse } from './types';

@Controller('rpc')
@UseFilters(JsonRpcExceptionFilter)
export class JsonRpcController {
  constructor(private readonly jsonRpcService: JsonRpcService) {}

  @Post()
  handleRpcCall(
    @Body()
    request: JsonRpcRequest | JsonRpcRequest[],
  ): Promise<JsonRpcResponse | JsonRpcResponse[]> {
    try {
      return this.jsonRpcService.processJsonRpcRequest(request);
    } catch (error: unknown) {
      if (error instanceof JsonRpcError) {
        throw error;
      }

      throw new JsonRpcError(
        JsonRpcErrorCode.INTERNAL_ERROR,
        'Internal error',
        error instanceof Error ? error.message : 'Unknown error',
      );
    }
  }
}
