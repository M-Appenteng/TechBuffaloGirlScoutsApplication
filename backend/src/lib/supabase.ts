import { createAdminClient, createContextClient } from '@supabase/server/core';

// No generated types for this schema yet, so use `any` rows like the previous plain supabase-js client did.

// Bypasses RLS — used for lookups/writes the backend itself needs to perform.
export const adminClient = createAdminClient<any>();

// Publishable-key client with no user token — used only to call auth methods
// like signInWithPassword that don't require an existing session.
export const anonClient = createContextClient<any>();
