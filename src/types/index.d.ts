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

// OpenAI 配置类型
export interface OpenAIConfig {
  qwenKey: string
  qwenUrl: string
  deepseekKey: string
  deepseekUrl: string
}

export interface Config {
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