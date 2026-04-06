import { privateClient } from "../apiClient";

export const dashboardService = {
    dashboardStats: () => privateClient.get('/dashboard/user/stats'),
}