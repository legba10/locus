'use client'

import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query'
import { apiFetchJson } from '@/shared/api/client'

export function useFetch<TData>(
  queryKey: QueryKey,
  path: string,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData>({
    queryKey,
    queryFn: () => apiFetchJson<TData>(path),
    ...options,
  })
}

