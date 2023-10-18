/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, PostgrestError, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js'
import { GenericSchema } from '@supabase/supabase-js/src/lib/types'

let supabasePublic: SupabaseClient
let supabasePrivate: SupabaseClient

export const getSupabasePublic = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('process.env.NEXT_PUBLIC_SUPABASE_URL is required')
  if (!process.env.NEXT_PUBLIC_SUPABASE_KEY) throw new Error('process.env.NEXT_PUBLIC_SUPABASE_KEY is required')
  return supabasePublic || (supabasePublic = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_KEY))
}

export const getSupabasePrivate = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) throw new Error('process.env.NEXT_PUBLIC_SUPABASE_URL is required')
  if (!process.env.NEXT_PRIVATE_SUPABASE_KEY) throw new Error('process.env.NEXT_PRIVATE_SUPABASE_KEY is required')
  return supabasePrivate || (supabasePrivate = createSupabase(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PRIVATE_SUPABASE_KEY, {
    auth: {
      persistSession: false,
    },
  }))
}

export const createSupabase = <
  Database = any,
  SchemaName extends string & keyof Database = 'public' extends keyof Database
    ? 'public'
    : string & keyof Database,
  Schema extends GenericSchema = Database[SchemaName] extends GenericSchema
    ? Database[SchemaName]
    : any
>(supabaseUrl: string, supabaseKey: string, options?: SupabaseClientOptions<SchemaName>): SupabaseClient<Database, SchemaName, Schema> => {
  if (!supabaseUrl) throw new Error('supabaseUrl is required')
  if (!supabaseKey) throw new Error('supabaseKey is required')
  return createClient(supabaseUrl, supabaseKey, options)
}

/**
 * `data` may be null (example: the system sends a Postgres query with maybeSingle() modifier, the server returns an empty array, the system returns null)
 */
export async function sb<T, E>(supabaseResult: Promise<{ data: T | null; error: E | null }>): Promise<T | null> {
  const { data, error } = await supabaseResult
  if (error) throw error
  return data
}

export async function sbe<T, E>(supabaseResult: Promise<{ data: T | null; error: E | null }>): Promise<T> {
  const data = await sb(supabaseResult)
  if (data === null) throw new Error('Supabase: data is null')
  return data
}

export type DbResult<T> = T extends PromiseLike<infer U> ? U : never

export type DbResultOk<T> = T extends PromiseLike<{ data: infer U }> ? Exclude<U, null> : never

export type DbResultErr = PostgrestError

export interface SupabaseError {
  message: string
  status: number
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  const $error = error as SupabaseError
  return typeof $error === 'object' && typeof $error.message === 'string' && typeof $error.status === 'number'
}
