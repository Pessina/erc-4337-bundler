import { Injectable } from '@nestjs/common';

@Injectable()
export class JsonRpcService {
  handleSendUserOperation(): string {
    return 'handle send user operation';
  }
}
