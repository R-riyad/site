// Real Worker + isolated local D1/R2. No Cloudflare account or production writes.
import assert from 'node:assert/strict';
import { spawn, execFileSync } from 'node:child_process';
import { mkdtemp, readFile, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join } from 'node:path';
import { randomBytes } from 'node:crypto';
import { setTimeout as pause } from 'node:timers/promises';

const root = process.cwd();
const temp = await mkdtemp(join(tmpdir(), 'tekin-worker-smoke-'));
const wrangler = resolve('node_modules/wrangler/bin/wrangler.js');
const config = JSON.parse(await readFile('wrangler.jsonc', 'utf8'));
config.name = 'tekin-smoke';
config.main = resolve(config.main);
config.assets.directory = resolve(config.assets.directory);
config.d1_databases[0].migrations_dir = resolve('migrations');
config.services = [{ binding: 'WORKER_SELF_REFERENCE', service: config.name }];
const pin = randomBytes(16).toString('hex');
const secret = randomBytes(32).toString('hex');
config.vars = { ADMIN_PIN: pin, ADMIN_SESSION_SECRET: secret };
const configPath = join(temp, 'wrangler.json');
await writeFile(configPath, JSON.stringify(config));
const common = ['--config', configPath, '--persist-to', join(temp, 'state')];
const env = { ...process.env, WRANGLER_SEND_METRICS: 'false', CLOUDFLARE_LOAD_DEV_VARS_FROM_DOT_ENV: 'false' };
delete env.CLOUDFLARE_API_TOKEN;
delete env.CLOUDFLARE_ACCOUNT_ID;
execFileSync(process.execPath, [wrangler, 'd1', 'migrations', 'apply', 'STORE', '--local', '--yes', ...common], { cwd: root, env, stdio: 'pipe' });

let child;
let logs = '';
let base;
function safeLogs() { return logs.replaceAll(pin, '[test credential]').replaceAll(secret, '[test credential]').slice(-9000); }
async function start() {
  logs = '';
  child = spawn(process.execPath, [wrangler, 'dev', '--local', '--ip', '127.0.0.1', '--port', '0', ...common], { cwd: root, env, stdio: ['ignore', 'pipe', 'pipe'] });
  for (const pipe of [child.stdout, child.stderr]) pipe.on('data', data => { logs += data.toString(); });
  for (let i = 0; i < 180; i++) {
    if (child.exitCode !== null) throw new Error(`Worker exited: ${safeLogs()}`);
    const match = logs.match(/Ready on (http:\/\/127\.0\.0\.1:\d+)/);
    if (match) { base = match[1]; return; }
    await pause(250);
  }
  throw new Error(`Worker readiness timed out: ${safeLogs()}`);
}
async function stop() {
  if (!child || child.exitCode !== null) return;
  if (process.platform === 'win32') {
    try { execFileSync('taskkill', ['/PID', String(child.pid), '/T', '/F'], { stdio: 'ignore' }); } catch {}
  } else {
    child.kill('SIGTERM');
  }
  for (let i = 0; i < 40 && child.exitCode === null; i++) await pause(100);
  if (child.exitCode === null) child.kill('SIGKILL');
}
async function request(path, options = {}) {
  return fetch(base + path, { ...options, signal: AbortSignal.timeout(20000) });
}
const json = value => ({ 'Content-Type': 'application/json', ...value });
let cookie;
async function product(body) {
  return request('/api/products', { method: 'POST', headers: json({ Cookie: cookie }), body: JSON.stringify(body) });
}
try {
  await start();
  assert.equal((await request('/')).status, 200);
  assert.equal((await request('/admin')).status, 200);
  assert.equal((await (await request('/api/admin/session')).json()).authenticated, false);
  for (const path of ['/api/products', '/api/upload']) {
    assert.equal((await request(path, { method: 'POST' })).status, 401);
  }
  assert.equal((await request('/api/products?id=unknown', { method: 'DELETE' })).status, 401);
  let response = await request('/api/admin/login', { method: 'POST', headers: json(), body: JSON.stringify({ pin: 'wrong' }) });
  assert.equal(response.status, 401);
  response = await request('/api/admin/login', { method: 'POST', headers: json(), body: JSON.stringify({ pin }) });
  assert.equal(response.status, 200);
  cookie = response.headers.get('set-cookie').split(';')[0];
  assert.equal((await (await request('/api/admin/session', { headers: { Cookie: cookie } })).json()).authenticated, true);

  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+jRZkAAAAASUVORK5CYII=', 'base64');
  const form = new FormData();
  form.set('file', new File([png], 'test.png', { type: 'image/png' }));
  response = await request('/api/upload', { method: 'POST', headers: { Cookie: cookie }, body: form });
  assert.equal(response.status, 200);
  const upload = await response.json();
  assert.equal(upload.type, 'r2');
  assert.deepEqual(Buffer.from(await (await request(upload.url)).arrayBuffer()), png);

  const fixture = { id: 'isolated-smoke-product', name: 'Smoke product', description: 'Local test only', category: 'saat', price: 100, inStock: true, image: upload.url };
  assert.equal((await product({ product: fixture })).status, 200);
  assert.equal((await product({ product: { ...fixture, price: 125, inStock: false } })).status, 200);
  assert.equal((await product({ type: 'sync_all', data: { products: [] } })).status, 400);
  await stop();
  await start();
  const catalogResponse = await request('/api/products');
  assert.equal(catalogResponse.status, 200);
  assert.match(catalogResponse.headers.get('cache-control'), /no-store/);
  const saved = (await catalogResponse.json()).products.find(p => p.id === fixture.id);
  assert.equal(saved.price, 125);
  assert.equal(saved.inStock, false);
  assert.equal(saved.image, upload.url);
  assert.deepEqual(Buffer.from(await (await request(upload.url)).arrayBuffer()), png);
  assert.equal((await request('/api/products?id=' + fixture.id, { method: 'DELETE', headers: { Cookie: cookie } })).status, 200);
  assert.equal((await (await request('/api/products')).json()).products.some(p => p.id === fixture.id), false);
  response = await request('/api/admin/logout', { method: 'POST', headers: { Cookie: cookie } });
  assert.match(response.headers.get('set-cookie'), /Max-Age=0/i);
  console.log('PASS: storefront/admin, protected writes, login, R2 image upload/read, product create/update/delete, stock/price/image persistence after Worker restart, invalid backup rejection, logout.');
} catch (error) {
  console.error(safeLogs());
  throw error;
} finally {
  await stop();
}
