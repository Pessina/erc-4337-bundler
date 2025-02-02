import { Module } from '@nestjs/common';
import { JsonRpcController } from './json-rpc.controller';
import { JsonRpcService } from './json-rpc.service';
import { UserOperationModule } from './user-operation/user-operation.module';

@Module({
  imports: [UserOperationModule],
  controllers: [JsonRpcController],
  providers: [JsonRpcService],
})
export class JsonRpcModule {}
