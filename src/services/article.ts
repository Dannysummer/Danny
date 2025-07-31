import { type Article as BaseArticle } from '../data/articles';
import { config } from '../config/index';

// 扩展文章类型定义
export interface Article extends BaseArticle {
  excerpt?: string;
  categoryId?: number;
  status: 'draft' | 'published' | 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  coverImage: string;
  publishDate: string;
  slug?: string;
  allowComments: boolean;
  sticky: boolean;
  comments: number;
  pageBreaks?: number[];
}

// 获取已发布文章详情
export async function getPublishedArticleById(id: number): Promise<Article | null> {
  try {
    console.log(`尝试从 API 获取文章详情 ${id}...`);
    
    // 使用新的文章详情接口
    const API_BASE_URL = config.api.apiUrl;
    const response = await fetch(`${API_BASE_URL}/article/details/${id}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      
      if (result.success && result.data) {
        const apiArticle = result.data;
        
        // 检查文章状态（已发布文章才能通过此接口获取）
        if (apiArticle.status === 'PUBLISHED') {
          console.log('从 API 获取到已发布文章:', apiArticle.title);
          
          // 转换 API 数据格式为前端期望的格式
          const article: Article = {
            ...apiArticle,
            // 确保时间字段格式正确
            createTime: apiArticle.createdAt || apiArticle.createTime || new Date().toISOString(),
            updateTime: apiArticle.updatedAt || apiArticle.updateTime || apiArticle.createdAt || new Date().toISOString(),
            // 确保数值字段
            views: apiArticle.views || 0,
            id: apiArticle.id,
            title: apiArticle.title,
            content: apiArticle.content || '', // 新API直接返回完整内容
            author: apiArticle.author || '未知作者',
            // 处理封面字段
            cover: apiArticle.cover || '',
            coverImage: apiArticle.cover || '',
            // 处理分类字段
            category: apiArticle.category || '未分类',
                         // 处理标签字段 - 后端返回逗号分隔的字符串
             tags: typeof apiArticle.tags === 'string' 
               ? apiArticle.tags.split(',').filter((tag: string) => tag.trim())
               : (apiArticle.tags || []),
            // 处理描述字段
            description: apiArticle.description || '',
            excerpt: apiArticle.description || '',
            // 处理状态字段
            status: 'published' as const,
            // 处理许可证字段
            license: apiArticle.license || 'CC_BY_SA_4_0',
            // 处理发布日期
            publishDate: apiArticle.createdAt || apiArticle.createTime || new Date().toISOString(),
            // 默认字段
            allowComments: apiArticle.allowComments ?? true,
            sticky: apiArticle.sticky || false,
            comments: apiArticle.comments || apiArticle.commentCount || 0,
            pageBreaks: apiArticle.pageBreaks || []
          };
          
          console.log('文章详情加载成功，访问量:', article.views);
          return article;
        } else {
          console.warn(`文章 ${id} 状态为 ${apiArticle.status}，不是已发布状态`);
        }
      }
    } else if (response.status === 404) {
      console.warn(`文章 ${id} 不存在`);
    } else if (response.status === 403) {
      console.warn(`文章 ${id} 无权限访问（可能是草稿）`);
    } else {
      console.warn(`获取文章详情失败: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('API 请求失败:', error);
  }
  
  console.error(`未找到文章 ${id} 或文章未发布`);
  return null;
}

// 获取所有已发布文章列表（用于将来扩展）
export async function getPublishedArticles(page = 1, limit = 10): Promise<{ articles: Article[]; total: number }> {
  try {
    // 使用新的兼容性接口
    const API_BASE_URL = config.api.apiUrl;
    const response = await fetch(`${API_BASE_URL}/articles?page=${page}&limit=${limit}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        // 处理返回的数据格式
        const articles = (result.data.content || []).map((apiArticle: any) => ({
          ...apiArticle,
          createTime: apiArticle.createdAt || apiArticle.createTime || new Date().toISOString(),
          updateTime: apiArticle.updatedAt || apiArticle.updateTime || apiArticle.createdAt || new Date().toISOString(),
          views: apiArticle.views || 0,
          cover: apiArticle.cover || '',
          coverImage: apiArticle.cover || '',
          category: apiArticle.category || '未分类',
          tags: typeof apiArticle.tags === 'string' 
            ? apiArticle.tags.split(',').filter((tag: string) => tag.trim())
            : (apiArticle.tags || []),
          description: apiArticle.description || '',
          excerpt: apiArticle.description || '',
          status: 'published' as const,
          license: apiArticle.license || 'CC_BY_SA_4_0',
          publishDate: apiArticle.createdAt || apiArticle.createTime || new Date().toISOString(),
          allowComments: apiArticle.allowComments ?? true,
          sticky: apiArticle.sticky || false,
          comments: apiArticle.comments || apiArticle.commentCount || 0,
          pageBreaks: apiArticle.pageBreaks || []
        }));
        
        return {
          articles: articles,
          total: result.data.total || 0
        };
      }
    }
  } catch (error) {
    console.error('获取已发布文章列表失败:', error);
  }
  
  // API 失败时返回空数据
  return {
    articles: [],
    total: 0
  };
}

// 获取文章详情
export async function getArticleById(id: number): Promise<Article | null> {
  // 使用新的已发布文章获取函数
  return getPublishedArticleById(id);
}

// 获取最新文章
export async function getRecentArticles(limit = 5): Promise<Article[]> {
  try {
    const API_BASE_URL = config.api.apiUrl;
    const response = await fetch(`${API_BASE_URL}/articles/recent?limit=${limit}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('从 API 获取最新文章成功');
        
        // 处理返回的数据格式
        const articles = (result.data.articles || result.data.content || []).map((apiArticle: any) => ({
          ...apiArticle,
          createTime: apiArticle.createdAt || apiArticle.createTime || new Date().toISOString(),
          updateTime: apiArticle.updatedAt || apiArticle.updateTime || apiArticle.createdAt || new Date().toISOString(),
          views: apiArticle.views || 0,
          cover: apiArticle.cover || '',
          coverImage: apiArticle.cover || '',
          category: apiArticle.category || '未分类',
          tags: typeof apiArticle.tags === 'string' 
            ? apiArticle.tags.split(',').filter((tag: string) => tag.trim())
            : (apiArticle.tags || []),
          description: apiArticle.description || '',
          excerpt: apiArticle.description || '',
          status: 'published' as const,
          license: apiArticle.license || 'CC_BY_SA_4_0',
          publishDate: apiArticle.createdAt || apiArticle.createTime || new Date().toISOString(),
          allowComments: apiArticle.allowComments ?? true,
          sticky: apiArticle.sticky || false,
          comments: apiArticle.comments || apiArticle.commentCount || 0,
          pageBreaks: apiArticle.pageBreaks || []
        }));
        
        return articles;
      }
    } else {
      console.warn(`最新文章API返回错误: ${response.status}`);
    }
  } catch (error) {
    console.error('获取最新文章失败:', error);
  }
  
  console.warn('请实现API接口: GET /api/articles/recent?limit=' + limit);
  return [];
}

// 获取相关文章
export async function getRelatedArticles(articleId: number, limit = 4): Promise<Article[]> {
  try {
    const API_BASE_URL = config.api.apiUrl;
    const response = await fetch(`${API_BASE_URL}/articles/${articleId}/related?limit=${limit}`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('从 API 获取相关文章成功');
        return result.data.articles || [];
      }
    } else {
      console.warn(`相关文章API返回错误: ${response.status}`);
    }
  } catch (error) {
    console.error('获取相关文章失败:', error);
  }
  
  console.warn(`请实现API接口: GET /api/articles/${articleId}/related?limit=${limit}`);
  return [];
}

// 获取文章导航信息（上一篇/下一篇）
export async function getArticleNavigation(articleId: number): Promise<{
  prevArticle: Article | null;
  nextArticle: Article | null;
}> {
  try {
    const API_BASE_URL = config.api.apiUrl;
    const response = await fetch(`${API_BASE_URL}/articles/${articleId}/navigation`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('从 API 获取文章导航成功');
        return {
          prevArticle: result.data.prevArticle || null,
          nextArticle: result.data.nextArticle || null
        };
      }
    } else {
      console.warn(`文章导航API返回错误: ${response.status}`);
    }
  } catch (error) {
    console.error('获取文章导航失败:', error);
  }
  
  console.warn(`请实现API接口: GET /api/articles/${articleId}/navigation`);
  return {
    prevArticle: null,
    nextArticle: null
  };
}

// 归档数据接口
export interface ArchiveData {
  year: string;
  articles: Article[];
}

// 获取文章归档数据
export async function getArticleArchive(): Promise<ArchiveData[]> {
  try {
    const API_BASE_URL = config.api.apiUrl;
    console.log(`正在请求归档数据: ${API_BASE_URL}/articles/archive`);
    
    const response = await fetch(`${API_BASE_URL}/articles/archive`, {
      credentials: 'include',
      headers: {
        'Accept': 'application/json'
      }
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success && result.data) {
        console.log('从 API 获取文章归档成功');
        return result.data.archive || [];
      }
    } else {
      console.warn(`API返回错误状态: ${response.status} ${response.statusText}`);
    }
  } catch (error) {
    console.error('获取文章归档失败:', error);
  }
  
  console.warn('API接口未实现，返回空数据。请实现以下API接口：');
  console.warn('GET /api/articles/archive - 获取文章归档数据');
  return [];
}

// 创建新文章
export async function createArticle(article: Article): Promise<{ success: boolean; id?: number }> {
  try {
    const API_BASE_URL = config.api.apiUrl;
    const response = await fetch(`${API_BASE_URL}/article`, {
      method: 'POST',
      credentials: 'include',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(article)
    });
    
    if (response.ok) {
      const result = await response.json();
      if (result.success) {
        console.log('文章创建成功:', result);
        return { success: true, id: result.data?.id };
      }
    }
    
    console.error('创建文章失败');
    return { success: false };
  } catch (error) {
    console.error('创建文章请求失败:', error);
    return { success: false };
  }
}

// 更新文章
export async function updateArticle(article: Article): Promise<{ success: boolean }> {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 在实际应用中，这里会发送请求到后端API
      console.log('更新文章:', article);
      
      resolve({ success: true });
    }, 500);
  });
}

// 上传图片
export async function uploadImage(file: File): Promise<{ success: boolean; url: string }> {
  // 模拟图片上传
  return new Promise((resolve) => {
    setTimeout(() => {
      // 创建一个FileReader来读取文件
      const reader = new FileReader();
      reader.onload = (e) => {
        // 在实际应用中，这里会发送请求到后端API
        console.log('上传图片:', file.name);
        
        // 返回Base64格式的图片URL（仅用于演示）
        resolve({ 
          success: true, 
          url: e.target?.result as string || ''
        });
      };
      reader.readAsDataURL(file);
    }, 1000);
  });
}

// 保存文章（创建或更新）
export async function saveArticle(article: Article): Promise<{ success: boolean; id?: number }> {
  if (article.id) {
    const result = await updateArticle(article);
    return { success: result.success, id: article.id };
  } else {
    return await createArticle(article);
  }
} 