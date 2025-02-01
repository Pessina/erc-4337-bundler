import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';
import { JsonRpcErrorCode, JsonRpcErrorResponse } from '../types';

@Catch()
export class JsonRpcExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    let errorResponse: JsonRpcErrorResponse;

    if (exception instanceof BadRequestException) {
      errorResponse = {
        jsonrpc: '2.0',
        error: {
          code: JsonRpcErrorCode.INVALID_REQUEST,
          message: 'Invalid Request',
          data: exception.getResponse(),
        },
        id: null,
      };
      response.status(400).json(errorResponse);
    } else {
      errorResponse = {
        jsonrpc: '2.0',
        error: {
          code: JsonRpcErrorCode.INTERNAL_ERROR,
          message: 'Internal error',
          data: exception.message,
        },
        id: null,
      };
      response.status(500).json(errorResponse);
    }
  }
}
