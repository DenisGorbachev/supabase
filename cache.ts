import { Cache } from '../utils/cache'
import { getSupabasePrivate, isSupabaseError, sb } from './init'

export async function setData<T>(path: string, data: T) {
  const bucket = getSupabasePrivate().storage.from(cacheBucketId)
  await sb(bucket.upload(`${cacheFolder}/${path}`, JSON.stringify(data), { upsert: true }))
}

export async function getData<T>(path: string): Promise<T | undefined> {
  try {
    const bucket = getSupabasePrivate().storage.from(cacheBucketId)
    const data = await sb(bucket.download(`${cacheFolder}/${path}`))
    return JSON.parse(await data.text())
  } catch (error) {
    if (isSupabaseError(error) && error.message === 'The resource was not found') {
      return undefined
    } else {
      throw error
    }
  }
}

export function getSupabaseCache(): Cache {
  return {
    get: getData,
    set: setData,
  }
}

const cacheBucketId = process.env.CACHE_BUCKET_ID ?? 'cache'

/**
 * We can't reuse the old cache after we deploy a new version of the project
 */
const cacheFolder = process.env.VERCEL_GIT_COMMIT_SHA ?? 'local'
