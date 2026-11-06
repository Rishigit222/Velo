"use client";

import { useState, useCallback } from "react";
import { ApiError } from "@/lib/apiClient";

interface UseApiState<T> {
  data: T | null;
  error: string | null;
  isLoading: boolean;
}

export function useApi<T, Args extends unknown[]>(
  apiFunction: (...args: Args) => Promise<T>
) {
  const [state, setState] = useState<UseApiState<T>>({
    data: null,
    error: null,
    isLoading: false,
  });

  const execute = useCallback(
    async (...args: Args): Promise<T | null> => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await apiFunction(...args);
        setState({ data: result, error: null, isLoading: false });
        return result;
      } catch (err) {
        const errorMsg =
          err instanceof ApiError
            ? err.message
            : err instanceof Error
            ? err.message
            : "An unexpected error occurred";
        setState({ data: null, error: errorMsg, isLoading: false });
        return null;
      }
    },
    [apiFunction]
  );

  return {
    ...state,
    execute,
    reset: () => setState({ data: null, error: null, isLoading: false }),
  };
}

