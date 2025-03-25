import { defineStore } from 'pinia'
import { ref } from 'vue'

interface MessageOptions {
  duration?: number
  closable?: boolean
}

interface Message {
  id: number
  type: 'success' | 'error' | 'info' | 'warning'
  content: string
  duration: number
  closable: boolean
}

export const useMessageStore = defineStore('message', () => {
  const messages = ref<Message[]>([])
  let messageId = 0

  // 添加消息
  const addMessage = (
    type: 'success' | 'error' | 'info' | 'warning',
    content: string,
    options?: MessageOptions
  ) => {
    const id = messageId++
    const message: Message = {
      id,
      type,
      content,
      duration: options?.duration ?? 3000,
      closable: options?.closable ?? true
    }
    
    messages.value.push(message)
    
    // 自动关闭
    if (message.duration > 0) {
      setTimeout(() => {
        removeMessage(id)
      }, message.duration)
    }
    
    // 同时打印到控制台便于调试
    console.log(`[${type.toUpperCase()}] ${content}`)
    
    return id
  }
  
  // 移除消息
  const removeMessage = (id: number) => {
    const index = messages.value.findIndex(msg => msg.id === id)
    if (index !== -1) {
      messages.value.splice(index, 1)
    }
  }

  // 清空所有消息
  const clearMessages = () => {
    messages.value = []
  }

  // 各类型消息快捷方法
  const success = (content: string, options?: MessageOptions) => 
    addMessage('success', content, options)
  
  const error = (content: string, options?: MessageOptions) => 
    addMessage('error', content, options)
  
  const info = (content: string, options?: MessageOptions) => 
    addMessage('info', content, options)
  
  const warning = (content: string, options?: MessageOptions) => 
    addMessage('warning', content, options)

  return {
    messages,
    addMessage,
    removeMessage,
    clearMessages,
    success,
    error,
    info,
    warning
  }
})

// 创建简化的消息通知接口，方便直接使用
export const useMessage = () => {
  const messageStore = useMessageStore()
  
  return {
    success: messageStore.success,
    error: messageStore.error,
    info: messageStore.info,
    warning: messageStore.warning
  }
} 