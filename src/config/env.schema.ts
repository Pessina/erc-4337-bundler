import { IsString, Matches } from '@nestjs/class-validator';
import { Hex } from 'viem';
import { addressRegex } from 'src/regex';

export class EnvConfig {
  @IsString()
  @Matches(addressRegex, {
    message: 'ETH_PRIVATE_KEY must be a valid Ethereum private key',
  })
  ETH_PRIVATE_KEY: Hex;
}
