import { getAuthHeaders } from '../utils/auth';
import { config } from '../config/index'

// 弹幕数据模型，与数据库结构对应
export interface BulletChat {
  bulletId: number
  content: string
  avatar?: string
  cratetime: Date | string
  status: 'APPROVED' | 'PENDING' | 'REJECTED'
}

// API基础URL
const API_BASE_URL = config.api.apiUrl;

// 获取所有活跃的弹幕
export const getActiveBulletChats = async (): Promise<BulletChat[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bullet-chats/status/APPROVED`);
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error('获取弹幕失败:', error);
    return [];
  }
}

// 添加新弹幕
export const addBulletChat = async (content: string, avatar?: string): Promise<{ success: boolean, data?: BulletChat, message?: string }> => {
  try {
    console.log('addBulletChat 函数被调用');
    
    // 构建弹幕数据
    const newBulletChat = {
      content,
      avatar: avatar || '/avatars/default.jpg',
      status: 'PENDING'
    };
    console.log('准备发送的弹幕数据:', newBulletChat);
    
    // 使用带有认证信息的请求头
    const headers = getAuthHeaders();
    console.log('请求头信息:', headers);
    
    console.log('发送请求到:', `${API_BASE_URL}/bullet-chats`);
    const response = await fetch(`${API_BASE_URL}/bullet-chats`, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(newBulletChat),
      credentials: 'include' // 确保发送cookie
    });
    
    console.log('收到响应:', response.status, response.statusText);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('API请求失败:', response.status, errorText);
      
      // 根据状态码返回不同的错误消息
      if (response.status === 401) {
        return { 
          success: false, 
          message: '您尚未登录或登录已过期，请重新登录' 
        };
      } else if (response.status === 403) {
        return { 
          success: false, 
          message: '您没有发送弹幕的权限' 
        };
      } else if (response.status === 429) {
        return { 
          success: false, 
          message: '发送频率过快，请稍后再试' 
        };
      }
      
      throw new Error(`API请求失败: ${response.status}, ${errorText}`);
    }
    
    const data = await response.json();
    console.log('解析后的响应数据:', data);
    
    return { 
      success: true,
      data: data.data
    };
  } catch (error) {
    console.error('添加弹幕失败，详细错误:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : '发送弹幕失败，请稍后再试'
    };
  }
}

// 更新弹幕状态
export const updateBulletChatStatus = async (id: number, status: 'APPROVED' | 'PENDING' | 'REJECTED'): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bullet-chats/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ status }),
      credentials: 'include' // 确保发送认证信息，需要管理员权限
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('更新弹幕状态失败:', error);
    return false;
  }
}

// 更新弹幕内容
export const updateBulletChat = async (id: number, data: Partial<BulletChat>): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bullet-chats/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data),
      credentials: 'include' // 确保发送认证信息，需要管理员权限
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('更新弹幕失败:', error);
    return false;
  }
}

// 删除弹幕
export const deleteBulletChat = async (id: number): Promise<boolean> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bullet-chats/${id}`, {
      method: 'DELETE',
      credentials: 'include' // 确保发送认证信息，需要管理员权限
    });
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    return true;
  } catch (error) {
    console.error('删除弹幕失败:', error);
    return false;
  }
}

// 根据ID获取弹幕
export const getBulletChatById = async (id: number): Promise<BulletChat | null> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bullet-chats/${id}`);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data;
  } catch (error) {
    console.error('获取弹幕详情失败:', error);
    return null;
  }
}

// 根据状态获取弹幕列表
export const getBulletChatsByStatus = async (status: 'APPROVED' | 'PENDING' | 'REJECTED'): Promise<BulletChat[]> => {
  try {
    const response = await fetch(`${API_BASE_URL}/bullet-chats/status/${status}`);
    
    if (!response.ok) {
      throw new Error(`API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.data || [];
  } catch (error) {
    console.error(`获取${status}状态弹幕失败:`, error);
    return [];
  }
} 