import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  BadRequestException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { JsonRpcErrorCode, JsonRpcErrorResponse } from '../types';
import { JsonRpcError } from '../errors/json-rpc.error';
import { JsonRpcRequest } from '../dto/json-rpc.dto';

@Catch()
export class JsonRpcExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<{
      body: {
        id?: JsonRpcRequest['id'];
      };
    }>();

    const errorDetails = this.getErrorDetails(exception);

    const errorResponse: JsonRpcErrorResponse = {
      jsonrpc: '2.0',
      error: errorDetails.data,
      id: request.body.id ?? null,
    };

    response.status(errorDetails.status).json(errorResponse);
  }

  private getErrorDetails(exception: Error) {
    if (exception instanceof JsonRpcError) {
      return {
        data: {
          code: exception.code,
          message: exception.message,
          data: exception.data,
        },
        status: HttpStatus.BAD_REQUEST,
      };
    }

    if (exception instanceof BadRequestException) {
      return {
        data: {
          code: JsonRpcErrorCode.INVALID_REQUEST,
          message: 'Invalid Request',
          data: exception.getResponse(),
        },
        status: HttpStatus.BAD_REQUEST,
      };
    }

    return {
      data: {
        code: JsonRpcErrorCode.INTERNAL_ERROR,
        message: 'Internal error',
        data: exception.message,
      },
      status: HttpStatus.INTERNAL_SERVER_ERROR,
    };
  }
}
