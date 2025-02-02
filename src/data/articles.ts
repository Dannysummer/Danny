export interface Article {
  id: number
  title: string
  createTime: string
  views: number
  cover: string
  description?: string
  tags?: string[]
  category?: string
}

export interface TimelineYear {
  year: string
  articles: Article[]
}

export const timelineData: TimelineYear[] = [
  {
    year: '2025',
    articles: [
      {
        id: 1,
        title: 'Cloudflare/Vercel项目推荐(3)',
        createTime: '2025-01-14',
        views: 558,
        cover: '/articles/cover/3.jpg',
        description: '推荐一些基于 Cloudflare/Vercel 的优质开源项目',
        tags: ['Cloudflare', 'Vercel', '项目推荐', '开源'],
        category: '技术分享'
      },
      {
        id: 2,
        title: 'Cloudflare/Vercel项目推荐(3)',
        createTime: '2025-05-14',
        views: 558,
        cover: '/articles/cover/3.jpg',
        description: '推荐一些基于 Cloudflare/Vercel 的优质开源项目',
        tags: ['Cloudflare', 'Vercel', '部署', '前端'],
        category: '技术分享'
      }
    ]
  },
  {
    year: '2024',
    articles: [
      {
        id: 2,
        title: '2024，清风入梦，扬帆待明年',
        createTime: '2024-12-31',
        views: 326,
        cover: '/articles/cover/1.jpg',
        description: '2024年终总结',
        tags: ['年终总结', '生活感悟', '2024'],
        category: '日常分享'
      },
      {
        id: 3,
        title: '华为通用软件开发工程师面经',
        createTime: '2024-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        description: '华为通用软件开发工程师面试经验分享',
        tags: ['面试', '华为', '经验分享', '求职'],
        category: '学习资料'
      }
    ]
  },
  {
    year: '2023',
    articles: [
      {
        id: 2,
        title: '2024，清风入梦，扬帆待明年',
        createTime: '2024-12-31',
        views: 326,
        cover: '/articles/cover/1.jpg',
        description: '2024年终总结',
        category: '年度总结'
      },
      {
        id: 3,
        title: '华为通用软件开发工程师面经',
        createTime: '2024-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        description: '华为通用软件开发工程师面试经验分享'
      },
      {
        id: 4,
        title: '华为通用软件开发工程师面经',
        createTime: '2024-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        description: '华为通用软件开发工程师面试经验分享'
      }
    ]
  },
  {
    year: '2022',
    articles: [
      {
        id: 2,
        title: '2024，清风入梦，扬帆待明年',
        createTime: '2022-12-31',
        views: 326,
        cover: '/articles/cover/1.jpg',
        description: '2024年终总结'
      },
      {
        id: 3,
        title: '华为通用软件开发工程师面经',
        createTime: '2022-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        description: '华为通用软件开发工程师面试经验分享'
      },
      {
        id: 4,
        title: '华为通用软件开发工程师面经',
        createTime: '2022-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        description: '华为通用软件开发工程师面试经验分享'
      }
    ]
  },
  {
    year: '2021',
    articles: [
      {
        id: 2,
        title: '2024，清风入梦，扬帆待明年',
        createTime: '2021-07-31',
        views: 326,
        cover: '/articles/cover/1.jpg',
        description: '2024年终总结'
      },
      {
        id: 3,
        title: '华为通用软件开发工程师面经',
        createTime: '2021-12-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        description: '华为通用软件开发工程师面试经验分享'
      },
      {
        id: 4,
        title: '华为通用软件开发工程师面经',
        createTime: '2021-05-25',
        views: 445,
        cover: '/articles/cover/2.jpg',
        description: '华为通用软件开发工程师面试经验分享'
      }
    ]
  }
]

export const getArticleById = (id: number): Article | undefined => {
  for (const year of timelineData) {
    const article = year.articles.find(article => article.id === id)
    if (article) return article
  }
  return undefined
} 