import { IsNotEmpty } from '@nestjs/class-validator';
import { IsHexadecimalString } from 'src/json-rpc/custom-class-validators/is-hexadecimal-string.validator';
import { IsSendUserOpParams } from 'src/json-rpc/custom-class-validators/is-send-user-op-params.validator';
import { Hex } from 'viem';

// @IsHexadecimal() from class-validator is not working, I believe it's because of the starting 0x on the input
export class UserOperationDto {
  @IsNotEmpty()
  @IsHexadecimalString()
  sender: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  nonce: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  initCode: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  callData: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  callGasLimit: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  verificationGasLimit: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  preVerificationGas: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  maxFeePerGas: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  maxPriorityFeePerGas: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  paymasterAndData: Hex;

  @IsNotEmpty()
  @IsHexadecimalString()
  signature: Hex;
}

export class SendUserOperationParamsDto {
  @IsNotEmpty()
  @IsSendUserOpParams()
  params: [UserOperationDto, Hex];
}
