import { timelineData, type Article as BaseArticle } from '../data/articles';

// 扩展文章类型定义
export interface Article extends BaseArticle {
  excerpt?: string;
  categoryId?: number;
  status: 'draft' | 'published';
  coverImage: string;
  publishDate: string;
  slug?: string;
  allowComments: boolean;
  sticky: boolean;
  comments: number;
  pageBreaks?: number[];
}

// 获取文章详情
export async function getArticleById(id: number): Promise<Article | null> {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 在所有年份的文章中查找
      let foundArticle: BaseArticle | undefined;
      
      for (const year of timelineData) {
        const article = year.articles.find(article => article.id === id);
        if (article) {
          foundArticle = article;
          break;
        }
      }
      
      if (foundArticle) {
        resolve({
          ...foundArticle,
          excerpt: '',
          categoryId: 1,
          status: 'published',
          coverImage: foundArticle.cover,
          publishDate: foundArticle.createTime,
          allowComments: true,
          sticky: false,
          comments: 0,
          pageBreaks: []
        });
      } else {
        resolve(null);
      }
    }, 300);
  });
}

// 创建新文章
export async function createArticle(article: Article): Promise<{ success: boolean; id?: number }> {
  // 模拟API调用
  return new Promise((resolve) => {
    setTimeout(() => {
      // 获取所有文章
      const allArticles: BaseArticle[] = timelineData.flatMap(year => year.articles);
      
      // 生成新ID
      const newId = Math.max(...allArticles.map(a => a.id), 0) + 1;
      
      // 在实际应用中，这里会发送请求到后端API
      console.log('创建文章:', article);
      
      resolve({ success: true, id: newId });
    }, 500);
  });
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