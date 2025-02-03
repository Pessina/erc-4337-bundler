import { Hex } from 'viem';
import { IsString, Matches } from '@nestjs/class-validator';
import { privateKeyRegex } from 'src/regex';
import { Type } from 'class-transformer';

export class EnvConfig {
  @IsString()
  @Matches(privateKeyRegex, {
    message: 'ETH_PRIVATE_KEY must be a valid Ethereum private key',
  })
  ETH_PRIVATE_KEY: Hex;

  @Type(() => Number)
  CHAIN_ID: number;
}
