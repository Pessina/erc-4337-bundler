import { Test } from '@nestjs/testing';
import { JsonRpcController } from './json-rpc.controller';
import { JsonRpcError } from './errors/json-rpc.error';
import { JsonRpcErrorCode } from './types';
import { JSON_RPC_VERSION } from '../constants';
import { ConfigModule } from '../config/config.module';
import { JsonRpcModule } from './json-rpc.module';

describe('JsonRpcController', () => {
  let controller: JsonRpcController;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      imports: [ConfigModule, JsonRpcModule],
    }).compile();

    controller = module.get<JsonRpcController>(JsonRpcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleRpcCall', () => {
    it('should throw JsonRpcError when method not found', async () => {
      await expect(
        async () =>
          await controller.handleRpcCall({
            jsonrpc: JSON_RPC_VERSION,
            method: 'nonexistent_method',
            id: 1,
          }),
      ).rejects.toThrow(
        new JsonRpcError(JsonRpcErrorCode.METHOD_NOT_FOUND, 'Method not found'),
      );
    });
  });
});
