import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
} from '@nestjs/class-validator';
import { isObject, isArray } from 'lodash';

@ValidatorConstraint({ name: 'isJsonValid', async: false })
export class IsJsonValidConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    try {
      if (isObject(value) || isArray(value)) {
        JSON.parse(JSON.stringify(value));
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }

  defaultMessage() {
    return 'params must be a valid JSON structure';
  }
}

export function IsJsonValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsJsonValidConstraint,
    });
  };
}

@ValidatorConstraint({ name: 'isNullStringNumber', async: false })
export class IsNullStringNumberConstraint
  implements ValidatorConstraintInterface
{
  validate(value: any) {
    return (
      value === null || typeof value === 'string' || typeof value === 'number'
    );
  }

  defaultMessage() {
    return 'value must be null, string, or number';
  }
}

export function IsNullStringNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsNullStringNumberConstraint,
    });
  };
}
