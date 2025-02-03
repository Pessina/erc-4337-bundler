import { Hex } from 'viem';
import { ArrayMinSize, IsArray, Matches } from '@nestjs/class-validator';
import { privateKeyRegex } from 'src/regex';
import { Transform, Type } from 'class-transformer';

export class EnvConfig {
  @Transform(({ value }: { value: string }) => value.split(',') as Hex[])
  @IsArray()
  @ArrayMinSize(2)
  @Type(() => String)
  @Matches(privateKeyRegex, {
    message: 'ETH_PRIVATE_KEYS must be a valid Ethereum private key',
    each: true,
  })
  ETH_PRIVATE_KEYS: Hex[];

  @Type(() => Number)
  CHAIN_ID: number;
}
