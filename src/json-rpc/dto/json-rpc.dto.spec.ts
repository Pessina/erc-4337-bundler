import { validate } from '@nestjs/class-validator';
import { JsonRpcRequest } from './json-rpc.dto';
import { plainToInstance } from 'class-transformer';
import { JSON_RPC_VERSION } from '../../constants';

describe('JsonRpcRequest DTO', () => {
  it('should validate a request with positional parameters', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'subtract',
      params: [42, 23],
      id: 1,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(0);
  });

  it('should validate a request with named parameters', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'subtract',
      params: { minuend: 42, subtrahend: 23 },
      id: 3,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(0);
  });

  it('should validate a notification request (no id)', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'update',
      params: [1, 2, 3, 4, 5],
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(0);
  });

  it('should validate a request with string id', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'subtract',
      params: [42, 23],
      id: 'test-id',
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(0);
  });

  it('should validate a request with null id', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'subtract',
      params: [42, 23],
      id: null,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(0);
  });

  it('should validate a request without params', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'getData',
      id: 1,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(0);
  });

  it('should reject invalid jsonrpc version', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: '1.0',
      method: 'subtract',
      params: [42, 23],
      id: 1,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('jsonrpc');
  });

  it('should reject rpc. prefixed methods', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'rpc.test',
      id: 1,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('method');
  });

  it('should reject invalid params type (string)', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'test',
      params: 'invalid',
      id: 1,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('params');
  });

  it('should reject invalid id type (boolean)', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      method: 'test',
      id: true,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('id');
  });

  it('should reject missing required method', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      jsonrpc: JSON_RPC_VERSION,
      id: 1,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('method');
  });

  it('should reject missing required jsonrpc version', async () => {
    const request = plainToInstance(JsonRpcRequest, {
      method: 'test',
      id: 1,
    });

    const errors = await validate(request);
    expect(errors).toHaveLength(1);
    expect(errors[0].property).toBe('jsonrpc');
  });
});
