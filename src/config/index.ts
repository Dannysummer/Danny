// API服务器配置
const API_HOST = 'localhost'
const API_PORT = 8088
const DEV_PORT = 5173

// 应用基础配置
const APP_CONFIG = {
  name: "Danny's Blog",
  version: '2.0.0',
  author: 'Danny',
  description: '一个现代化的个人博客',
  keywords: ['博客', '技术', 'Vue3', 'TypeScript']
}

// 字体配置
const FONT_CONFIG = {
  // 中文字体 - 全部默认使用ZhuZiAWan
  chinese: {
    primary: 'ZhuZiAWan',
    secondary: 'ZhuZiAWan',
    decorative: 'ZhuZiAWan', 
    poetry: 'ZhuZiAWan'
  },
  // 英文字体
  english: {
    primary: 'Montserrat',
    secondary: 'Poppins',
    system: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen, Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif'
  },
  // 代码字体
  code: {
    primary: 'Fira Code',
    secondary: 'Roboto Mono',
    fallback: 'monospace'
  },
  // 字体大小
  sizes: {
    xs: '0.75rem',      // 12px
    sm: '0.875rem',     // 14px
    base: '1rem',       // 16px
    lg: '1.125rem',     // 18px
    xl: '1.25rem',      // 20px
    '2xl': '1.5rem',    // 24px
    '3xl': '1.875rem',  // 30px
    '4xl': '2.25rem',   // 36px
    '5xl': '3rem',      // 48px
    '6xl': '3.75rem'    // 60px
  }
}

// 颜色配置
const COLOR_CONFIG = {
  primary: {
    50: '#eff6ff',
    100: '#dbeafe', 
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3498db',  // 主色
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'
  },
  secondary: {
    50: '#ecfdf5',
    100: '#d1fae5',
    200: '#a7f3d0',
    300: '#6ee7b7',
    400: '#34d399',
    500: '#42b883',  // 次要色
    600: '#059669',
    700: '#047857',
    800: '#065f46',
    900: '#064e3b'
  },
  accent: {
    default: '#87ceeb',  // 天空蓝
    hover: '#6ca1ff',
    active: '#5c94ff'
  },
  gray: {
    50: '#f9fafb',
    100: '#f3f4f6',
    200: '#e5e7eb',
    300: '#d1d5db',
    400: '#9ca3af',
    500: '#6b7280',
    600: '#4b5563',
    700: '#374151',
    800: '#1f2937',
    900: '#111827'
  }
}

// 资源路径配置
const ASSETS_CONFIG = {
  // 背景图片
  backgrounds: {
    login: '/background/login-bg1.jpg',
    loading: '/background/loading-bg.bmp',
    message: '/background/green-bg.bmp',
    friends: '/background/friends/gqj-all.jpg',
    article: '/background/article-card-bg.jpg',
    essay: {
      banner: '/background/essay/essay-banner.png',
      bg1: '/background/essay/essay-bg1.png',
      bg2: '/background/essay/essay-bg2.png',
      bg3: '/background/essay/essay-bg3.png',
      bg4: '/background/essay/essay-bg4.png',
      bg5: '/background/essay/essay-bg5.png'
    },
    start: {
      bg1: '/background/startBg/start-bg1.png',
      bg2: '/background/startBg/start-bg2.png',
      bg3: '/background/startBg/start-bg3.png',
      bg4: '/background/startBg/start-bg4.png',
      bg5: '/background/startBg/start-bg5.png',
      bg6: '/background/startBg/start-bg6.png',
      bg7: '/background/startBg/start-bg7.png',
      bg8: '/background/startBg/start-bg8.png',
      bg9: '/background/startBg/start-bg9.png'
    },
    reading: {
      main: '/background/reading/reading-bg.jpg',
      bg2: '/background/reading/reading-bg2.jpg',
      bg3: '/background/reading/reading-bg3.png',
      bg4: '/background/reading/reading-bg4.png',
      bg5: '/background/reading/reading-bg5.png'
    }
  },
  // 图标路径
  icons: {
    logo: '/Icon/Logo/Danny\'s_blog.svg',
    cc: {
      default: '/Icon/cc/cc.svg',
      byNcSa: '/Icon/cc/cc-by-nc-sa.svg'
    },
    signs: {
      sign1: '/Icon/sign/sign-1.png',
      sign2: '/Icon/sign/sign-2.png',
      sign3: '/Icon/sign/sign-3.png'
    }
  },
  // 元素图片
  elements: {
    frames: {
      card1: '/elements/cardFrame/card-frame.png',
      card2: '/elements/cardFrame/card-frame2.png',
      card3: '/elements/cardFrame/card-frame3.png'
    },
    envelope: {
      before: '/elements/Envelope/before.png',
      after: '/elements/Envelope/after.png',
      violet: '/elements/Envelope/violet.jpg'
    },
    laser: {
      avatarBorder: '/laserCard/avatar-border.svg',
      acidBorder: '/laserCard/酸性边框.svg',
      grain: '/laserCard/grain.webp'
    }
  },
  // 音频文件
  audio: {
    music: {
      cover: '/music/cover/music.png',
      phonograph: '/music/cover/phonograph.png'
    }
  }
}

// 动画配置
const ANIMATION_CONFIG = {
  // 过渡时间
  duration: {
    fast: '0.15s',
    normal: '0.3s',
    slow: '0.5s',
    slower: '0.8s'
  },
  // 缓动函数
  easing: {
    default: 'ease',
    in: 'ease-in',
    out: 'ease-out',
    inOut: 'ease-in-out',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    smooth: 'cubic-bezier(0.4, 0, 0.2, 1)'
  },
  // 延迟
  delay: {
    none: '0s',
    short: '0.1s',
    medium: '0.2s',
    long: '0.3s'
  }
}

// 布局配置
const LAYOUT_CONFIG = {
  // 断点
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  // 容器尺寸
  container: {
    xs: '100%',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px'
  },
  // 间距
  spacing: {
    px: '1px',
    0: '0',
    1: '0.25rem',   // 4px
    2: '0.5rem',    // 8px
    3: '0.75rem',   // 12px
    4: '1rem',      // 16px
    5: '1.25rem',   // 20px
    6: '1.5rem',    // 24px
    8: '2rem',      // 32px
    10: '2.5rem',   // 40px
    12: '3rem',     // 48px
    16: '4rem',     // 64px
    20: '5rem',     // 80px
    24: '6rem',     // 96px
    32: '8rem',     // 128px
    40: '10rem',    // 160px
    48: '12rem',    // 192px
    56: '14rem',    // 224px
    64: '16rem'     // 256px
  },
  // 圆角
  borderRadius: {
    none: '0',
    sm: '0.125rem',
    default: '0.25rem',
    md: '0.375rem',
    lg: '0.5rem',
    xl: '0.75rem',
    '2xl': '1rem',
    '3xl': '1.5rem',
    full: '9999px'
  },
  // 阴影
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    default: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)',
    none: 'none'
  }
}

// UI组件配置
const UI_CONFIG = {
  // 按钮
  button: {
    sizes: {
      xs: { padding: '0.25rem 0.5rem', fontSize: FONT_CONFIG.sizes.xs },
      sm: { padding: '0.375rem 0.75rem', fontSize: FONT_CONFIG.sizes.sm },
      md: { padding: '0.5rem 1rem', fontSize: FONT_CONFIG.sizes.base },
      lg: { padding: '0.75rem 1.5rem', fontSize: FONT_CONFIG.sizes.lg },
      xl: { padding: '1rem 2rem', fontSize: FONT_CONFIG.sizes.xl }
    },
    borderRadius: LAYOUT_CONFIG.borderRadius.md
  },
  // 输入框
  input: {
    sizes: {
      sm: { padding: '0.375rem 0.75rem', fontSize: FONT_CONFIG.sizes.sm },
      md: { padding: '0.5rem 0.75rem', fontSize: FONT_CONFIG.sizes.base },
      lg: { padding: '0.75rem 1rem', fontSize: FONT_CONFIG.sizes.lg }
    },
    borderRadius: LAYOUT_CONFIG.borderRadius.md
  },
  // 卡片
  card: {
    padding: LAYOUT_CONFIG.spacing[6],
    borderRadius: LAYOUT_CONFIG.borderRadius.lg,
    shadow: LAYOUT_CONFIG.shadows.md
  }
}

// 分页配置
const PAGINATION_CONFIG = {
  defaultPageSize: 10,
  pageSizeOptions: [5, 10, 20, 50],
  maxVisiblePages: 7
}

// 上传配置
const UPLOAD_CONFIG = {
  // 文件大小限制(MB)
  maxFileSize: {
    image: 10,
    video: 100,
    audio: 20,
    document: 50
  },
  // 支持的文件格式
  allowedTypes: {
    image: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
    video: ['mp4', 'webm', 'ogg', 'mov'],
    audio: ['mp3', 'wav', 'ogg', 'flac'],
    document: ['pdf', 'doc', 'docx', 'txt', 'md']
  }
}

// 缓存配置
const CACHE_CONFIG = {
  // 缓存时间(毫秒)
  ttl: {
    short: 5 * 60 * 1000,      // 5分钟
    medium: 30 * 60 * 1000,    // 30分钟
    long: 24 * 60 * 60 * 1000, // 24小时
    week: 7 * 24 * 60 * 60 * 1000 // 7天
  }
}

export const config = {
  // API服务器配置
  api: {
    host: API_HOST,
    port: API_PORT,
    baseUrl: `http://${API_HOST}:${API_PORT}`,
    apiUrl: `http://${API_HOST}:${API_PORT}/api`,
    wsUrl: `http://${API_HOST}:${API_PORT}/ws`,
    timeout: 10000,
    retryTimes: 3
  },
  
  // 前端开发服务器配置
  dev: {
    port: DEV_PORT,
    origin: `http://${API_HOST}:${DEV_PORT}`
  },
  
  // 应用配置
  app: APP_CONFIG,
  
  // 字体配置
  fonts: FONT_CONFIG,
  
  // 颜色配置
  colors: COLOR_CONFIG,
  
  // 资源路径配置
  assets: ASSETS_CONFIG,
  
  // 动画配置
  animations: ANIMATION_CONFIG,
  
  // 布局配置
  layout: LAYOUT_CONFIG,
  
  // UI组件配置
  ui: UI_CONFIG,
  
  // 分页配置
  pagination: PAGINATION_CONFIG,
  
  // 上传配置
  upload: UPLOAD_CONFIG,
  
  // 缓存配置
  cache: CACHE_CONFIG,
  
  // OpenAI配置
  openai: {
    qwenKey: import.meta.env.VITE_QWEN_KEY,
    qwenUrl: import.meta.env.VITE_QWEN_URL,
    deepseekKey: import.meta.env.VITE_DEEPSEEK_KEY,
    deepseekUrl: import.meta.env.VITE_DEEPSEEK_URL
  }
} 