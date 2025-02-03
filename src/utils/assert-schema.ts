import { validateOrReject } from '@nestjs/class-validator';
import { plainToInstance } from 'class-transformer';
import { JsonRpcError } from '../json-rpc/errors/json-rpc.error';
import { JsonRpcErrorCode } from '../json-rpc/types';

export async function assertSchema<T extends object>(
  schema: new () => T,
  data: unknown,
): Promise<T> {
  try {
    const instance = plainToInstance(schema, data);
    await validateOrReject(instance);
    return instance;
  } catch (error) {
    console.error(error);
    throw new JsonRpcError(
      JsonRpcErrorCode.INVALID_PARAMS,
      `Invalid ${schema.name} parameters`,
      error instanceof Error ? error.message : 'Schema validation failed',
    );
  }
}
