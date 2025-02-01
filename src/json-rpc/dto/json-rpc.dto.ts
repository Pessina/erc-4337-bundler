import { IsString, IsOptional, Matches, IsIn } from '@nestjs/class-validator';
import { IsJsonValid, IsNullStringNumber } from '../custom-class-validators';

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

// TODO: Add response dto
