/// <reference types="vite/client" />

// 环境变量类型
interface ImportMetaEnv {
  VITE_QWEN_KEY: string
  VITE_QWEN_URL: string
  VITE_DEEPSEEK_KEY: string
  VITE_DEEPSEEK_URL: string
  readonly VITE_OPENAI_API_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// 应用配置类型
export interface AppConfig {
  name: string
  version: string
  author: string
  description: string
  keywords: string[]
}

// 字体配置类型
export interface FontConfig {
  chinese: {
    primary: string    // 主要中文字体 - ZhuZiAWan
    secondary: string  // 次要中文字体 - ZhuZiAWan  
    decorative: string // 装饰中文字体 - ZhuZiAWan
    poetry: string     // 诗歌中文字体 - ZhuZiAWan
  }
  english: {
    primary: string
    secondary: string
    system: string
  }
  code: {
    primary: string
    secondary: string
    fallback: string
  }
  sizes: {
    xs: string
    sm: string
    base: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    '4xl': string
    '5xl': string
    '6xl': string
  }
}

// 颜色配置类型
export interface ColorScale {
  50: string
  100: string
  200: string
  300: string
  400: string
  500: string
  600: string
  700: string
  800: string
  900: string
}

export interface ColorConfig {
  primary: ColorScale
  secondary: ColorScale
  accent: {
    default: string
    hover: string
    active: string
  }
  gray: ColorScale
}

// 资源配置类型
export interface AssetsConfig {
  backgrounds: {
    login: string
    loading: string
    message: string
    friends: string
    article: string
    essay: {
      banner: string
      bg1: string
      bg2: string
      bg3: string
      bg4: string
      bg5: string
    }
    start: {
      bg1: string
      bg2: string
      bg3: string
      bg4: string
      bg5: string
      bg6: string
      bg7: string
      bg8: string
      bg9: string
    }
    reading: {
      main: string
      bg2: string
      bg3: string
      bg4: string
      bg5: string
    }
  }
  icons: {
    logo: string
    cc: {
      default: string
      byNcSa: string
    }
    signs: {
      sign1: string
      sign2: string
      sign3: string
    }
  }
  elements: {
    frames: {
      card1: string
      card2: string
      card3: string
    }
    envelope: {
      before: string
      after: string
      violet: string
    }
    laser: {
      avatarBorder: string
      acidBorder: string
      grain: string
    }
  }
  audio: {
    music: {
      cover: string
      phonograph: string
    }
  }
}

// 动画配置类型
export interface AnimationConfig {
  duration: {
    fast: string
    normal: string
    slow: string
    slower: string
  }
  easing: {
    default: string
    in: string
    out: string
    inOut: string
    bounce: string
    smooth: string
  }
  delay: {
    none: string
    short: string
    medium: string
    long: string
  }
}

// 布局配置类型
export interface LayoutConfig {
  breakpoints: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  container: {
    xs: string
    sm: string
    md: string
    lg: string
    xl: string
    '2xl': string
  }
  spacing: {
    px: string
    0: string
    1: string
    2: string
    3: string
    4: string
    5: string
    6: string
    8: string
    10: string
    12: string
    16: string
    20: string
    24: string
    32: string
    40: string
    48: string
    56: string
    64: string
  }
  borderRadius: {
    none: string
    sm: string
    default: string
    md: string
    lg: string
    xl: string
    '2xl': string
    '3xl': string
    full: string
  }
  shadows: {
    sm: string
    default: string
    md: string
    lg: string
    xl: string
    '2xl': string
    inner: string
    none: string
  }
}

// UI组件配置类型
export interface UIConfig {
  button: {
    sizes: {
      xs: { padding: string; fontSize: string }
      sm: { padding: string; fontSize: string }
      md: { padding: string; fontSize: string }
      lg: { padding: string; fontSize: string }
      xl: { padding: string; fontSize: string }
    }
    borderRadius: string
  }
  input: {
    sizes: {
      sm: { padding: string; fontSize: string }
      md: { padding: string; fontSize: string }
      lg: { padding: string; fontSize: string }
    }
    borderRadius: string
  }
  card: {
    padding: string
    borderRadius: string
    shadow: string
  }
}

// 分页配置类型
export interface PaginationConfig {
  defaultPageSize: number
  pageSizeOptions: number[]
  maxVisiblePages: number
}

// 上传配置类型
export interface UploadConfig {
  maxFileSize: {
    image: number
    video: number
    audio: number
    document: number
  }
  allowedTypes: {
    image: string[]
    video: string[]
    audio: string[]
    document: string[]
  }
}

// 缓存配置类型
export interface CacheConfig {
  ttl: {
    short: number
    medium: number
    long: number
    week: number
  }
}

// API服务器配置类型
export interface ApiConfig {
  host: string
  port: number
  baseUrl: string
  apiUrl: string
  wsUrl: string
  timeout: number
  retryTimes: number
}

// 开发服务器配置类型
export interface DevConfig {
  port: number
  origin: string
}

// OpenAI 配置类型
export interface OpenAIConfig {
  qwenKey: string
  qwenUrl: string
  deepseekKey: string
  deepseekUrl: string
}

// 主配置类型
export interface Config {
  api: ApiConfig
  dev: DevConfig
  app: AppConfig
  fonts: FontConfig
  colors: ColorConfig
  assets: AssetsConfig
  animations: AnimationConfig
  layout: LayoutConfig
  ui: UIConfig
  pagination: PaginationConfig
  upload: UploadConfig
  cache: CacheConfig
  openai: OpenAIConfig
}

// 图片背景类型
export interface ImgBgItem {
  url: string
}

export interface ImgBgRow {
  items: ImgBgItem[]
}

export interface ImgBgConfig {
  translateX?: boolean
  skewX?: boolean
  contrast?: boolean
  scale?: boolean
  brightness?: boolean
}

// Typewriter 类型
declare module 'typewriter-effect/dist/core' {
  export default class Typewriter {
    constructor(element: HTMLElement, options: any)
    typeString(str: string): this
    deleteAll(): this
    pauseFor(ms: number): this
    start(): this
  }
} 