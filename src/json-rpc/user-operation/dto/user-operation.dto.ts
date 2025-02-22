import { IsNotEmpty, Matches } from '@nestjs/class-validator';
import { IsSendUserOpParams } from '../../../custom-class-validators/is-send-user-op-params.validator';
import { hexStringRegex } from '../../../regex';
import { Hex } from 'viem';

// @IsHexadecimal() from class-validator is not working, I believe it's because of the starting 0x on the input
export class UserOperationDto {
  @IsNotEmpty()
  @Matches(hexStringRegex)
  sender: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  nonce: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  initCode: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  callData: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  callGasLimit: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  verificationGasLimit: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  preVerificationGas: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  maxFeePerGas: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  maxPriorityFeePerGas: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  paymasterAndData: Hex;

  @IsNotEmpty()
  @Matches(hexStringRegex)
  signature: Hex;
}

export class SendUserOperationParamsDto {
  @IsNotEmpty()
  @IsSendUserOpParams({
    message:
      'Invalid params, must be an array containing a valid UserOperation object and an EntryPoint address',
  })
  params: [UserOperationDto, Hex];
}
