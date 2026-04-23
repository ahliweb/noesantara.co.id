// @ts-check
import { defineConfig, envField } from 'astro/config';

// https://astro.build/config
export default defineConfig({
  site: 'https://noesantara.co.id',
  env: {
    schema: {
      PUBLIC_CONTACT_API_URL: envField.string({
        context: 'client',
        access: 'public',
        default: 'https://api.noesantara.co.id/api/contact',
      }),
    },
  },
});
