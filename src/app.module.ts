import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/env.schema';
import { JsonRpcModule } from './json-rpc/json-rpc.module';
import { plainToInstance } from 'class-transformer';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config: Record<string, unknown>) =>
        plainToInstance(EnvConfig, config),
      isGlobal: true,
    }),
    JsonRpcModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
