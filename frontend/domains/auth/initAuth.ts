"use client";

import { supabase } from "@/shared/supabase-client";
import type { Session } from "@supabase/supabase-js";

/**
 * Блокирующая инициализация auth при старте приложения.
 * Вызывается один раз в корне (AuthProvider) перед рендером контента.
 * Пока initAuth() не выполнен — запросы к backend не делаем.
 */
export async function initAuth(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}
