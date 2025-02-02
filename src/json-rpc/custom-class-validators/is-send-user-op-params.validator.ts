import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  validateOrReject,
} from '@nestjs/class-validator';
import { UserOperationDto } from '../user-operation/dto/user-operation.dto';
import { Hex } from 'viem';
import { plainToInstance } from 'class-transformer';

@ValidatorConstraint({ name: 'isSendUserOpParams', async: true })
export class IsSendUserOpParamsConstraint
  implements ValidatorConstraintInterface
{
  async validate(value: any) {
    if (!Array.isArray(value) || value.length !== 2) {
      return false;
    }

    const [userOp, entryPoint] = value as [UserOperationDto, Hex];

    try {
      await validateOrReject(plainToInstance(UserOperationDto, userOp));
    } catch {
      return false;
    }

    const addressRegex = /^0x[a-fA-F0-9]{40}$/;
    return typeof entryPoint === 'string' && addressRegex.test(entryPoint);
  }

  defaultMessage() {
    return 'params must be an array containing a valid UserOperation object and an EntryPoint address';
  }
}

export function IsSendUserOpParams(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsSendUserOpParamsConstraint,
    });
  };
}
