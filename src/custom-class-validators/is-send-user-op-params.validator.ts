import {
  registerDecorator,
  validateSync,
  ValidationOptions,
} from '@nestjs/class-validator';
import { UserOperationDto } from '../json-rpc/user-operation/dto/user-operation.dto';
import { Hex } from 'viem';
import { addressRegex } from '../regex';
import { plainToInstance } from 'class-transformer';

export function IsSendUserOpParams(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          if (!Array.isArray(value) || value.length !== 2) {
            return false;
          }

          const [userOp, entryPoint] = value as [UserOperationDto, Hex];

          try {
            const instance = plainToInstance(UserOperationDto, userOp);
            validateSync(instance);
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
