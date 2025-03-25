// 模拟API服务
// 这个文件用于本地开发时模拟后端API

// 模拟数据库
const db = {
  friendLinks: [
    {
      id: 1,
      name: '张三的博客',
      description: '一个分享技术和生活的博客',
      url: 'https://example1.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=1',
      cover: 'https://picsum.photos/400/300?random=1',
      category: 'tech',
      status: 'approved',
      createdAt: '2023-12-01T08:00:00Z'
    },
    {
      id: 2,
      name: '李四的小站',
      description: '记录编程学习的点点滴滴',
      url: 'https://example2.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=2',
      cover: 'https://picsum.photos/400/300?random=2',
      category: 'tech',
      status: 'approved',
      createdAt: '2023-12-02T09:30:00Z'
    },
    {
      id: 3,
      name: '王五的旅行记',
      description: '环游世界的美好记忆',
      url: 'https://example3.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=3',
      cover: 'https://picsum.photos/400/300?random=3',
      category: 'life',
      status: 'pending',
      createdAt: '2023-12-03T10:15:00Z'
    },
    {
      id: 4,
      name: '赵六的摄影',
      description: '用镜头记录生活',
      url: 'https://example4.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=4',
      cover: 'https://picsum.photos/400/300?random=4',
      category: 'photography',
      status: 'pending',
      createdAt: '2023-12-04T11:45:00Z'
    },
    {
      id: 5,
      name: '孙七的音乐站',
      description: '分享我喜欢的音乐',
      url: 'https://example5.com',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=5',
      cover: 'https://picsum.photos/400/300?random=5',
      category: 'entertainment',
      status: 'pending',
      createdAt: '2023-12-05T13:20:00Z'
    }
  ],
  
  // 这里可以添加其他模拟数据
  users: [],
  images: [],
  comments: [],
  messages: [],
  notifications: []
}

// 模拟Express应用
const app = {
  get: (path, handler) => {
    // 注册GET路由处理
    console.log(`[模拟API] 注册GET路由: ${path}`)
    // 实际开发中，这里会将路由处理器注册到Express应用中
  },
  
  post: (path, handler) => {
    // 注册POST路由处理
    console.log(`[模拟API] 注册POST路由: ${path}`)
  },
  
  put: (path, handler) => {
    // 注册PUT路由处理
    console.log(`[模拟API] 注册PUT路由: ${path}`)
  },
  
  delete: (path, handler) => {
    // 注册DELETE路由处理
    console.log(`[模拟API] 注册DELETE路由: ${path}`)
  }
}

// 添加获取未审核友链数量的API
app.get('/api/friend-links/pending/count', (req, res) => {
  // 获取未审核友链数量
  const pendingLinks = db.friendLinks.filter(link => link.status === 'pending')
  
  // 模拟响应
  const response = {
    success: true,
    count: pendingLinks.length
  }
  
  console.log(`[模拟API] GET /api/friend-links/pending/count 响应:`, response)
  return response
})

// 获取所有已通过的友链
app.get('/api/friend-links/all', (req, res) => {
  const approvedLinks = db.friendLinks.filter(link => link.status === 'approved')
  
  const response = {
    success: true,
    data: approvedLinks
  }
  
  console.log(`[模拟API] GET /api/friend-links/all 响应:`, response)
  return response
})

// 获取所有待审核的友链
app.get('/api/friend-links/pending', (req, res) => {
  const pendingLinks = db.friendLinks.filter(link => link.status === 'pending')
  
  const response = {
    success: true,
    data: pendingLinks
  }
  
  console.log(`[模拟API] GET /api/friend-links/pending 响应:`, response)
  return response
})

// 通过友链申请
app.post('/api/friend-links/:id/approve', (req, res) => {
  const id = parseInt(req.params.id)
  const friendLink = db.friendLinks.find(link => link.id === id)
  
  if (!friendLink) {
    const response = {
      success: false,
      message: '友链不存在'
    }
    console.log(`[模拟API] POST /api/friend-links/${id}/approve 响应:`, response)
    return response
  }
  
  friendLink.status = 'approved'
  
  const response = {
    success: true,
    message: '友链申请已通过'
  }
  
  console.log(`[模拟API] POST /api/friend-links/${id}/approve 响应:`, response)
  return response
})

// 拒绝友链申请
app.post('/api/friend-links/:id/reject', (req, res) => {
  const id = parseInt(req.params.id)
  const reason = req.body.reason
  
  // 在实际应用中，我们可能会保存拒绝原因，并发送给申请者
  // 这里为了简单起见，我们只从数组中删除该友链
  
  const index = db.friendLinks.findIndex(link => link.id === id)
  
  if (index === -1) {
    const response = {
      success: false,
      message: '友链不存在'
    }
    console.log(`[模拟API] POST /api/friend-links/${id}/reject 响应:`, response)
    return response
  }
  
  // 从数组中删除
  db.friendLinks.splice(index, 1)
  
  const response = {
    success: true,
    message: '已拒绝友链申请'
  }
  
  console.log(`[模拟API] POST /api/friend-links/${id}/reject 响应:`, response)
  return response
})

// 导出模拟API
export default {
  // 提供给前端调用的函数
  fetchPendingFriendLinksCount: async () => {
    const response = app.get('/api/friend-links/pending/count', {})
    return response
  },
  
  fetchAllFriendLinks: async () => {
    const response = app.get('/api/friend-links/all', {})
    return response
  },
  
  fetchPendingFriendLinks: async () => {
    const response = app.get('/api/friend-links/pending', {})
    return response
  },
  
  approveFriendLink: async (id) => {
    const response = app.post(`/api/friend-links/${id}/approve`, {})
    return response
  },
  
  rejectFriendLink: async (id, reason) => {
    const response = app.post(`/api/friend-links/${id}/reject`, { body: { reason } })
    return response
  }
} 