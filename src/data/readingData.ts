// 定义类型
export interface Book {
  id: number
  title: string
  author: string
  cover: string
  rating: number
  ratingCount: number
  tags: string[]
  description: string
  price: string
  originalPrice?: number
  recommendReason?: string
}

export interface Category {
  id: number
  name: string
  books: Book[]
}

export interface Genre {
  id: number
  name: string
  image: string
}

// 标签数据
export const tags = ['文学', '科技', '哲学', '历史', '艺术', '科幻', '心理', '经济']

// 书籍数据
export const allBooks: Book[] = [
  {
    id: 1,
    title: '三体',
    author: '刘慈欣',
    cover: 'https://cdn.jsdelivr.net/gh/withastro/astro/assets/social/banner-minimal.png',
    rating: 4.9,
    ratingCount: 1234,
    tags: ['科幻', '哲学'],
    description: '地球文明向宇宙发出广播，被三体文明接收到。三体世界已经接近毁灭，他们决定入侵地球...',
    price: 'Free'
  },
  {
    id: 2,
    title: '百年孤独',
    author: '加西亚·马尔克斯',
    cover: 'https://covers.openlibrary.org/b/id/7081826-L.jpg',
    rating: 4.8,
    ratingCount: 987,
    tags: ['魔幻现实主义', '文学'],
    description: '讲述了布恩迪亚家族七代人的传奇故事...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 3,
    title: '人类简史',
    author: '尤瓦尔·赫拉利',
    cover: 'https://covers.openlibrary.org/b/id/8231990-L.jpg',
    rating: 4.7,
    ratingCount: 2156,
    tags: ['历史', '人类学'],
    description: '从认知革命、农业革命到科学革命，重新讲述人类的历史...',
    price: 'Free'
  },
  {
    id: 16,
    title: '置身事内',
    author: '兰小欢',
    cover: '/books/zssn.jpg',
    rating: 4.7,
    ratingCount: 1892,
    tags: ['经济', '社会'],
    description: '本书讲述了中国改革开放以来的经济发展历程...',
    price: 'Free'
  }
]

// 分类数据
export const categories: Category[] = [
  {
    id: 1,
    name: '历史推荐阅读',
    books: allBooks.slice(0, 3)
  }
]

// 流派数据
export const genres: Genre[] = [
  { 
    id: 1, 
    name: '浪漫爱情', 
    image: '/elements/reading/category/genre-1.webp' 
  },
  { 
    id: 2, 
    name: '动作冒险', 
    image: '/elements/reading/category/genre-2.webp' 
  },
  { 
    id: 3, 
    name: '悬疑推理', 
    image: '/elements/reading/category/genre-3.webp' 
  },
  { 
    id: 4, 
    name: '传记历史', 
    image: '/elements/reading/category/genre-4.webp' 
  },
  {
    id: 5,
    name: '科幻小说',
    image: '/elements/reading/category/genre-5.webp'
  },
  {
    id: 6,
    name: '文学经典',
    image: '/elements/reading/category/genre-6.webp'
  },
  {
    id: 7,
    name: '心理成长',
    image: '/elements/reading/category/genre-7.webp'
  },
  {
    id: 8,
    name: '经济管理',
    image: '/elements/reading/category/genre-8.webp'
  },
  {
    id: 9,
    name: '艺术设计',
    image: '/elements/reading/category/genre-9.webp'
  },
  {
    id: 10,
    name: '科技前沿',
    image: '/elements/reading/category/genre-10.webp'
  },
  {
    id: 11,
    name: '生活方式',
    image: '/elements/reading/category/genre-11.webp'
  },
  {
    id: 12,
    name: '哲学思考',
    image: '/elements/reading/category/genre-12.webp'
  }
]

// Danny首推书籍
export const topPick: Book = {
  id: 0,
  title: '人生海海',
  author: '麦家',
  cover: 'background/reading/rshh.jpg',
  rating: 4.9,
  ratingCount: 2891,
  tags: ['文学', '当代文学', '人性'],
  description: '这是一个关于命运的故事。"命运这个东西，虽然不能改变，但可以拒绝。"这可能是作者在书中想要传达的重要信息。',
  price: 'Free',
  recommendReason: '这是一部直面人性的作品，讲述了一个关于成长、救赎与生命意义的故事。麦家用他独特的叙事方式，将人性的复杂与命运的无常娓娓道来。这本书让我深深感受到了生命的重量，也看到了人性中的光芒。'
}

// Danny正在阅读的信息
export const currentReading = {
  message: '最近在读《认知觉醒》，探索如何突破认知的局限...'
} 