declare module '@/api/mockApi' {
  interface ApiResponse<T = any> {
    success: boolean;
    message?: string;
    data?: T;
    count?: number;
  }

  interface FriendLink {
    id: number;
    name: string;
    description: string;
    url: string;
    avatar: string;
    cover: string;
    category: string;
    status: 'approved' | 'pending';
    createdAt: string;
  }

  const mockApi: {
    fetchPendingFriendLinksCount: () => Promise<ApiResponse<void>>;
    fetchAllFriendLinks: () => Promise<ApiResponse<FriendLink[]>>;
    fetchPendingFriendLinks: () => Promise<ApiResponse<FriendLink[]>>;
    approveFriendLink: (id: number) => Promise<ApiResponse<void>>;
    rejectFriendLink: (id: number, reason: string) => Promise<ApiResponse<void>>;
  };

  export default mockApi;
} 