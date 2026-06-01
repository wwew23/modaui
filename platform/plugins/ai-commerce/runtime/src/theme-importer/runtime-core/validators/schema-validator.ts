import {
  Validator,
  ValidationContext,
  ValidationResult,
  ValidationError
} from '../validation';

export class SchemaValidator implements Validator {
  name = 'SchemaValidator';

  constructor(
    private themeSchema: any // 这里可以是 Shopify 的 schema 定义集合
  ) {}

  async validate(ctx: ValidationContext): Promise<ValidationResult> {
    const errors: ValidationError[] = [];

    // 示例逻辑：检查 Patch 路径是否合法
    for (const patch of ctx.patches) {
      if (patch.path.startsWith('/pages/') && patch.op === 'add') {
        const parts = patch.path.split('/');
        // 简单模拟：如果添加的是 section，检查 type 是否存在
        if (parts.length === 4 && parts[2] === 'sections' && patch.value?.type) {
          const sectionType = patch.value.type;
          // 这里可以对接真实的 schema 检查
          if (sectionType === 'invalid-type') {
            errors.push({
              code: 'invalid_section_type',
              message: `Section type "${sectionType}" is not supported by the theme.`,
              path: patch.path,
              scope: 'schema'
            });
          }
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}
