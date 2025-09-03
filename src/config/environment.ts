import { z } from 'zod';

const EnvironmentConfigSchema = z.object({
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  PORT: z.coerce.number().min(1).max(65535).default(3000),

  // Database
  DATABASE_URL: z
    .string()
    .url()
    .default(
      'postgresql://postgres:postgres@localhost:5433/gateway_management'
    ),

  // Logging
  LOG_LEVEL: z
    .enum(['error', 'warn', 'info', 'http', 'verbose', 'debug', 'silly'])
    .default('info'),

  MAX_DEVICES_PER_GATEWAY: z.coerce.number().min(1).default(10),
  // CORS
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
});

type TEnvironmentConfig = z.infer<typeof EnvironmentConfigSchema> & {
  isProduction: boolean;
  getMaxDevicesPerGateway: number;
};

const environmentConfig = EnvironmentConfigSchema.parse(process.env);

export const env: TEnvironmentConfig = {
  ...environmentConfig,
  get isProduction(): boolean {
    return this.NODE_ENV === 'production';
  },
  get getMaxDevicesPerGateway(): number {
    return this.MAX_DEVICES_PER_GATEWAY;
  },
} as const;

export type Config = typeof env;
