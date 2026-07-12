import { apiClient } from '@services/api-client';
import { LoginResponseDto, CurrentUserResponseDto } from 'shared/dto';
import { LoginInput } from 'shared/schemas';

export const authApi = {
  login: async (data: LoginInput): Promise<LoginResponseDto> => {
    const res = await apiClient.post<{ success: boolean; data: LoginResponseDto }>('/auth/login', data);
    return res.data.data;
  },
  logout: async (): Promise<void> => {
    await apiClient.post('/auth/logout');
  },
  getMe: async (): Promise<CurrentUserResponseDto> => {
    const res = await apiClient.get<{ success: boolean; data: CurrentUserResponseDto }>('/auth/me');
    return res.data.data;
  },
};
