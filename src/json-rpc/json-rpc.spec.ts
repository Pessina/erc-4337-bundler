import { Test, TestingModule } from '@nestjs/testing';
import { JsonRpcController } from './json-rpc.controller';
import { JsonRpcService } from './json-rpc.service';
import { JsonRpcError } from './errors/json-rpc.error';
import { JsonRpcErrorCode } from './types';

describe('JsonRpcController', () => {
  let controller: JsonRpcController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JsonRpcController],
      providers: [JsonRpcService],
    }).compile();

    controller = module.get<JsonRpcController>(JsonRpcController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('handleRpcCall', () => {
    it('should throw JsonRpcError when method not found', () => {
      const request = {
        jsonrpc: '2.0' as const,
        method: 'nonexistent_method',
        id: 1,
      };

      expect(() => controller.handleRpcCall(request)).toThrow(
        new JsonRpcError(JsonRpcErrorCode.METHOD_NOT_FOUND, 'Method not found'),
      );
    });

    it('should maintain request ID order when handling batch request errors', () => {
      // TODO
    });
  });
});
