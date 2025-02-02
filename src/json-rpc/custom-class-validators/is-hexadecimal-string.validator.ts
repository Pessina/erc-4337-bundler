import {
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from '@nestjs/class-validator';
import { isHexadecimal } from '@nestjs/class-validator';

export function IsHexadecimalString(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'isHexadecimalString',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          if (typeof value !== 'string') return false;
          if (!value.startsWith('0x')) return false;

          const hexString = value.slice(2);

          if (hexString === '') return false;

          return isHexadecimal(hexString);
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property} must be a valid hexadecimal string`;
        },
      },
    });
  };
}
