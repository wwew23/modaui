import {
  ValidationPipeline,
  ValidationContext,
  ValidationResult,
  Validator,
  ValidationError
} from './validation';

export class DefaultValidationPipeline implements ValidationPipeline {
  private validators: Validator[];

  constructor(validators: Validator[]) {
    this.validators = validators;
  }

  async validate(ctx: ValidationContext): Promise<ValidationResult> {
    const allErrors: ValidationError[] = [];

    for (const v of this.validators) {
      try {
        const res = await v.validate(ctx);
        if (!res.valid) {
          allErrors.push(
            ...res.errors.map(e => ({
              ...e,
              code: `${v.name}:${e.code}`
            }))
          );
        }
      } catch (err: any) {
        allErrors.push({
          code: `${v.name}:runtime_error`,
          message: err.message,
          scope: 'system'
        });
      }
    }

    return {
      valid: allErrors.length === 0,
      errors: allErrors
    };
  }
}
