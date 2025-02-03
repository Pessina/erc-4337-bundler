import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EnvConfig } from './config/env.schema';
import { JsonRpcModule } from './json-rpc/json-rpc.module';
import { plainToInstance } from 'class-transformer';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { validateSync } from '@nestjs/class-validator';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (config: Record<string, unknown>) => {
        const validatedConfig = plainToInstance(EnvConfig, config);
        const errors = validateSync(validatedConfig, {
          skipMissingProperties: false,
        });

        if (errors.length > 0) {
          throw new Error(errors.toString());
        }

        return validatedConfig;
      },
      isGlobal: true,
    }),
    JsonRpcModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
