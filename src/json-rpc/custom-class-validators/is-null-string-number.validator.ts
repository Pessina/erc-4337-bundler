import { registerDecorator, ValidationOptions } from '@nestjs/class-validator';

export function IsNullStringNumber(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: {
        validate(value: any) {
          return (
            value === null ||
            typeof value === 'string' ||
            typeof value === 'number'
          );
        },
        defaultMessage() {
          return 'value must be null, string, or number';
        },
      },
    });
  };
}
