import { IsHexadecimal, IsNotEmpty } from '@nestjs/class-validator';
import { Hex } from 'viem';

export class UserOperationDto {
  @IsHexadecimal()
  @IsNotEmpty()
  sender: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  nonce: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  initCode: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  callData: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  callGasLimit: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  verificationGasLimit: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  preVerificationGas: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  maxFeePerGas: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  maxPriorityFeePerGas: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  paymasterAndData: Hex;

  @IsHexadecimal()
  @IsNotEmpty()
  signature: Hex;
}
