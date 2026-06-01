import { ThemeRuntime } from './types';
import { RuntimePatch } from './patch';

export type ValidationError = {
  code: string;
  message: string;
  path?: string; // 相关字段路径
  scope?: string; // 'schema' | 'tokens' | 'layout' | ...
};

export type ValidationResult = {
  valid: boolean;
  errors: ValidationError[];
};

export type ValidationContext = {
  stateBefore: ThemeRuntime;
  stateAfter: ThemeRuntime;
  patches: RuntimePatch[];
};

/**
 * 单个验证器接口
 */
export interface Validator {
  name: string;
  validate(ctx: ValidationContext): Promise<ValidationResult>;
}

/**
 * 验证管线接口
 */
export interface ValidationPipeline {
  validate(ctx: ValidationContext): Promise<ValidationResult>;
}
