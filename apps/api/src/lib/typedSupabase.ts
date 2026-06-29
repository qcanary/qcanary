/**
 * Typed Supabase Helper
 *
 * Thin typed wrappers around supabase insert/update/rpc operations.
 *
 * NOTE: supabase-js v2.105.3 (postgrest-js) has a generic constraint
 * (`Schema extends GenericSchema`) that fails to resolve for custom
 * Database types (even with `Relationships: []`). This causes
 * `Relation$1['Insert']` / `Relation$1['Update']` to resolve to `never`,
 * and the `RejectExcessProperties` wrapper rejects every value.
 *
 * The workaround: cast through `never` internally in these wrappers.
 * This is ISOLATED to this file — application code uses the typed
 * wrappers and gets full type safety at the call site without
 * scattering `as never` throughout the codebase.
 *
 * See: https://github.com/supabase/postgrest-js/issues/612
 */

import { supabase } from './supabase';
import type { Database } from '../types/database';

type Tables = Database['public']['Tables'];

/**
 * Insert a single row into a table with full type checking at the call site.
 */
export function insertRow<T extends keyof Tables>(
  table: T,
  data: Tables[T]['Insert']
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return supabase.from(table).insert(data as never);
}

/**
 * Insert multiple rows into a table with full type checking at the call site.
 */
export function insertRows<T extends keyof Tables>(
  table: T,
  data: Tables[T]['Insert'][]
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return supabase.from(table).insert(data as never);
}

/**
 * Update rows in a table with full type checking at the call site.
 */
export function updateRows<T extends keyof Tables>(
  table: T,
  data: Tables[T]['Update']
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return supabase.from(table).update(data as never);
}

/**
 * Call a Supabase RPC function with proper args typing.
 */
export function callRpc<Fn extends keyof Database['public']['Functions']>(
  fn: Fn,
  args: Database['public']['Functions'][Fn]['Args']
) {
  // eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
  return supabase.rpc(fn, args as never);
}
