import type { PlaywrightTestConfig } from '@playwright/test'

const config: PlaywrightTestConfig = {
  webServer: {
    command: 'npm run dev',
    port: 3000,
  },
  testDir: 'tests',
  testMatch: /(.+\.)?(test|spec)\.[jt]s/,
  timeout: 5000,
}

export default config
