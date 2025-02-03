import { registerDecorator, ValidationOptions } from '@nestjs/class-validator';
import { isObject, isArray } from 'lodash';

export function IsJsonValid(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
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
        },
        defaultMessage() {
          return 'params must be a valid JSON structure';
        },
      },
    });
  };
}
