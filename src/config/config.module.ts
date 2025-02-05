import { ConfigModule as NestConfigModule } from '@nestjs/config';
import { EnvConfig } from './env.schema';
import { plainToInstance } from 'class-transformer';
import { validateSync } from '@nestjs/class-validator';

export const ConfigModule = NestConfigModule.forRoot({
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
});
