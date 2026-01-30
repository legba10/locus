'use client'

import { useQuery, type UseQueryOptions, type QueryKey } from '@tanstack/react-query'
import { apiGet } from '@/shared/utils/api'

export function useFetch<TData>(
  queryKey: QueryKey,
  path: string,
  options?: Omit<UseQueryOptions<TData>, 'queryKey' | 'queryFn'>,
) {
  return useQuery<TData>({
    queryKey,
    queryFn: () => apiGet<TData>(path),
    ...options,
  })
}

