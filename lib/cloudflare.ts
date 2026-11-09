import { getCloudflareContext } from '@opennextjs/cloudflare';

export async function getCloudflareEnv(): Promise<CloudflareEnv | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env as CloudflareEnv;
  } catch {
    return null;
  }
}

export async function getSecret(name: 'ADMIN_PIN' | 'ADMIN_SESSION_SECRET') {
  const env = await getCloudflareEnv();
  const bindingValue = env?.[name];
  if (bindingValue) return bindingValue;
  return process.env[name];
}
