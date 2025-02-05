import { Module } from '@nestjs/common';
import { JsonRpcModule } from './json-rpc/json-rpc.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';

@Module({
  imports: [ConfigModule, JsonRpcModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
