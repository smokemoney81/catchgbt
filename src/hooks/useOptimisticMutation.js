import { useCallback, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

/**
 * useOptimisticMutation - Standardized optimistic UI pattern
 * 
 * Provides consistent optimistic updates across data-changing operations.
 * Immediately updates UI, reverts on error.
 * 
 * Usage:
 *   const { mutate, isPending } = useOptimisticMutation({
 *     mutationFn: (data) => api.updateSpot(data),
 *     queryKey: ['spots'],
 *     onOptimisticUpdate: (data, prevData) => ({ ...prevData, ...data }),
 *     onSuccess: () => toast.success('Updated'),
 *     onError: (error) => toast.error(error.message)
 *   });
 */
export function useOptimisticMutation({
  mutationFn,
  queryKey,
  onOptimisticUpdate,
  onSuccess,
  onError,
  successMessage = null,
  errorMessage = 'Operation failed'
}) {
  const queryClient = useQueryClient();
  const previousDataRef = useRef(null);
  const isPendingRef = useRef(false);

  const mutate = useCallback(
    async (variables) => {
      isPendingRef.current = true;

      try {
        // Save previous state for rollback
        previousDataRef.current = queryClient.getQueryData(queryKey);

        // Update cache immediately (optimistic)
        if (onOptimisticUpdate && previousDataRef.current) {
          const optimisticData = onOptimisticUpdate(variables, previousDataRef.current);
          queryClient.setQueryData(queryKey, optimisticData);
        }

        // Execute mutation
        const result = await mutationFn(variables);

        // Invalidate to refetch latest from server
        await queryClient.invalidateQueries({ queryKey });

        if (successMessage) {
          toast.success(successMessage);
        }
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        // Rollback to previous state
        if (previousDataRef.current) {
          queryClient.setQueryData(queryKey, previousDataRef.current);
        }

        const message = error.message || errorMessage;
        toast.error(message);

        if (onError) {
          onError(error);
        }

        throw error;
      } finally {
        isPendingRef.current = false;
      }
    },
    [queryClient, queryKey, mutationFn, onOptimisticUpdate, onSuccess, onError, successMessage, errorMessage]
  );

  return {
    mutate,
    isPending: isPendingRef.current
  };
}

/**
 * useOptimisticArrayMutation - For array-based collections
 * 
 * Handles create/update/delete operations on arrays
 */
export function useOptimisticArrayMutation({
  mutationFn,
  queryKey,
  operation = 'update', // 'create', 'update', 'delete'
  idField = 'id',
  onSuccess,
  onError,
  successMessage = null,
  errorMessage = 'Operation failed'
}) {
  const queryClient = useQueryClient();
  const previousDataRef = useRef(null);
  const isPendingRef = useRef(false);

  const mutate = useCallback(
    async (variables) => {
      isPendingRef.current = true;

      try {
        previousDataRef.current = queryClient.getQueryData(queryKey);
        const items = previousDataRef.current || [];

        let optimisticData;

        if (operation === 'create') {
          optimisticData = [...items, { ...variables, [idField]: 'optimistic-' + Date.now() }];
        } else if (operation === 'update') {
          optimisticData = items.map(item =>
            item[idField] === variables[idField] ? { ...item, ...variables } : item
          );
        } else if (operation === 'delete') {
          optimisticData = items.filter(item => item[idField] !== variables[idField]);
        }

        queryClient.setQueryData(queryKey, optimisticData);

        const result = await mutationFn(variables);
        await queryClient.invalidateQueries({ queryKey });

        if (successMessage) {
          toast.success(successMessage);
        }
        if (onSuccess) {
          onSuccess(result);
        }

        return result;
      } catch (error) {
        if (previousDataRef.current) {
          queryClient.setQueryData(queryKey, previousDataRef.current);
        }

        const message = error.message || errorMessage;
        toast.error(message);

        if (onError) {
          onError(error);
        }

        throw error;
      } finally {
        isPendingRef.current = false;
      }
    },
    [queryClient, queryKey, mutationFn, operation, idField, onSuccess, onError, successMessage, errorMessage]
  );

  return {
    mutate,
    isPending: isPendingRef.current
  };
}