import { Module } from '@nestjs/common';
import { JsonRpcModule } from './json-rpc/json-rpc.module';

@Module({
  imports: [JsonRpcModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
