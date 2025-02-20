import type { Config } from './types'

export const config: Config = {
  openai: {
    qwenKey: import.meta.env.VITE_QWEN_KEY,
    qwenUrl: import.meta.env.VITE_QWEN_URL,
    deepseekKey: import.meta.env.VITE_DEEPSEEK_KEY,
    deepseekUrl: import.meta.env.VITE_DEEPSEEK_URL
  }
}