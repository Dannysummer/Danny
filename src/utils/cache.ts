import { config } from '../config/index'
import { type BulletChat } from '../data/bulletChats'

// 缓存项接口
interface CacheItem {
  data: any
  timestamp: number
  ttl: number
}

// 弹幕缓存项接口
interface DanmakuCacheItem {
  bulletChats: BulletChat[]
  avatarCache: { [key: string]: string } // 头像URL到base64的映射
  timestamp: number
  ttl: number
}

// 图片缓存项接口
interface ImageCacheItem {
  data: string // base64编码的图片数据
  timestamp: number
  ttl: number
  size: number
}

// 统一缓存管理器
class CacheManager {
  private cache = new Map<string, CacheItem>()
  private readonly defaultTTL = config.cache.ttl.medium // 30分钟

  /**
   * 设置缓存
   * @param key 缓存键
   * @param data 缓存数据
   * @param ttl 生存时间(毫秒)
   */
  set(key: string, data: any, ttl: number = this.defaultTTL): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
    
    // 同时保存到localStorage作为持久化缓存
    try {
      const localStorageKey = `cache_${key}`
      const cacheData = {
        data,
        timestamp: Date.now(),
        ttl
      }
      localStorage.setItem(localStorageKey, JSON.stringify(cacheData))
    } catch (error) {
      console.warn('缓存保存到localStorage失败:', error)
    }
  }

  /**
   * 获取缓存
   * @param key 缓存键
   * @returns 缓存数据或null
   */
  get(key: string): any | null {
    // 首先从内存缓存获取
    const memoryItem = this.cache.get(key)
    if (memoryItem && !this.isExpired(memoryItem)) {
      return memoryItem.data
    }

    // 如果内存缓存没有或已过期，尝试从localStorage获取
    try {
      const localStorageKey = `cache_${key}`
      const stored = localStorage.getItem(localStorageKey)
      if (stored) {
        const item: CacheItem = JSON.parse(stored)
        if (!this.isExpired(item)) {
          // 恢复到内存缓存
          this.cache.set(key, item)
          return item.data
        } else {
          // 清理过期缓存
          localStorage.removeItem(localStorageKey)
        }
      }
    } catch (error) {
      console.warn('从localStorage获取缓存失败:', error)
    }

    return null
  }

  /**
   * 检查缓存是否存在且未过期
   * @param key 缓存键
   * @returns 是否存在有效缓存
   */
  has(key: string): boolean {
    return this.get(key) !== null
  }

  /**
   * 删除缓存
   * @param key 缓存键
   */
  delete(key: string): void {
    this.cache.delete(key)
    try {
      localStorage.removeItem(`cache_${key}`)
    } catch (error) {
      console.warn('删除localStorage缓存失败:', error)
    }
  }

  /**
   * 清理所有缓存
   */
  clear(): void {
    this.cache.clear()
    try {
      // 清理所有以cache_开头的localStorage项
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('清理localStorage缓存失败:', error)
    }
  }

  /**
   * 清理过期缓存
   */
  cleanup(): void {
    const now = Date.now()
    
    // 清理内存缓存
    for (const [key, item] of this.cache.entries()) {
      if (this.isExpired(item)) {
        this.cache.delete(key)
      }
    }

    // 清理localStorage过期缓存
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          const stored = localStorage.getItem(key)
          if (stored) {
            try {
              const item: CacheItem = JSON.parse(stored)
              if (this.isExpired(item)) {
                localStorage.removeItem(key)
              }
            } catch {
              // 解析失败，删除无效数据
              localStorage.removeItem(key)
            }
          }
        }
      })
    } catch (error) {
      console.warn('清理localStorage过期缓存失败:', error)
    }
  }

  /**
   * 检查缓存项是否过期
   * @param item 缓存项
   * @returns 是否过期
   */
  private isExpired(item: CacheItem): boolean {
    return Date.now() - item.timestamp > item.ttl
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): { memorySize: number, localStorageSize: number } {
    let localStorageSize = 0
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith('cache_')) {
          const stored = localStorage.getItem(key)
          if (stored) {
            localStorageSize += stored.length
          }
        }
      })
    } catch (error) {
      console.warn('获取localStorage缓存统计失败:', error)
    }

    return {
      memorySize: this.cache.size,
      localStorageSize
    }
  }
}

// 创建全局缓存管理器实例
export const cacheManager = new CacheManager()

// 头像缓存专用函数
export class AvatarCache {
  private static readonly AVATAR_CACHE_PREFIX = 'avatar_'
  private static readonly AVATAR_CACHE_TTL = config.cache.ttl.long // 24小时

  /**
   * 缓存头像URL（基于用户标识）
   * @param userIdentifier 用户标识（可以是用户名、用户ID或其他唯一标识）
   * @param avatarUrl 头像URL
   */
  static cacheAvatar(userIdentifier: string, avatarUrl: string): void {
    const key = `${this.AVATAR_CACHE_PREFIX}${userIdentifier}`
    cacheManager.set(key, avatarUrl, this.AVATAR_CACHE_TTL)
  }

  /**
   * 获取缓存的头像URL
   * @param userIdentifier 用户标识
   * @returns 头像URL或null
   */
  static getCachedAvatar(userIdentifier: string): string | null {
    const key = `${this.AVATAR_CACHE_PREFIX}${userIdentifier}`
    return cacheManager.get(key)
  }

  /**
   * 检查是否有缓存的头像
   * @param userIdentifier 用户标识
   * @returns 是否有缓存
   */
  static hasCachedAvatar(userIdentifier: string): boolean {
    const key = `${this.AVATAR_CACHE_PREFIX}${userIdentifier}`
    return cacheManager.has(key)
  }

  /**
   * 删除头像缓存
   * @param userIdentifier 用户标识
   */
  static removeAvatarCache(userIdentifier: string): void {
    const key = `${this.AVATAR_CACHE_PREFIX}${userIdentifier}`
    cacheManager.delete(key)
  }

  /**
   * 清理所有头像缓存
   */
  static clearAllAvatarCache(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(`cache_${this.AVATAR_CACHE_PREFIX}`)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('清理头像缓存失败:', error)
    }
  }

  /**
   * 根据头像URL生成用户标识（用于没有明确用户ID的情况）
   * @param avatarUrl 头像URL
   * @returns 用户标识
   */
  static generateUserIdentifier(avatarUrl: string): string {
    // 如果是默认头像，使用固定标识
    if (avatarUrl === '/avatars/default-avatar.png') {
      return 'default'
    }
    
    // 从URL中提取文件名作为标识
    const urlParts = avatarUrl.split('/')
    const fileName = urlParts[urlParts.length - 1]
    return fileName.replace(/\.[^/.]+$/, '') // 移除文件扩展名
  }
}

// 图片缓存管理器
export class ImageCache {
  private static readonly IMAGE_CACHE_PREFIX = 'img_cache_'
  private static readonly MAX_CACHE_SIZE = 10 * 1024 * 1024 // 10MB最大缓存（适合localStorage）
  private static readonly DEFAULT_TTL = config.cache.ttl.long // 24小时

  /**
   * 将图片URL转换为base64并缓存
   * @param url 图片URL
   * @returns Promise<string> 缓存的图片数据URL
   */
  static async cacheImage(url: string): Promise<string> {
    try {
      // 检查是否已有缓存
      const cached = this.getCachedImage(url)
      if (cached) {
        return cached
      }

      // 检查缓存大小限制
      const blob = await this.downloadImage(url)
      const base64 = await this.blobToBase64(blob)
      
      // 检查文件大小是否适合localStorage
      if (blob.size > 1024 * 1024) { // 1MB限制
        console.warn('⚠️ 图片文件过大，跳过缓存:', url)
        return url
      }
      
      // 缓存图片数据
      this.setCachedImage(url, base64, blob.size)
      
      return base64
    } catch (error) {
      console.warn('❌ 图片缓存失败:', error)
      return url // 失败时返回原始URL
    }
  }

  /**
   * 下载图片
   * @param url 图片URL
   * @returns Promise<Blob> 图片blob
   */
  private static async downloadImage(url: string): Promise<Blob> {
    const response = await fetch(url)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.status}`)
    }
    return response.blob()
  }

  /**
   * 获取缓存的图片
   * @param url 图片URL
   * @returns 缓存的图片数据URL或null
   */
  static getCachedImage(url: string): string | null {
    try {
      const key = this.getCacheKey(url)
      const stored = localStorage.getItem(key)
      
      if (stored) {
        const item: ImageCacheItem = JSON.parse(stored)
        
        // 检查是否过期
        if (Date.now() - item.timestamp < item.ttl) {
          return item.data
        } else {
          // 清理过期缓存
          localStorage.removeItem(key)
        }
      }
    } catch (error) {
      console.warn('获取缓存图片失败:', error)
    }
    
    return null
  }

  /**
   * 检查是否有缓存的图片
   * @param url 图片URL
   * @returns 是否有缓存
   */
  static hasCachedImage(url: string): boolean {
    return this.getCachedImage(url) !== null
  }

  /**
   * 设置图片缓存
   * @param url 图片URL
   * @param data base64数据
   * @param size 文件大小
   */
  private static setCachedImage(url: string, data: string, size: number): void {
    try {
      const key = this.getCacheKey(url)
      const item: ImageCacheItem = {
        data,
        timestamp: Date.now(),
        ttl: this.DEFAULT_TTL,
        size
      }

      // 检查缓存大小限制
      this.ensureCacheSizeLimit(size)
      
      localStorage.setItem(key, JSON.stringify(item))
    } catch (error) {
      console.warn('设置图片缓存失败:', error)
    }
  }

  /**
   * 确保缓存大小在限制内
   * @param newSize 新文件大小
   */
  private static ensureCacheSizeLimit(newSize: number): void {
    try {
      const keys = Object.keys(localStorage)
      const imageKeys = keys.filter(key => key.startsWith(this.IMAGE_CACHE_PREFIX))
      
      let totalSize = 0
      const cacheItems: Array<{key: string, size: number, timestamp: number}> = []
      
      // 计算当前缓存大小
      imageKeys.forEach(key => {
        const stored = localStorage.getItem(key)
        if (stored) {
          try {
            const item: ImageCacheItem = JSON.parse(stored)
            totalSize += item.size
            cacheItems.push({
              key,
              size: item.size,
              timestamp: item.timestamp
            })
          } catch {
            // 删除无效数据
            localStorage.removeItem(key)
          }
        }
      })

      // 如果添加新文件会超出限制，删除最旧的文件
      if (totalSize + newSize > this.MAX_CACHE_SIZE) {
        // 按时间排序，删除最旧的
        cacheItems.sort((a, b) => a.timestamp - b.timestamp)
        
        for (const item of cacheItems) {
          localStorage.removeItem(item.key)
          totalSize -= item.size
          
          if (totalSize + newSize <= this.MAX_CACHE_SIZE) {
            break
          }
        }
      }
    } catch (error) {
      console.warn('清理图片缓存失败:', error)
    }
  }

  /**
   * 将Blob转换为base64
   * @param blob Blob对象
   * @returns Promise<string> base64字符串
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsDataURL(blob)
    })
  }

  /**
   * 生成缓存键
   * @param url 图片URL
   * @returns 缓存键
   */
  private static getCacheKey(url: string): string {
    // 使用URL的哈希作为缓存键
    let hash = 0
    for (let i = 0; i < url.length; i++) {
      const char = url.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // 转换为32位整数
    }
    return `${this.IMAGE_CACHE_PREFIX}${Math.abs(hash)}`
  }

  /**
   * 清理所有图片缓存
   */
  static clearAllImageCache(): void {
    try {
      const keys = Object.keys(localStorage)
      keys.forEach(key => {
        if (key.startsWith(this.IMAGE_CACHE_PREFIX)) {
          localStorage.removeItem(key)
        }
      })
    } catch (error) {
      console.warn('清理图片缓存失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): { count: number, totalSize: number, maxSize: number, usagePercent: number } {
    try {
      const keys = Object.keys(localStorage)
      const imageKeys = keys.filter(key => key.startsWith(this.IMAGE_CACHE_PREFIX))
      
      let totalSize = 0
      let validCount = 0
      
      imageKeys.forEach(key => {
        const stored = localStorage.getItem(key)
        if (stored) {
          try {
            const item: ImageCacheItem = JSON.parse(stored)
            if (Date.now() - item.timestamp < item.ttl) {
              totalSize += item.size
              validCount++
            } else {
              // 清理过期缓存
              localStorage.removeItem(key)
            }
          } catch {
            // 删除无效数据
            localStorage.removeItem(key)
          }
        }
      })
      
      const usagePercent = (totalSize / this.MAX_CACHE_SIZE) * 100
      
      return { 
        count: validCount, 
        totalSize, 
        maxSize: this.MAX_CACHE_SIZE,
        usagePercent: Math.round(usagePercent * 100) / 100
      }
    } catch (error) {
      console.warn('获取图片缓存统计失败:', error)
      return { count: 0, totalSize: 0, maxSize: this.MAX_CACHE_SIZE, usagePercent: 0 }
    }
  }
}

// 弹幕缓存管理器
export class DanmakuCache {
  private static readonly DANMAKU_CACHE_KEY = 'danmaku_cache'
  private static readonly CACHE_TTL = config.cache.ttl.long // 24小时

  /**
   * 缓存弹幕数据到本地
   * @param bulletChats 弹幕数据数组
   */
  static async cacheDanmakuData(bulletChats: BulletChat[]): Promise<void> {
    try {
      // 收集所有头像URL
      const avatarUrls = new Set<string>()
      
      bulletChats.forEach(chat => {
        if (chat.avatar) {
          avatarUrls.add(chat.avatar)
        }
      })
      
      // 确保默认头像也被缓存
      avatarUrls.add('/avatars/default-avatar.png')

      // 预缓存所有头像，按URL缓存（只缓存未缓存的头像）
      const avatarCache: { [key: string]: string } = {} // URL -> base64
      const avatarPromises = Array.from(avatarUrls).map(async (url) => {
        try {
          // 检查是否已经缓存过
          const existingCache = ImageCache.getCachedImage(url)
          if (existingCache) {
            avatarCache[url] = existingCache
          } else {
            const cachedUrl = await ImageCache.cacheImage(url)
            avatarCache[url] = cachedUrl
          }
        } catch (error) {
          console.warn('缓存头像失败:', url, error)
          avatarCache[url] = url // 失败时使用原始URL
        }
      })

      await Promise.all(avatarPromises)

      // 创建缓存项
      const cacheItem: DanmakuCacheItem = {
        bulletChats,
        avatarCache,
        timestamp: Date.now(),
        ttl: this.CACHE_TTL
      }

      // 保存到localStorage
      localStorage.setItem(this.DANMAKU_CACHE_KEY, JSON.stringify(cacheItem))
    } catch (error) {
      console.error('缓存弹幕数据失败:', error)
    }
  }

  /**
   * 获取缓存的弹幕数据
   * @returns 缓存的弹幕数据或null
   */
  static getCachedDanmakuData(): BulletChat[] | null {
    try {
      const stored = localStorage.getItem(this.DANMAKU_CACHE_KEY)
      if (!stored) return null

      const cacheItem: DanmakuCacheItem = JSON.parse(stored)
      
      // 检查是否过期
      if (Date.now() - cacheItem.timestamp > cacheItem.ttl) {
        localStorage.removeItem(this.DANMAKU_CACHE_KEY)
        return null
      }

      // 将缓存的头像URL应用到弹幕数据
      const processedBulletChats = cacheItem.bulletChats.map(chat => {
        let avatar = chat.avatar || '/avatars/default-avatar.png'
        
        // 完全优先使用缓存的头像
        if (cacheItem.avatarCache[avatar]) {
          avatar = cacheItem.avatarCache[avatar]
        } else if (avatar === '/avatars/default-avatar.png') {
          // 对于默认头像，尝试从图片缓存获取
          const cachedDefault = ImageCache.getCachedImage(avatar)
          if (cachedDefault) {
            avatar = cachedDefault
          }
        }
        
        return {
          ...chat,
          avatar
        }
      })

      return processedBulletChats
    } catch (error) {
      console.warn('获取缓存弹幕数据失败:', error)
      return null
    }
  }

  /**
   * 检查是否有缓存的弹幕数据
   * @returns 是否有有效缓存
   */
  static hasCachedDanmakuData(): boolean {
    return this.getCachedDanmakuData() !== null
  }

  /**
   * 清理弹幕缓存
   */
  static clearDanmakuCache(): void {
    try {
      localStorage.removeItem(this.DANMAKU_CACHE_KEY)
    } catch (error) {
      console.warn('清理弹幕缓存失败:', error)
    }
  }

  /**
   * 获取缓存统计信息
   */
  static getCacheStats(): { bulletChatCount: number, avatarCount: number, timestamp: number | null } {
    try {
      const stored = localStorage.getItem(this.DANMAKU_CACHE_KEY)
      if (!stored) {
        return { bulletChatCount: 0, avatarCount: 0, timestamp: null }
      }

      const cacheItem: DanmakuCacheItem = JSON.parse(stored)
      return {
        bulletChatCount: cacheItem.bulletChats.length,
        avatarCount: Object.keys(cacheItem.avatarCache).length,
        timestamp: cacheItem.timestamp
      }
    } catch (error) {
      console.warn('获取弹幕缓存统计失败:', error)
      return { bulletChatCount: 0, avatarCount: 0, timestamp: null }
    }
  }

  /**
   * 检查缓存是否过期
   * @returns 是否过期
   */
  static isCacheExpired(): boolean {
    try {
      const stored = localStorage.getItem(this.DANMAKU_CACHE_KEY)
      if (!stored) return true

      const cacheItem: DanmakuCacheItem = JSON.parse(stored)
      return Date.now() - cacheItem.timestamp > cacheItem.ttl
    } catch {
      return true
    }
  }
}

// 定期清理过期缓存
setInterval(() => {
  cacheManager.cleanup()
}, 5 * 60 * 1000) // 每5分钟清理一次

// 页面卸载时清理内存缓存
window.addEventListener('beforeunload', () => {
  cacheManager.clear()
})

export default cacheManager 