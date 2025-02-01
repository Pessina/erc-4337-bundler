import { Controller, Post, Body, UseFilters } from '@nestjs/common';
import { JsonRpcService } from './json-rpc.service';
import { JsonRpcRequest } from './dto/json-rpc.dto';
import { JsonRpcExceptionFilter } from './filters/json-rpc-exception.filter';

@Controller('rpc')
@UseFilters(JsonRpcExceptionFilter)
export class JsonRpcController {
  constructor(private readonly jsonRpcService: JsonRpcService) {}

  @Post()
  handleRpcCall(
    @Body()
    request: JsonRpcRequest,
  ): string {
    try {
      console.log(request);
      if (request.method === 'eth_sendUserOperation') {
        const result = this.jsonRpcService.handleSendUserOperation();
        return result;
      }

      return 'method not found';
    } catch (error: unknown) {
      return error instanceof Error ? error.message : 'Internal error';
    }
  }
}
