import { FileOptions } from '@supabase/storage-js'
import StorageFileApi from '@supabase/storage-js/dist/module/packages/StorageFileApi'
import { SupabaseClient } from '@supabase/supabase-js'
import { Write } from '../../utils/cache/Write'
import { Mapper } from '../../utils/Mapper'
import { ToString } from '../../utils/string'
import { getSupabasePrivate, sb } from '../init'

const defaultFileOptions: FileOptions = { upsert: true }

export const setDataV1Gen = (bucketId: string, folder: string) => async (path: string, data: unknown) => {
  const bucket = getSupabasePrivate().storage.from(bucketId)
  await sb(bucket.upload(`${folder}/${path}`, JSON.stringify(data), defaultFileOptions))
}

type Set<Out> = (path: string, data: unknown, options?: FileOptions) => Out

export const setV1 = (api: StorageFileApi, path: string, data: string, options: FileOptions = defaultFileOptions) => {
  return sb(api.upload(path, data, options))
}

export const setV1WithApi = (api: StorageFileApi) => (path: string, data: string, options: FileOptions = defaultFileOptions) => {
  return setV1(api, path, data, options)
}

// export const setV1WithApi = (api: StorageFileApi) => (path: string, data: string, options: FileOptions = defaultFileOptions) => setV1()

// export const setVia = (api: StorageFileApi) => async (path: string, data: unknown, options: FileOptions = defaultFileOptions) => set(path, data, options)(api)

export const withFolder = (folder: string) => <Out>(set: Set<Out>) => (path: string, data: string, options?: FileOptions) => set(`${folder}/${path}`, data, options)

export const viaFileStorageApiFromSupabase = <Out>(fn: Mapper<StorageFileApi, Out>) => (bucketId: string) => (client: SupabaseClient) => fn(client.storage.from(bucketId))

export const getBucket = (bucketId: string) => (client: SupabaseClient) => client.storage.from(bucketId)

export const getWrite = <Key, Data>(api: StorageFileApi, toStringKey: ToString<Key>, toStringData: ToString<Data>, options: FileOptions = defaultFileOptions): Write<Key, Data> => {
  return (key: Key) => async (data: Data) => {
    await setV1(api, toStringKey(key), toStringData(data), options)
  }
}

// export const getWriteToFolder = <Key, Data>(api: StorageFileApi, folder: string, toStringData: ToString<Data>, options: FileOptions = defaultFileOptions): Write<Key, Data> => {
