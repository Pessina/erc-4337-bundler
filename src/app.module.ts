// TODO: Do not disable eslint for the whole file
/* eslint-disable */
// @ts-nocheck

import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './config/env.schema';
import { JsonRpcModule } from './json-rpc/json-rpc.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    JsonRpcModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
