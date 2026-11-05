import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const diagnostics: Record<string, any> = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    redis: {
      UPSTASH_REDIS_REST_URL: process.env.UPSTASH_REDIS_REST_URL ? '✅ Set' : '❌ Not set',
      UPSTASH_REDIS_REST_TOKEN: process.env.UPSTASH_REDIS_REST_TOKEN ? '✅ Set' : '❌ Not set',
      KV_REST_API_URL: process.env.KV_REST_API_URL ? '✅ Set' : '❌ Not set',
      KV_REST_API_TOKEN: process.env.KV_REST_API_TOKEN ? '✅ Set' : '❌ Not set',
      STORAGE_REST_API_URL: process.env.STORAGE_REST_API_URL ? '✅ Set' : '❌ Not set',
      STORAGE_REST_API_TOKEN: process.env.STORAGE_REST_API_TOKEN ? '✅ Set' : '❌ Not set',
    },
    blob: {
      BLOB_READ_WRITE_TOKEN: process.env.BLOB_READ_WRITE_TOKEN ? '✅ Set' : '❌ Not set',
    },
    redisConnection: 'Not tested yet',
    redisReadWrite: 'Not tested yet',
  };

  // Test Redis connection
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN;

  if (url && token) {
    try {
      const { Redis } = require('@upstash/redis');
      const redis = new Redis({ url, token });
      
      // Test write
      await redis.set('_diagnostic_test', { test: true, time: Date.now() });
      diagnostics.redisConnection = '✅ Connected';
      
      // Test read
      const readBack = await redis.get('_diagnostic_test');
      diagnostics.redisReadWrite = readBack ? '✅ Read/Write OK' : '❌ Read failed';
      
      // Check if store data exists
      const storeData = await redis.get('vitrin_store_data');
      diagnostics.storeDataExists = storeData ? '✅ Store data found' : '❌ No store data in Redis';
      if (storeData) {
        const parsed = typeof storeData === 'string' ? JSON.parse(storeData) : storeData;
        diagnostics.productCount = parsed?.products?.length || 0;
        diagnostics.dataSize = JSON.stringify(storeData).length + ' bytes';
      }

      // Cleanup
      await redis.del('_diagnostic_test');
    } catch (err) {
      diagnostics.redisConnection = '❌ Error: ' + (err as Error).message;
    }
  } else {
    diagnostics.redisConnection = '❌ No Redis URL/Token found in environment';
  }

  return NextResponse.json(diagnostics, {
    headers: {
      'Cache-Control': 'no-store',
    },
  });
}
