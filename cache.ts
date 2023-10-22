import { CacheU } from '../utils/cache'
import { setDataV1Gen } from './cache/set'
import { getSupabasePrivate, isSupabaseError, sb } from './init'

const cacheBucketId = process.env.CACHE_BUCKET_ID ?? 'cache'

/**
 * We can't reuse the old cache after we deploy a new version of the project
 */
const cacheFolder = process.env.VERCEL_GIT_COMMIT_SHA ?? 'local'

const notFoundMessages = ['The resource was not found', 'Object not found']

export const getDataV1 = async (path: string): Promise<unknown | undefined> => {
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

export function getSupabaseCache(): CacheU {
  return {
    get: getDataV1,
    set: setDataV1Gen(cacheBucketId, cacheFolder),
  }
}
