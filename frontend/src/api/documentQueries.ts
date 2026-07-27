import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from './axios';
import type { DocumentResponse } from '../types';

export const useDocuments = (ownerType: string, ownerId: string) => {
    return useQuery({
        queryKey: ['documents', ownerType, ownerId],
        queryFn: async () => {
            const { data } = await apiClient.get<DocumentResponse[]>(`/documents`, {
                params: { ownerType, ownerId }
            });
            return data;
        },
        enabled: !!ownerId && !!ownerType,
    });
};

interface UploadVariables {
    file: File;
    ownerType: string;
    ownerId: string;
    onProgress?: (progress: number) => void;
}

export const useUploadDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ file, ownerType, ownerId, onProgress }: UploadVariables) => {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('ownerType', ownerType);
            formData.append('ownerId', ownerId);

            const { data } = await apiClient.post<DocumentResponse>(`/documents/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    if (onProgress && progressEvent.total) {
                        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                        onProgress(percentCompleted);
                    }
                },
            });
            return data;
        },
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['documents', variables.ownerType, variables.ownerId] });
        },
    });
};

export const useDeleteDocument = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: async ({ documentId }: { documentId: string }) => {
            await apiClient.delete(`/documents/${documentId}`);
        },
        onSuccess: () => {
            // Invalidate all document queries to be safe, or we could pass owner info to be precise
            queryClient.invalidateQueries({ queryKey: ['documents'] });
        },
    });
};
