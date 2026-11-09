import { readFile, writeFile } from 'node:fs/promises';

for (const key of ['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID', 'CF_D1_DATABASE_ID']) {
  if (!process.env[key]) throw new Error(`Missing ${key}; configure the selected Cloudflare account before publishing.`);
}
const id = process.env.CF_D1_DATABASE_ID;
if (!/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/i.test(id)
    || id === '00000000-0000-0000-0000-000000000000') {
  throw new Error('CF_D1_DATABASE_ID must identify the real tekin-store database.');
}
const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
config.d1_databases.find(db => db.binding === 'STORE').database_id = id;
await writeFile('wrangler.jsonc', JSON.stringify(config, null, 2) + '\n');
console.log('Configured STORE binding for the selected account.');
