import {
  registerDecorator,
  ValidationOptions,
  validateOrReject,
} from '@nestjs/class-validator';
import { UserOperationDto } from '../user-operation/dto/user-operation.dto';
import { Hex } from 'viem';
import { plainToInstance } from 'class-transformer';
import { addressRegex } from 'src/regex';

export function IsSendUserOpParams(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
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

          return (
            typeof entryPoint === 'string' && addressRegex.test(entryPoint)
          );
        },
        defaultMessage() {
          return 'params must be an array containing a valid UserOperation object and an EntryPoint address';
        },
      },
    });
  };
}
