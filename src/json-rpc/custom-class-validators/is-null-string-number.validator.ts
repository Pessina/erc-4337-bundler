import {
  registerDecorator,
  ValidationOptions,
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from '@nestjs/class-validator';

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
