import { Module } from '@nestjs/common';
import { JsonRpcController } from './json-rpc.controller';
import { JsonRpcService } from './json-rpc.service';

@Module({
  imports: [],
  controllers: [JsonRpcController],
  providers: [JsonRpcService],
})
export class JsonRpcModule {}
