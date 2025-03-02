// 定义友链类型
export interface FriendLink {
  id?: number
  avatar: string
  cover: string
  name: string
  description: string
  url: string
  delay?: string
  category: 'bigshot' | 'close' | 'friend' | 'tech'
}

// 定义返回数据结构
interface ApiResponse<T> {
  success: boolean
  message: string | null
  data: T
}

interface FriendsData {
  friends: FriendLink[]
  categoryNames: Record<string, string>
}

// 分类名称映射 - 作为默认值
export const categoryNames = {
  all: '全部',
  bigshot: '大佬',
  close: '密友',
  friend: '普通朋友',
  tech: '官方技术博客'
}

// 友链服务类
class FriendLinkService {
  private _friends: FriendLink[] = []
  private _categoryNames = { ...categoryNames }
  private _isLoading = false
  private _isLoaded = false
  private _error: string | null = null

  // 获取所有友链
  async getAllFriends(): Promise<FriendLink[]> {
    if (!this._isLoaded && !this._isLoading) {
      await this.fetchFriendLinks()
    }
    return this._friends
  }

  // 获取分类名称
  async getCategoryNames(): Promise<Record<string, string>> {
    if (!this._isLoaded && !this._isLoading) {
      await this.fetchFriendLinks()
    }
    return this._categoryNames
  }

  // 按分类获取友链
  async getFriendsByCategory(category: string): Promise<FriendLink[]> {
    if (category === 'all') {
      return this.getAllFriends()
    }

    if (!this._isLoaded && !this._isLoading) {
      try {
        const response = await fetch(`http://localhost:8088/api/friend-links/category/${category}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json'
          }
        })

        const data: ApiResponse<FriendLink[]> = await response.json()

        if (data.success) {
          return data.data
        } else {
          this._error = data.message || '获取友链失败'
          console.error('获取友链失败:', data.message)
          return []
        }
      } catch (error) {
        this._error = '获取友链出错'
        console.error('获取友链出错:', error)
        return []
      }
    }

    return this._friends.filter(friend => friend.category === category)
  }

  // 从服务器获取友链数据
  private async fetchFriendLinks(): Promise<void> {
    this._isLoading = true
    this._error = null

    try {
      const response = await fetch('http://localhost:8088/api/friend-links', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      const data: ApiResponse<FriendsData> = await response.json()
      
      // 打印完整的后端响应数据
      console.log('后端返回的友链数据:', data)

      if (data.success) {
        const { friends, categoryNames: apiCategoryNames } = data.data
        
        // 打印具体的友链和分类数据
        console.log('获取到的友链列表:', friends)
        console.log('获取到的分类名称:', apiCategoryNames)
        
        this._friends = friends.map(friend => ({
          ...friend,
          category: friend.category.toLowerCase() as any
        }))
        
        // 打印转换后的数据
        console.log('处理后的友链数据:', this._friends)
        
        if (apiCategoryNames) {
          this._categoryNames = apiCategoryNames as typeof this._categoryNames
        }
        
        this._isLoaded = true
      } else {
        this._error = data.message || '获取友链失败'
        console.error('获取友链失败:', data.message)
      }
    } catch (error) {
      this._error = '获取友链出错'
      console.error('获取友链出错:', error)
    } finally {
      this._isLoading = false
    }
  }

  // 获取加载状态
  get isLoading(): boolean {
    return this._isLoading
  }

  // 获取错误信息
  get error(): string | null {
    return this._error
  }
}

// 创建并导出友链服务实例
export const friendLinkService = new FriendLinkService()

// 为了兼容现有代码，保留 friends 导出，但将其设为空数组
// 使用时应改用 friendLinkService.getAllFriends()
export const friends: FriendLink[] = [] 