import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    testTimeout: 30000,
    env: {
      MONGO_URI: 'mongodb://127.0.0.1:27017/taskflow_test',
      NODE_ENV: 'test',
    },
  },
});