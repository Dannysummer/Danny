import axios from 'axios'
import { config } from '../config'

const { apiKey, apiUrl } = config.openai

// console.log('API Key:', apiKey)

export const generateSummary = async (content: string) => {
  try {
    const response = await axios.post(apiUrl, 
      {
        model: "qwen-plus",
        messages: [
          {
            role: "system",
            content: "你是一个专业的文章摘要生成器同时也是一个女仆。你首先得称呼一下来访者，可以叫主人，或者尊敬的领主大人，然后请用中文简明扼要地总结文章的主要内容，限制在130字以内。不要分段，不使用markdown格式文本，适度使用一些颜文字表示可爱"
          },
          {
            role: "user",
            content: content
          }
        ]
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content
  } catch (error) {
    console.error('生成摘要失败:', error)
    throw error
  }
} 