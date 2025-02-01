import {
  Catch,
  ArgumentsHost,
  ExceptionFilter,
  BadRequestException,
} from '@nestjs/common';
import { Response } from 'express';

@Catch()
export class JsonRpcExceptionFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let errorResponse: {
      jsonrpc: string;
      error: {
        code: number;
        message: string;
        data: any;
      };
      id: number | string | null;
    };

    if (exception instanceof BadRequestException) {
      errorResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32600,
          message: 'Invalid Request',
          data: exception.getResponse(),
        },
        id: null,
      };
    } else if (exception instanceof SyntaxError) {
      errorResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
          data: exception.message,
        },
        id: null,
      };
    } else {
      errorResponse = {
        jsonrpc: '2.0',
        error: {
          code: -32603,
          message: 'Internal error',
          data: exception.message,
        },
        id: null,
      };
    }

    response.status(200).json(errorResponse);
  }
}
