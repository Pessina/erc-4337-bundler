import { registerDecorator, ValidationOptions } from '@nestjs/class-validator';
import { UserOperationDto } from '../json-rpc/user-operation/dto/user-operation.dto';
import { Hex } from 'viem';
import { addressRegex } from 'src/regex';
import { assertSchema } from 'src/utils';

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

          console.log('1');

          const [userOp, entryPoint] = value as [UserOperationDto, Hex];

          console.log('2');

          try {
            await assertSchema(UserOperationDto, userOp);
          } catch {
            console.log('3');
            return false;
          }

          console.log('4');

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
