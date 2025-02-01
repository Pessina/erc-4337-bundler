import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
    };
  }

  getInfo() {
    return {
      name: 'ERC-4337 Bundler',
      version: '0.0.1',
      endpoints: {
        rpc: '/rpc',
        health: '/health',
      },
    };
  }
}
