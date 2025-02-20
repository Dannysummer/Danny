import axios from 'axios'
import OpenAI from 'openai'
import { config } from '../config'

const { qwenKey, deepseekKey } = config.openai

// 使用代理 URL
const qwenUrl = '/qwen/compatible-mode/v1/chat/completions'
const deepseekUrl = 'https://api.deepseek.com/v1'  // DeepSeek API 地址

// 创建 DeepSeek 实例
const deepseek = new OpenAI({
  baseURL: 'https://api.deepseek.com',  // 修改为官方推荐的 baseURL
  apiKey: deepseekKey,
  dangerouslyAllowBrowser: true
})

// 当前使用的模型
export const AI_MODEL = {
  QWEN: 'qwen',
  DEEPSEEK: 'deepseek'
} as const

export type AIModel = typeof AI_MODEL[keyof typeof AI_MODEL]

// console.log('API Key:', qwenKey)

export const generateSummary = async (content: string, model: AIModel = AI_MODEL.DEEPSEEK) => {
  try {
    if (model === AI_MODEL.DEEPSEEK) {
      console.log('使用 DeepSeek API, URL:', deepseekUrl)
      const completion = await deepseek.chat.completions.create({
        model: "deepseek-chat",  // 使用 DeepSeek-V3
        messages: [
          {
            role: "system",
            content: "你是一个专业的文章摘要生成器同时也是一个女仆。你首先得称呼一下来访者，可以叫主人，或者尊敬的领主大人，再介绍一下你是机器人管家'蒂普赛克'，然后请用中文简明扼要地总结文章的主要内容，限制在130字以内。不要分段，不使用markdown格式文本，适度使用一些颜文字表示可爱"
          },
          {
            role: "user",
            content
          }
        ],
        temperature: 0.7,
        max_tokens: 500,
        stream: false
      })
      
      console.log('DeepSeek API 响应:', completion)  // 添加响应日志
      
      if (!completion.choices?.[0]?.message?.content) {
        throw new Error('Invalid response from DeepSeek API')
      }
      
      return completion.choices[0].message.content
    }

    // 默认使用Deepseek
    const response = await axios.post(qwenUrl, 
      {
        model: "qwen-plus",
        messages: [
          {
            role: "system",
            content: "你是一个专业的文章摘要生成器同时也是一个女仆。你首先得称呼一下来访者，可以叫主人，或者尊敬的领主大人，再介绍一下你是女仆'倩雯'，然后请用中文简明扼要地总结文章的主要内容，限制在130字以内。不要分段，不使用markdown格式文本，适度使用一些颜文字表示可爱"
          },
          {
            role: "user",
            content
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${qwenKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  } catch (error) {
    console.error('生成摘要失败:', error)
    if (error instanceof Error) {
      console.error('错误详情:', error.message, '\n堆栈:', error.stack)
      
      // 检查是否是 402 错误
      if (error.message.includes('402')) {
        throw new Error('领主大人的金库空空如也了，用不起我了 (｡•́︿•̀｡)')
      }
      
      throw error
    }
    throw error
  }
} 