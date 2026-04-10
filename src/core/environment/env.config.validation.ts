import * as Joi from 'joi';
import type { EnvConfig } from './env.config.interface';

export const validationSchema: Joi.ObjectSchema<EnvConfig> = Joi.object({
  DATABASE_URL: Joi.string().required(),
  NODE_ENV: Joi.string()
    .valid('development', 'test', 'production')
    .default('development')
    .required(),
  PORT: Joi.number().port().required(),
  SWAGGER_ENABLED: Joi.boolean().required(),
});
