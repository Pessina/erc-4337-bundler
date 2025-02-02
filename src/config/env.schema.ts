import { IsString, Matches } from '@nestjs/class-validator';
import { Hex } from 'viem';

export class EnvConfig {
  @IsString()
  @Matches(/^0x[a-fA-F0-9]{64}$/)
  ETH_PRIVATE_KEY: Hex;
}
