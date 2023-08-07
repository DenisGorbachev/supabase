/* eslint-disable @typescript-eslint/no-explicit-any */
import { createClient, SupabaseClient, SupabaseClientOptions } from '@supabase/supabase-js'
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

export async function sb<T>(supabaseResult: Promise<{ data: T | null; error: Error | null }>): Promise<T> {
  const { data, error } = await supabaseResult
  if (error) throw error
  if (data === null) throw new Error('Supabase: data is null') // should never happen according to Supabase function definitions
  return data
}

export interface SupabaseError {
  message: string
  status: number
}

export function isSupabaseError(error: unknown): error is SupabaseError {
  const $error = error as SupabaseError
  return typeof $error === 'object' && typeof $error.message === 'string' && typeof $error.status === 'number'
}
