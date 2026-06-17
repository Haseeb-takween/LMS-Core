const env = {
  NODE_ENV: process.env.NODE_ENV ?? "development",
  PORT: Number(process.env.PORT) || 5000,
  HOST: process.env.HOST ?? "localhost",
} as const;

export default env;
