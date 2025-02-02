export enum JsonRpcErrorCode {
  PARSE_ERROR = -32700,
  INVALID_REQUEST = -32600,
  METHOD_NOT_FOUND = -32601,
  INVALID_PARAMS = -32602,
  INTERNAL_ERROR = -32603,
}

type JsonRpcBaseResponse = {
  jsonrpc: string;
  id: number | string | null;
};

export type JsonRpcErrorResponse = JsonRpcBaseResponse & {
  error: {
    code: JsonRpcErrorCode;
    message: string;
    data?: any;
  };
};

export type JsonRpcResponse = JsonRpcBaseResponse & {
  result: any;
};
