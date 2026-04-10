export interface EnvConfig {
  DATABASE_URL: string;
  NODE_ENV: 'development' | 'test' | 'production';
  PORT: number;
  SWAGGER_ENABLED: boolean;
}
