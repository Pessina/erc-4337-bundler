import { IsString, IsOptional, Matches, IsIn } from '@nestjs/class-validator';
import { IsJsonValid, IsNullStringNumber } from './decorators';

export class JsonRpcRequest {
  @IsString()
  @IsIn([
    '2.0',
    {
      message: 'Invalid jsonrpc version, must be 2.0',
    },
  ])
  jsonrpc: '2.0';

  @IsString()
  @Matches(/^(?!rpc\.).*$/, {
    message:
      'Method names starting with "rpc." are reserved for rpc-internal methods and extensions',
  })
  method: string;

  @IsOptional()
  @IsJsonValid({
    message: 'Invalid params, must be an array or an object',
  })
  params?: any[] | Record<string, any>;

  @IsOptional()
  @IsNullStringNumber({
    message: 'Invalid id, must be a number, string or null',
  })
  id?: number | string | null;
}

export enum JsonRpcErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}
