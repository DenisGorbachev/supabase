import { Cache } from '../utils/cache'
import { getSupabasePrivate, isSupabaseError, sb } from './init'

export async function setData(path: string, data: unknown) {
  const bucket = getSupabasePrivate().storage.from(cacheBucketId)
  await sb(bucket.upload(`${cacheFolder}/${path}`, JSON.stringify(data), { upsert: true }))
}

export async function getData(path: string): Promise<unknown | undefined> {
  try {
    const bucket = getSupabasePrivate().storage.from(cacheBucketId)
    const data = await sb(bucket.download(`${cacheFolder}/${path}`))
    return data ? JSON.parse(await data.text()) : undefined
  } catch (error) {
    if (isSupabaseError(error) && notFoundMessages.includes(error.message)) {
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

const notFoundMessages = ['The resource was not found', 'Object not found']
