import axiosClient from './axiosClient';
import type {
  ApiKey,
  ApiKeyCreateRequest,
} from '../types/apiKey';

export const getApiKeys = () => {
  return axiosClient.get<ApiKey[]>('/api/api-keys');
};

export const createApiKey = (
  data: ApiKeyCreateRequest
) => {
  return axiosClient.post<ApiKey>(
    '/api/api-keys',
    data
  );
};

export const revokeApiKey = (id: number) => {
  return axiosClient.delete(
    `/api/api-keys/${id}`
  );
};