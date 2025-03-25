<template>
  <ParticlesBackground />
  <div class="message-page">
    <!-- 顶部背景图区域 -->
    <div class="message-header">
      <div class="parallax-bg" ref="parallaxBg"></div>
      
      <!-- 添加中央输入框 -->
      <div class="center-input">
        <h2 class="title">树洞</h2>
        <div class="input-container">
          <input type="text" 
                 v-model="danmakuContent"
                 placeholder="留下你想说的话..."
                 @keydown.enter="submitDanmaku"
                 class="message-input" />
          <button class="submit-button" @click.prevent="submitDanmaku">
            <Icon icon="material-symbols:send" />
          </button>
        </div>
      </div>

      <!-- 弹幕区域 -->
      <div class="danmaku-container" ref="danmakuContainer">
        <TransitionGroup name="danmaku">
          <div v-for="msg in visibleMessages" 
               :key="msg.id"
               class="danmaku-item"
               :style="msg.style"
               :data-id="msg.id">
            <div class="danmaku-avatar">
              <img :src="msg.avatar || '/avatars/default.jpg'" alt="avatar" />
            </div>
            {{ msg.content }}
          </div>
        </TransitionGroup>
      </div>

      <!-- 添加滚动提示 -->
      <div class="scroll-hint" 
           @click="scrollDown" 
           style="cursor: pointer;">
        <span class="scroll-text">向下滚动</span>
        <div class="scroll-arrow">
          <Icon icon="material-symbols:keyboard-arrow-down" />
        </div>
      </div>
    </div>

    <!-- 评论区域 -->
    <div class="comment-section">
      <!-- 评论输入框 -->
      <div class="comment-input">
        <div class="input-wrapper">
          <textarea
            v-model="commentContent"
            placeholder="写下你的留言..."
            class="comment-text"
            ref="commentTextarea"
          ></textarea>
          <div class="comment-controls">
            <div class="comment-tools">
              <input 
                type="file" 
                ref="imageInput"
                accept="image/*"
                class="image-input"
                @change="handleImageUpload"
              />
              <button class="tool-button" @click="triggerImageUpload">
                <Icon icon="material-symbols:image" />
              </button>
              <button class="tool-button" @click="toggleEmojiPicker">
                <Icon icon="material-symbols:mood" />
              </button>
            </div>
            <button class="send-btn" @click="submitComment">
              <Icon icon="material-symbols:send" />
              发送
            </button>
          </div>
        </div>
      </div>

      <!-- 预览图片 -->
      <div class="image-preview" v-if="selectedImage">
        <img :src="selectedImage" alt="preview" />
        <button class="remove-image" @click="removeImage">
          <Icon icon="material-symbols:close" />
        </button>
      </div>

      <!-- 表情选择器 -->
      <div class="emoji-picker" v-if="showEmojiPicker">
        <div class="emoji-container">
          <span 
            v-for="emoji in emojis" 
            :key="emoji"
            class="emoji"
            @click="insertEmoji(emoji)"
          >
            {{ emoji }}
          </span>
        </div>
      </div>

      <!-- 评论列表 -->
      <div class="comments-list">
        <div class="comment-item" v-for="comment in paginatedComments" :key="comment.id">
          <div class="comment-avatar">
            <img :src="comment.avatar" :alt="comment.nickname" />
          </div>
          <div class="comment-content">
            <div class="comment-header">
              <div class="comment-info">
                <span class="comment-nickname">{{ comment.nickname }}</span>
                <span class="comment-floor" :style="{ backgroundColor: getUserColor(comment.nickname) }">
                  #{{ comment.floor }}楼
                </span>
              </div>
              <span class="comment-time">{{ comment.time }}</span>
            </div>
            <div class="comment-text">{{ comment.content }}</div>
            <div class="comment-image" v-if="comment.image">
              <img 
                :src="comment.image" 
                alt="comment image" 
                @click="previewImage(comment.image)"
                class="comment-img"
              />
            </div>
            <div class="comment-footer">
              <div class="comment-action" @click="toggleLike(comment)">
                <Icon :icon="comment.isLiked ? 'material-symbols:thumb-up' : 'material-symbols:thumb-up-outline'" />
                <span>{{ comment.likes || 0 }}</span>
              </div>
              <div class="comment-action" @click="showReply(comment.id)">
                <Icon icon="material-symbols:reply" />
                <span>回复</span>
              </div>
            </div>
            
            <!-- 回复输入框 -->
            <div class="reply-input" v-if="showReplyInput === comment.id">
              <textarea
                v-model="replyContent"
                placeholder="写下你的回复..."
                class="reply-textarea"
              ></textarea>
              <div class="reply-controls">
                <button class="reply-btn" @click="submitReply(comment)">
                  <Icon icon="material-symbols:send" />
                  回复
                </button>
              </div>
            </div>
            
            <!-- 回复列表 -->
            <div class="replies-list" v-if="comment.replies && comment.replies.length">
              <div class="reply-item" v-for="reply in comment.replies" :key="reply.id">
                <div class="reply-avatar">
                  <img :src="reply.avatar" :alt="reply.nickname" />
                </div>
                <div class="reply-content">
                  <div class="reply-header">
                    <div class="reply-info">
                      <span class="reply-nickname">{{ reply.nickname }}</span>
                      <span class="reply-floor" :style="{ backgroundColor: getUserColor(reply.nickname) }">
                        #{{ reply.floor }}楼
                      </span>
                    </div>
                    <span class="reply-time">{{ reply.time }}</span>
                  </div>
                  <div class="reply-text" :style="{ backgroundColor: getUserColor(reply.nickname) }">
                    {{ reply.content }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 添加分页控件 -->
        <div class="pagination">
          <button 
            class="page-btn" 
            :disabled="currentPage === 1"
            @click="changePage(currentPage - 1)">
            <Icon icon="material-symbols:chevron-left" />
          </button>
          
          <button 
            v-for="page in totalPages" 
            :key="page"
            class="page-btn"
            :class="{ active: currentPage === page }"
            @click="changePage(page)">
            {{ page }}
          </button>
          
          <button 
            class="page-btn" 
            :disabled="currentPage === totalPages"
            @click="changePage(currentPage + 1)">
            <Icon icon="material-symbols:chevron-right" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, computed } from 'vue'
import { Icon } from '@iconify/vue'
import { type Comment, comments } from '../data/comments'
import ParticlesBackground from '../components/ParticlesBackground.vue'
import { type BulletChat, getActiveBulletChats, addBulletChat } from '../data/bulletChats'
import { isLoggedIn } from '../utils/auth'
import { containsSensitiveWord} from '../data/sensitiveWords'

interface DanmakuMessage {
  id: number
  content: string
  nickname?: string
  avatar?: string
  color: string
  style: {
    top: string
    left: string
    color: string
    transform?: string
    transition?: string
  }
}

const danmakuContainer = ref<HTMLElement | null>(null)
const visibleMessages = ref<DanmakuMessage[]>([])
const danmakuContent = ref('')
const commentContent = ref('')
const nickname = ref('')
const selectedColor = ref('#FFFFFF')

let messageId = 0

// 存储所有弹幕数据
const allBulletChats = ref<BulletChat[]>([])
// 当前弹幕播放索引
const currentBulletIndex = ref(0)
// 是否正在播放弹幕
const isPlayingBullets = ref(false)
// 弹幕显示的时间间隔(毫秒)
const bulletInterval = ref(2000)

// 清理定时器变量
let cleanupInterval: number

// 在 script setup 中添加
const showReplyInput = ref<number | null>(null) // 控制回复输入框的显示
const replyContent = ref('') // 回复内容

// 点赞功能
const toggleLike = (comment: Comment) => {
  if (!comment.likes) comment.likes = 0
  if (!comment.isLiked) {
    comment.likes++
    comment.isLiked = true
  } else {
    comment.likes--
    comment.isLiked = false
  }
}

// 回复功能
const showReply = (commentId: number) => {
  showReplyInput.value = showReplyInput.value === commentId ? null : commentId
  replyContent.value = '' // 清空回复内容
}

const submitReply = (comment: Comment) => {
  if (!replyContent.value.trim()) return

  const newReply: Comment = {
    id: Date.now(),
    floor: comment.floor,
    nickname: "游客", // 这里可以改成实际的用户名
    avatar: "/avatars/default.jpg", // 这里可以改成实际的用户头像
    content: replyContent.value,
    time: new Date().toLocaleString(),
    likes: 0
  }

  if (!comment.replies) comment.replies = []
  comment.replies.push(newReply)
  
  replyContent.value = ''
  showReplyInput.value = null
}

// 生成随机高度
// const getRandomTop = () => {
//   const containerHeight = danmakuContainer.value?.clientHeight || 400
//   const maxTop = containerHeight - 40 // 留出弹幕高度
//   return Math.floor(Math.random() * maxTop) + 'px'
// }

// 添加一个获取随机速度的函数
const getRandomDuration = () => {
  const minDuration = 16 // 最快8秒
  const maxDuration = 24 // 最慢16秒
  return Math.random() * (maxDuration - minDuration) + minDuration
}

// 从数据源加载弹幕
const loadBulletChats = async () => {
  try {
    console.log('从API获取弹幕数据')
    const activeBulletChats = await getActiveBulletChats()
    
    if (activeBulletChats.length > 0) {
      // 保存所有弹幕数据
      allBulletChats.value = activeBulletChats
      // 打乱弹幕顺序，提高随机性
      shuffleArray(allBulletChats.value)
      return activeBulletChats
    } else {
      console.warn('获取到的弹幕数据为空')
      return []
    }
  } catch (error) {
    console.error('加载弹幕失败:', error)
    return []
  }
}

// 打乱数组的辅助函数
const shuffleArray = (array: any[]) => {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[array[i], array[j]] = [array[j], array[i]]
  }
}

// 开始播放弹幕
const startPlayingBullets = () => {
  if (isPlayingBullets.value || allBulletChats.value.length === 0) return
  
  isPlayingBullets.value = true
  playNextBullet()
}

// 播放下一条弹幕
const playNextBullet = () => {
  if (!isPlayingBullets.value) return
  
  // 如果已经播放完所有弹幕，重新开始
  if (currentBulletIndex.value >= allBulletChats.value.length) {
    currentBulletIndex.value = 0
    // 重新打乱弹幕顺序，保持新鲜感
    shuffleArray(allBulletChats.value)
  }
  
  const nextBullet = allBulletChats.value[currentBulletIndex.value]
  if (nextBullet) {
    addDanmaku(nextBullet.content, undefined, nextBullet.avatar)
    currentBulletIndex.value++
    
    // 根据弹幕密度和屏幕宽度动态调整弹幕间隔
    const density = Math.min(10, Math.max(1, Math.floor(window.innerWidth / 300)))
    const baseInterval = bulletInterval.value
    const randomVariation = Math.random() * 1000 - 500 // -500 到 500ms的随机变化
    
    // 计算下一条弹幕显示的时间间隔
    const nextInterval = baseInterval / density + randomVariation
    
    // 设置合理的时间间隔范围
    const actualInterval = Math.max(800, Math.min(3000, nextInterval))
    
    // 安排下一条弹幕
    setTimeout(playNextBullet, actualInterval)
  }
}

// 停止播放弹幕
const stopPlayingBullets = () => {
  isPlayingBullets.value = false
}

// 创建自定义消息方法，从之前自定义的消息框组件中移植过来
// 这个方法与Settings.vue中的createMessage相似
const createMessage = (content: string, type: 'success' | 'warning' | 'error' | 'info' = 'info', duration: number = 3000) => {
  console.log('创建消息:', content, type);
  
  try {
    // 确保创建全新的消息容器
    let messageContainer = document.querySelector('.custom-message-container') as HTMLDivElement;
    if (!messageContainer) {
      messageContainer = document.createElement('div');
      messageContainer.className = 'custom-message-container';
      
      // 为容器添加内联样式
      messageContainer.style.position = 'fixed';
      messageContainer.style.bottom = '20px';
      messageContainer.style.right = '20px';
      messageContainer.style.display = 'flex';
      messageContainer.style.flexDirection = 'column';
      messageContainer.style.gap = '10px';
      messageContainer.style.zIndex = '9999';
      messageContainer.style.maxWidth = '350px';
      
      document.body.appendChild(messageContainer);
      console.log('创建了消息容器');
    }
    
    // 创建消息元素
    const messageElement = document.createElement('div');
    messageElement.className = `custom-message custom-message-${type}`;
    messageElement.style.setProperty('--message-duration', `${duration}ms`);
    
    // 给消息元素添加内联样式，确保它能正确显示
    messageElement.style.background = 'rgba(40, 45, 60, 0.85)';
    messageElement.style.color = 'white';
    messageElement.style.padding = '15px 20px';
    messageElement.style.borderRadius = '8px';
    messageElement.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.3)';
    messageElement.style.transform = 'translateX(120%)';
    messageElement.style.opacity = '0';
    messageElement.style.transition = 'all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55)';
    messageElement.style.position = 'relative';
    messageElement.style.backdropFilter = 'blur(8px)';
    messageElement.style.borderLeft = `4px solid ${
      type === 'success' ? '#67c23a' : 
      type === 'warning' ? '#e6a23c' : 
      type === 'error' ? '#f56c6c' : '#909399'
    }`;
    messageElement.style.overflow = 'hidden';
    
    // 添加消息内容
    const contentElement = document.createElement('div');
    contentElement.style.fontSize = '14px';
    contentElement.style.lineHeight = '1.5';
    contentElement.textContent = content;
    messageElement.appendChild(contentElement);
    
    // 添加进度条
    const progressBar = document.createElement('div');
    progressBar.style.position = 'absolute';
    progressBar.style.bottom = '0';
    progressBar.style.left = '0';
    progressBar.style.height = '3px';
    progressBar.style.width = '100%';
    progressBar.style.backgroundColor = type === 'success' ? 'rgba(103, 194, 58, 0.6)' :
                                       type === 'warning' ? 'rgba(230, 162, 60, 0.6)' :
                                       type === 'error' ? 'rgba(245, 108, 108, 0.6)' :
                                       'rgba(144, 147, 153, 0.6)';
    progressBar.style.transition = `width ${duration}ms linear`;
    messageElement.appendChild(progressBar);
    
    // 添加到容器
    messageContainer.appendChild(messageElement);
    console.log('消息元素已添加到容器');
    
    // 强制浏览器重绘
    void messageElement.offsetHeight;
    
    // 显示消息（使用内联样式改变）
    setTimeout(() => {
      messageElement.style.transform = 'translateX(0)';
      messageElement.style.opacity = '1';
      
      // 启动进度条动画
      setTimeout(() => {
        progressBar.style.width = '0';
      }, 10);
      
      console.log('显示消息 - 更新样式');
    }, 10);
    
    // 设置自动隐藏
    setTimeout(() => {
      messageElement.style.transform = 'translateX(120%)';
      messageElement.style.opacity = '0';
      console.log('消息即将隐藏 - 更新样式');
      
      // 设置一个安全的删除时间，不依赖于transitionend事件
      setTimeout(() => {
        if (messageElement.parentNode) {
          messageElement.parentNode.removeChild(messageElement);
          console.log('消息元素已移除');
        }
      }, 500); // 给过渡动画留出足够时间
    }, duration);
  } catch (error) {
    console.error('创建消息框时出错:', error);
    // 确保即使出错也能显示消息（使用alert作为备选）
    alert(`${type}: ${content}`);
  }
};

// 提交弹幕
const submitDanmaku = async () => {
  // 添加调试日志
  console.log('提交弹幕函数被触发');
  console.log('弹幕内容:', danmakuContent.value);
  
  // 检查弹幕内容是否为空
  if (!danmakuContent.value.trim()) {
    console.log('弹幕内容为空，终止发送');
    createMessage('请输入弹幕内容', 'warning', 3000);
    return;
  }
  
  // 检查用户是否已登录 - 添加日志
  const loginStatus = isLoggedIn();
  console.log('用户登录状态:', loginStatus);
  
  // 检查登录状态
  if (!loginStatus) {
    console.log('用户未登录，显示提示消息');
    createMessage('大人在公共场合发言要先登录一下哈', 'warning', 3000);
    return;
  }
  
  // 检查敏感词
  const sensitiveWord = containsSensitiveWord(danmakuContent.value);
  if (sensitiveWord) {
    console.log('检测到敏感词:', sensitiveWord);
    createMessage(`您的发言包含敏感词"${sensitiveWord}"，请修改后再发送`, 'error', 3000);
    return;
  }
  
  try {
    // console.log('准备发送API请求...');
    // 将新弹幕添加到数据模型中
    const result = await addBulletChat(danmakuContent.value, nickname.value ? undefined : selectedColor.value);
    // console.log('API响应:', result);
    
    if (result.success && result.data) {
      // console.log('弹幕发送成功，更新UI');
      // 添加到弹幕列表中
      allBulletChats.value.push(result.data);
      
      // 立即在界面上显示
      addDanmaku(result.data.content, nickname.value, result.data.avatar);
      danmakuContent.value = '';
      
      createMessage('弹幕发送成功，当前只有您能看到，领主大人审批了其他领民才能看到哟', 'success', 5000);
    } else {
      // 显示具体错误信息
      console.log('API返回了错误:', result.message);
      createMessage(result.message || '弹幕发送失败，请稍后再试', 'error', 3000);
    }
  } catch (error) {
    console.error('发送弹幕失败，详细错误:', error);
    createMessage('弹幕发送失败，请稍后再试', 'error', 3000);
  }
}

// 添加新弹幕 - 改进版，增加了弹道管理
const addDanmaku = (content: string, nickname?: string, avatar?: string) => {
  const duration = getRandomDuration()
  
  // 使用弹道管理系统，避免弹幕重叠
  const lanes = 10 // 弹道数量
  const usedLanes = new Set() // 已使用的弹道
  
  // 查找可用弹道
  visibleMessages.value.forEach(msg => {
    const laneMatch = msg.style.top.match(/(\d+)%/)
    if (laneMatch) {
      const lane = parseInt(laneMatch[1]) / 10
      usedLanes.add(lane)
    }
  })
  
  // 选择最空闲的弹道
  let selectedLane = Math.floor(Math.random() * lanes)
  for (let i = 0; i < lanes; i++) {
    if (!usedLanes.has(i)) {
      selectedLane = i
      break
    }
  }
  
  // 计算弹幕顶部位置
  const top = `${selectedLane * 10}%`
  
  const message: DanmakuMessage = {
    id: messageId++,
    content: nickname ? `${nickname}: ${content}` : content,
    avatar: avatar,
    color: getRandomColor(), // 使用随机颜色增加视觉多样性
    style: {
      top,
      left: '100%',
      color: getRandomColor(),
      transform: 'translateX(0)',
      transition: `transform ${duration}s linear`
    }
  }
  
  visibleMessages.value.push(message)
  
  nextTick(() => {
    const element = document.querySelector(`[data-id="${message.id}"]`) as HTMLElement
    if (element) {
      const width = element.offsetWidth
      const screenWidth = window.innerWidth
      const distance = screenWidth + width
      
      requestAnimationFrame(() => {
        message.style.transform = `translateX(-${distance}px)`
      })
    }
  })
}

// 生成随机颜色
const getRandomColor = () => {
  const colors = [
    '#FFFFFF', // 白色
    // '#FFD700', // 金色
    // '#FF69B4', // 粉红色
    // '#00BFFF', // 天蓝色
    // '#7FFF00', // 绿黄色
    // '#FF6347', // 番茄色
    // '#FFA500', // 橙色
    // '#9370DB'  // 紫色
  ]
  return colors[Math.floor(Math.random() * colors.length)]
}

// 修改 onMounted 钩子，处理异步加载
onMounted(async () => {
  // 从数据源一次性加载所有弹幕
  const bulletChatsData = await loadBulletChats()
  
  // 初始显示几条弹幕，营造氛围
  const initialCount = Math.min(bulletChatsData.length, 5)
  for (let i = 0; i < initialCount; i++) {
    const index = Math.floor(Math.random() * bulletChatsData.length)
    const chat = bulletChatsData[index]
    if (chat.status === 'APPROVED') {
      setTimeout(() => {
        addDanmaku(chat.content, undefined, chat.avatar)
      }, i * 800)
    }
  }
  
  // 短暂延迟后开始循环播放弹幕
  setTimeout(() => {
    startPlayingBullets()
  }, initialCount * 800 + 1000)
  
  // 清理定时器间隔
  cleanupInterval = window.setInterval(cleanupDanmaku, 100)
  
  // 监听窗口大小变化，调整弹幕间隔
  window.addEventListener('resize', () => {
    bulletInterval.value = Math.max(1000, Math.min(3000, window.innerWidth / 4))
  })

  window.addEventListener('scroll', handleParallax)
  
  // 初始化弹幕间隔
  bulletInterval.value = Math.max(1000, Math.min(3000, window.innerWidth / 4))
})

// 修改 onUnmounted 钩子，清除资源
onUnmounted(() => {
  stopPlayingBullets()
  clearInterval(cleanupInterval)
  window.removeEventListener('scroll', handleParallax)
  window.removeEventListener('resize', () => {})
})

// 将 comments 转换为 ref
const commentsList = ref(comments)

// 添加新的响应式变量
const imageInput = ref<HTMLInputElement | null>(null)
const commentTextarea = ref<HTMLTextAreaElement | null>(null)
const selectedImage = ref<string>('')
const showEmojiPicker = ref(false)

// 表情列表
const emojis = [
  '😊', '😂', '🥰', '😍', '😎', '🤔', '😅', '😄', 
  '👍', '❤️', '🎉', '✨', '🌟', '🔥', '💪', '🤗'
]

// 触发图片上传
const triggerImageUpload = () => {
  imageInput.value?.click()
}

// 处理图片上传
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    // 检查文件大小（例如限制为2MB）
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB')
      return
    }
    
    const reader = new FileReader()
    reader.onload = (e) => {
      selectedImage.value = e.target?.result as string
    }
    reader.readAsDataURL(file)
  }
}

// 移除已选择的图片
const removeImage = () => {
  selectedImage.value = ''
  if (imageInput.value) {
    imageInput.value.value = ''
  }
}

// 切换表情选择器显示状态
const toggleEmojiPicker = () => {
  showEmojiPicker.value = !showEmojiPicker.value
}

// 插入表情
const insertEmoji = (emoji: string) => {
  if (commentTextarea.value) {
    const start = commentTextarea.value.selectionStart
    const end = commentTextarea.value.selectionEnd
    const text = commentContent.value
    commentContent.value = text.substring(0, start) + emoji + text.substring(end)
    // 更新光标位置
    nextTick(() => {
      commentTextarea.value!.selectionStart = start + emoji.length
      commentTextarea.value!.selectionEnd = start + emoji.length
    })
  } else {
    commentContent.value += emoji
  }
}

// 修改提交评论方法
const submitComment = () => {
  if (!commentContent.value.trim() && !selectedImage.value) return
  
  const newComment: Comment = {
    id: Date.now(),
    floor: commentsList.value.length + 1,
    nickname: "游客",
    avatar: "/avatars/default.jpg",
    content: commentContent.value,
    image: selectedImage.value, // 添加图片
    time: new Date().toLocaleString(),
    likes: 0
  }
  
  commentsList.value.push(newComment)
  commentContent.value = ''
  selectedImage.value = ''
  showEmojiPicker.value = false
}

// 添加图片预览功能
const previewImage = (imageUrl: string) => {
  // 创建一个新窗口或模态框来预览图片
  window.open(imageUrl, '_blank')
}

// 添加分页相关的响应式变量
const currentPage = ref(1)
const pageSize = 5  // 每页显示的评论数
const totalPages = computed(() => Math.ceil(commentsList.value.length / pageSize))

// 添加分页方法
const paginatedComments = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return commentsList.value.slice(start, end)
})

const changePage = (page: number) => {
  currentPage.value = page
  // 获取评论列表元素
  const commentsElement = document.querySelector('.comments-list')
  if (commentsElement) {
    const rect = commentsElement.getBoundingClientRect()
    // 滚动到评论列表顶部位置减去100px
  window.scrollTo({
      top: window.scrollY + rect.top - 400,
    behavior: 'smooth'
  })
}}

// 添加滚动函数
const scrollDown = () => {
  window.scrollTo({
    top: window.innerHeight,
    behavior: 'smooth'
  })
}

// 修改清除弹幕的函数
const cleanupDanmaku = () => {
  const screenWidth = window.innerWidth
  
  visibleMessages.value = visibleMessages.value.filter(msg => {
    const element = document.querySelector(`[data-id="${msg.id}"]`) as HTMLElement
    if (!element) return false
    
    const transform = getComputedStyle(element).transform
    const matrix = new WebKitCSSMatrix(transform)
    
    // 获取当前位置
    const currentX = matrix.m41
    
    // 检查是否移动到屏幕外
    if (currentX < -screenWidth * 1.5) return false
    
    // 检查弹幕是否停止移动
    const prevPosition = element.dataset.prevX
    if (prevPosition) {
      const hasMoved = currentX !== parseFloat(prevPosition)
      element.dataset.prevX = currentX.toString()
      
      if (!hasMoved) {
        const stuckTime = parseInt(element.dataset.stuckTime || '0')
        if (stuckTime > 1) { // 如果超过1次检查都没有移动，则移除
          return false
        }
        element.dataset.stuckTime = (stuckTime + 1).toString()
      } else {
        element.dataset.stuckTime = '0'
      }
    } else {
      element.dataset.prevX = currentX.toString()
    }
    
    return true
  })
}

// 添加视差滚动效果
const parallaxBg = ref<HTMLElement | null>(null)

const handleParallax = () => {
  if (!parallaxBg.value) return
  const scrolled = window.scrollY
  parallaxBg.value.style.transform = `translateY(${scrolled * 0.5}px)` // 0.5是视差系数，可以调整
}

// 在 script setup 中添加用户颜色映射
const userColors = new Map<string, string>()
const colorPalette = [
  'rgba(255, 182, 193, 0.15)', // 浅粉色
  'rgba(176, 224, 230, 0.15)', // 浅蓝色
  'rgba(152, 251, 152, 0.15)', // 浅绿色
  'rgba(221, 160, 221, 0.15)', // 浅紫色
  'rgba(255, 218, 185, 0.15)', // 浅橙色
  'rgba(230, 230, 250, 0.15)', // 淡紫色
  'rgba(176, 196, 222, 0.15)', // 淡钢蓝
  'rgba(255, 240, 245, 0.15)'  // 淡玫瑰色
]

// 获取用户颜色的函数
const getUserColor = (nickname: string) => {
  if (!userColors.has(nickname)) {
    const colorIndex = userColors.size % colorPalette.length
    const color = colorPalette[colorIndex]
    userColors.set(nickname, color)
  }
  return userColors.get(nickname)
}
</script>

<style scoped>
.message-page {
  min-height: 100vh;
  position: relative;
  background: url('/background/green-bg.bmp') !important;
  background-size: cover !important;
  background-position: center !important;
  background-attachment: fixed !important;
  width: 100vw;
  max-width: 100%;
  overflow-x: hidden;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

/* 自定义消息框样式 */
.custom-message-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  max-width: 350px;
}

.custom-message {
  background: rgba(40, 45, 60, 0.85);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transform: translateX(120%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  backdrop-filter: blur(8px);
  border-left: 4px solid transparent;
  overflow: hidden;
}

.custom-message.show {
  transform: translateX(0);
  opacity: 1;
}

.custom-message.leave {
  transform: translateX(120%);
  opacity: 0;
}

.custom-message-content {
  font-size: 14px;
  line-height: 1.5;
}

.custom-message-success {
  border-left-color: #67c23a;
}

.custom-message-warning {
  border-left-color: #e6a23c;
}

.custom-message-error {
  border-left-color: #f56c6c;
}

.custom-message-info {
  border-left-color: #909399;
}

/* 进度条使用 ::after 伪类 */
.custom-message::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: message-progress linear;
  animation-duration: var(--message-duration, 3000ms);
}

.custom-message-success::after {
  background-color: rgba(103, 194, 58, 0.6);
}

.custom-message-warning::after {
  background-color: rgba(230, 162, 60, 0.6);
}

.custom-message-error::after {
  background-color: rgba(245, 108, 108, 0.6);
}

.custom-message-info::after {
  background-color: rgba(144, 147, 153, 0.6);
}

@keyframes message-progress {
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
}

/* 修改原有的背景图层，改为只在暗色主题下显示 */
.dark-theme .message-page::before {
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: radial-gradient(
    circle at center,
    rgba(135, 206, 235, 0.4) 0%,
    rgba(135, 206, 235, 0.15) 40%,
    rgba(0, 0, 0, 0.95) 100%
  );
  z-index: 1;
  animation: pulse 8s ease-in-out infinite;
}

/* 优化光球动画 */
@keyframes pulse {
  0% {
    opacity: 0.85;
    transform: scale(1);
  }
  50% {
    opacity: 1;
    transform: scale(1.03);
  }
  100% {
    opacity: 0.85;
    transform: scale(1);
  }
}

/* 修改暗色主题下的留言板背景 */
.dark-theme .comment-section {
  background: #0e0e0e !important;
  border-color: rgba(135, 206, 235, 0.25);
}

.message-header {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
  background: transparent;
  z-index: 2;
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.parallax-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  width: 100%;
  height: 100vh;
  background-image: url('/background/gqj.jpg');
  background-size: cover;
  background-position: center;
  transform: translateY(0);
  will-change: transform;
  z-index: 0;
  margin: 0;
  padding: 0;
  overflow: hidden;
  box-sizing: border-box;
}

/* 确保其他内容在背景之上 */
.center-input,
.danmaku-container {
  position: relative;
  z-index: 1;
}

/* 添加渐变遮罩 */
.message-header::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.3),
    rgba(0, 0, 0, 0.5)
  );
  z-index: 1;
  pointer-events: none;
}

.header-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
}

.danmaku-container {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  z-index: 3;
  overflow: hidden;
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
  cursor: pointer;
  font-size: 0.9rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  will-change: transform;
  z-index: 999;
}

/* 修改悬停效果 */
.danmaku-item:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* 添加动画暂停效果到父元素 */
.danmaku-container:hover .danmaku-item {
  animation-play-state: running;
}

.danmaku-container:hover .danmaku-item:hover {
  animation-play-state: paused;
}

/* 添加头像样式 */
.danmaku-avatar {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.danmaku-avatar img {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
}

.comment-section {
  position: relative;
  z-index: 3;
  max-width: 800px;
  margin: 80px auto;
  padding: 20px;
  background-color: #ffffff !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.1);
  pointer-events: auto;
  box-sizing: border-box;
  width: calc(100% - 40px);
}

/* 修改标题和分割线样式 */
.comment-section::before {
  content: '留言板';
  display: block;
  font-size: 2.0rem;
  font-weight: 600;
  color: var(--text-primary);
  margin-top: 20px;
  margin-bottom: 30px;
  padding-bottom: 15px;
  text-align: center; /* 标题居中 */
}

/* 修改分割线图片样式 */
.comment-section::after {
  content: '';
  display: block;
  width: 90%;
  height: 20px;
  background: url('/Icon/line-b.png') no-repeat center;
  background-size: 100% 100%;
  margin: 45px 0;
  position: absolute;
  top: 50px;
  left: 50%;
  transform: translateX(-50%);
  min-width: 300px;
}

/* 暗色主题适配 */
.dark-theme .comment-section {
  background: #0e0e0e !important;
  border-color: rgba(135, 206, 235, 0.25);
}

/* 暗色主题下的标题和分割线 */
.dark-theme .comment-section::before {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 0 10px rgba(135, 206, 235, 0.3);
}

/* 暗色主题下的分割线图片 */
.dark-theme .comment-section::after {
  background-image: url('/Icon/line-w.png');
  background-size: 100% 100%;
}

/* 添加响应式适配 */
@media (max-width: 768px) {
  .comment-section::after {
    height: 15px;
    top: 45px;
    width: 90%;
    min-width: 250px;
  }
}

@media (max-width: 480px) {
  .comment-section::after {
    height: 12px;
    top: 40px;
    width: 90%;
    min-width: 200px;
  }
  
  .comment-section::before {
    font-size: 1.3rem; /* 减小标题字体大小 */
  }
}

/* 修改评论输入框样式 */
.comment-input {
  margin-bottom: 30px;
  background-color: #ffffff !important;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  padding: 16px;
}

.input-wrapper {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.comment-text {
  width: 95%;
  min-height: 80px;
  padding: 12px;
  border: none;
  border-radius: 6px;
  background: rgba(191, 231, 250, 0.3) !important;
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  transition: all 0.3s ease;
}

.comment-text:focus {
  outline: none;
  border-color: #ddd;
  background: #fff;
}

.comment-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.comment-tools {
  display: flex;
  gap: 12px;
}

.tool-button {
  padding: 6px;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tool-button:hover {
  color: #666;
}

.send-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: #fafafa;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid #eee;
}

.send-btn:hover {
  background: #f5f5f5;
  color: #333;
}

/* 修改评论列表样式 */
.comments-list {
  display: flex;
  flex-direction: column;
}

.comment-item {
  display: flex;
  gap: 12px;
  padding: 16px 0;
  border-bottom: 1px solid #f5f5f5;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-avatar img {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.comment-content {
  flex: 1;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-nickname {
  font-size: 14px;
  color: #666;
}

.comment-floor {
  font-size: 12px;
  color: #999;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-text {
  font-size: 14px;
  line-height: 1.6;
  color: #333;
  margin: 8px 0;
}

.comment-footer {
  margin-top: 8px;
  display: flex;
  gap: 16px;
}

.comment-action {
  font-size: 12px;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
}

.comment-action:hover {
  color: #666;
}

/* 回复列表样式 */
.replies-list {
  margin-top: 12px;
  padding-left: 16px;
  border-left: 2px solid var(--divider-color);
  background: var(--card-bg);
}

.reply-item {
  display: flex;
  gap: 8px;
  padding: 8px 0;
}

.reply-avatar img {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.reply-nickname {
  font-size: 13px;
  color: var(--text-color);
  font-weight: 500;
}

.reply-time {
  font-size: 12px;
  color: #999;
}

.reply-text {
  font-size: 13px;
  color: var(--text-color) !important;
  line-height: 1.5;
  padding: 8px 12px;
  border-radius: 8px;
  transition: background-color 0.3s ease;
}

/* 添加暗色模式下的文字颜色 */
.dark .reply-text {
  color: rgba(255, 255, 255, 0.95) !important;
}

/* 动画效果 */
.danmaku-enter-active {
  transition: opacity 0.5s ease;
}

.danmaku-leave-active {
  transition: opacity 0.5s ease;
  pointer-events: none;
}

.danmaku-enter-from,
.danmaku-leave-to {
  opacity: 0;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .message-header {
    height: 200px;
  }

  .comment-section {
    padding: 15px;
  }

  .letter-title {
    padding: 10px 0 20px;
    font-size: 20px;
    letter-spacing: 3px;
  }
}

/* 添加中央输入框样式 */
.center-input {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 3;
  text-align: center;
  width: 90%;
  max-width: 600px;
  pointer-events: auto;
}

.title {
  color: #fff;
  font-size: 2.5rem;
  margin-bottom: 20px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.input-container {
  position: relative;
  z-index: 1002;
  display: flex;
  align-items: center;
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(10px);
  border-radius: 30px;
  padding: 5px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  pointer-events: auto;
}

.message-input {
  flex: 1;
  background: transparent;
  border: none;
  padding: 15px 20px;
  font-size: 1.1rem;
  color: #fff;
  outline: none;
  pointer-events: auto;
  position: relative;
  z-index: 1000;
}

.message-input::placeholder {
  color: rgba(255, 255, 255, 0.8);
}

.submit-button {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  width: 45px;
  height: 45px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #fff;
  margin-right: 5px;
  transition: all 0.3s ease;
}

.submit-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

/* 暗色主题适配 */
.dark-theme .input-container {
  background: rgba(0, 0, 0, 0.3);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }

  .message-input {
    font-size: 1rem;
    padding: 12px 16px;
  }

  .submit-button {
    width: 40px;
    height: 40px;
  }
}

.comment-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

.comment-floor {
  font-size: 12px;
  color: #7c3aed;
  background: rgba(124, 58, 237, 0.1);
  padding: 2px 8px;
  border-radius: 12px;
}

/* 回复列表样式 */
.replies-list {
  margin-top: 12px;
  padding-left: 20px;
  border-left: 2px solid #f0f0f0;
}

.reply-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
}

.reply-avatar {
  width: 24px;
  height: 24px;
  border-radius: 50%;
  object-fit: cover;
}

.reply-content {
  flex: 1;
}

.reply-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
}

.reply-nickname {
  font-size: 13px;
  color: rgba(255, 255, 255, 0.95);
  font-weight: 500;
}

.reply-time {
  font-size: 12px;
  color: #666;
}

.reply-text {
  font-size: 13px;
  color: #333;
  line-height: 1.5;
}

/* 黑暗主题样式 */
:root {
  --bg-color: #fff;
  --text-color: #333;
  --text-secondary: #666;
  --text-tertiary: #999;
  --border-color: #eee;
  --input-bg: #e1f7ff;
  --card-bg: #ffffff;  /* 白天模式下纯白色 */
  --hover-bg: #f5f5f5;
  --divider-color: #f5f5f5;
}

.dark {
  --bg-color: #1a1a1a;
  --text-color: rgba(255, 255, 255, 0.95);          /* 主要文字颜色 */
  --text-secondary: rgba(255, 255, 255, 0.8);       /* 次要文字颜色 */
  --text-tertiary: rgba(255, 255, 255, 0.6);        /* 第三级文字颜色 */
  --border-color: #333;
  --input-bg: #2a2a2a;
  --card-bg: #2c2c2c;  /* 夜间模式下的高级灰 */
  --hover-bg: #2a2a2a;
  --divider-color: #333;
  --message-bg-image: url('/background/message-board-bg-dark.jpg');
}

/* 使用CSS变量 */
.message-page {
  background: var(--bg-color);
}

.comment-section {
  background: var(--card-bg);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.8);
}

.comment-input {
  background: var(--card-bg);
  border-color: var(--border-color);
}

.comment-text {
  background: var(--input-bg);
  color: var(--text-color);
}

.comment-text::placeholder {
  color: var(--text-secondary);
}

.send-btn {
  background: var(--hover-bg);
  color: var(--text-secondary);
  border-color: var(--border-color);
}

.comment-item {
  border-bottom-color: var(--divider-color);
}

.comment-nickname {
  color: var(--text-secondary);
}

.comment-text {
  color: var(--text-color);
}

.comment-time,
.comment-floor,
.comment-action {
  color: var(--text-tertiary);
}

.replies-list {
  border-left-color: var(--divider-color);
}

/* 移动端适配优化 */
@media (max-width: 768px) {
  .message-header {
    height: 50vh;
  }

  .comment-section {
    margin-top: 20px;
    padding: 15px;
    border-radius: 20px 20px 0 0;
  }

  .title {
    font-size: 1.8rem;
  }

  .input-container {
    padding: 3px;
  }

  .message-input {
    padding: 10px 15px;
    font-size: 0.9rem;
  }

  .submit-button {
    width: 36px;
    height: 36px;
  }

  .comment-input {
    margin-bottom: 20px;
    padding: 12px;
  }

  .comment-text {
    min-height: 60px;
    padding: 10px;
    font-size: 13px;
  }

  .comment-avatar img {
    width: 32px;
    height: 32px;
  }

  .comment-nickname {
    font-size: 13px;
  }

  .comment-floor,
  .comment-time,
  .comment-action {
    font-size: 11px;
  }

  .replies-list {
    padding-left: 12px;
    margin-top: 8px;
  }

  .reply-avatar img {
    width: 20px;
    height: 20px;
  }
}

/* 适配超小屏幕 */
@media (max-width: 320px) {
  .comment-section {
    padding: 12px;
  }

  .title {
    font-size: 1.5rem;
  }

  .comment-text {
    width: 90%;
  }

  .comment-tools {
    gap: 8px;
  }

  .send-btn {
    padding: 4px 12px;
    font-size: 12px;
  }
}

/* 添加收起按钮样式 */
.close-button {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 120px;
  height: 32px;
  border-radius: 0 0 16px 16px;
  background: var(--card-bg);
  border: 1px solid var(--border-color);
  border-top: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: var(--text-secondary);
  transition: all 0.3s ease;
  opacity: 0;
  transform: translate(-50%, -100%);
  gap: 6px;
  font-size: 14px;
}

.comment-section.is-opened .close-button {
  opacity: 1;
  transform: translate(-50%, 0);
}

.close-button:hover {
  background: var(--hover-bg);
  color: var(--text-color);
  height: 36px;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .close-button {
    width: 100px;
    height: 28px;
    font-size: 13px;
  }
  
  .close-button:hover {
    height: 32px;
  }
}

/* 添加回复输入框样式 */
.reply-input {
  margin-top: 12px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.05); /* 轻微的阴影效果 */
  border-radius: 8px;
}

.reply-textarea {
  width: 100%;
  min-height: 60px;
  padding: 10px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  background: var(--card-bg);
  resize: none;
  font-size: 14px;
  line-height: 1.6;
  color: var(--text-color);
}

.reply-textarea:focus {
  outline: none;
  border-color: var(--text-secondary);
}

.reply-controls {
  display: flex;
  justify-content: flex-end;
  margin-top: 8px;
}

.reply-btn {
  padding: 6px 16px;
  border: none;
  border-radius: 4px;
  background: var(--hover-bg);
  color: var(--text-secondary);
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 6px;
  border: 1px solid var(--border-color);
}

.reply-btn:hover {
  background: var(--bg-color);
  color: var(--text-color);
}

/* 修改点赞按钮样式 */
.comment-action.liked {
  color: #7c3aed;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .reply-input {
    padding: 8px;
  }
  
  .reply-textarea {
    min-height: 50px;
    font-size: 13px;
  }
  
  .reply-btn {
    padding: 4px 12px;
    font-size: 13px;
  }
}

/* 修改楼层标签样式 */
.comment-floor,
.reply-floor {
  font-size: 12px;
  color: var(--text-secondary);
  padding: 2px 8px;
  border-radius: 12px;
  transition: background-color 0.3s ease;
}

/* 添加回复信息样式 */
.reply-info {
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 深色模式适配 */
.dark-theme .comment-floor,
.dark-theme .reply-floor {
  opacity: 0.8;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .comment-floor,
  .reply-floor {
    font-size: 11px;
    padding: 1px 6px;
  }
}

/* 暗色模式下的特定样式覆盖 */
.dark-theme .comment-nickname {
  color: rgba(255, 255, 255, 0.9);
}

.dark-theme .comment-text,
.dark-theme .reply-text {
  color: rgba(255, 255, 255, 0.95) !important;
}

.dark-theme .comment-time,
.dark-theme .reply-time {
  color: rgba(255, 255, 255, 0.6);
}

.dark-theme .comment-action {
  color: rgba(255, 255, 255, 0.7);
}

.dark-theme .comment-action:hover {
  color: rgba(255, 255, 255, 0.9);
}

.dark-theme .tool-button {
  color: rgba(255, 255, 255, 0.7);
}

.dark-theme .tool-button:hover {
  color: rgba(255, 255, 255, 0.9);
}

.dark-theme .send-btn,
.dark-theme .reply-btn {
  color: rgba(255, 255, 255, 0.8);
  border-color: rgba(255, 255, 255, 0.2);
}

.dark-theme .send-btn:hover,
.dark-theme .reply-btn:hover {
  color: rgba(255, 255, 255, 0.95);
  background: rgba(255, 255, 255, 0.1);
}

.dark-theme .comment-text::placeholder,
.dark-theme .reply-textarea::placeholder {
  color: rgba(255, 255, 255, 0.5);
}

.dark-theme .reply-nickname {
  color: rgba(255, 255, 255, 0.9);
}

.dark-theme .comment-floor,
.dark-theme .reply-floor {
  color: rgba(255, 255, 255, 0.8);
}

/* 点赞按钮在暗色模式下的样式 */
.dark-theme .comment-action.liked {
  color: #a78bfa; /* 更亮的紫色 */
}

/* 暗色主题适配 */
.dark-theme .comment-section,
.dark-theme .comment-input {
  background: #0e0e0e !important; /* 高级灰 */
}

.dark-theme .reply-input {
  background: rgba(255, 255, 255, 0.05) !important;
}

/* 暗色主题背景切换 */
.dark-theme .message-page {
  --message-bg-image: url('/background/message-board-bg-dark.jpg');
  background-attachment: scroll;
}

/* 滚动提示样式 */
.scroll-hint {
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  color: #fff;
  z-index: 2;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

.scroll-hint:hover {
  opacity: 1;
}

.scroll-text {
  font-size: 18px;
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 8px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.scroll-arrow {
  animation: bounce 2s infinite;
  font-size: 24px;
}

@keyframes bounce {
  0%, 20%, 50%, 80%, 100% {
    transform: translateY(0);
  }
  40% {
    transform: translateY(-10px);
  }
  60% {
    transform: translateY(-5px);
  }
}

/* 移动端适配 */
@media (max-width: 768px) {
  .scroll-hint {
    bottom: 30px;
  }
  
  .scroll-text {
    font-size: 16px;
  }
  
  .scroll-arrow {
    font-size: 20px;
  }
}

/* 隐藏文件输入框 */
.image-input {
  display: none;
}

/* 图片预览样式 */
.image-preview {
  position: relative;
  margin-top: 10px;
  max-width: 200px;
  border-radius: 8px;
  overflow: hidden;
}

.image-preview img {
  width: 100%;
  height: auto;
  display: block;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.remove-image:hover {
  background: rgba(0, 0, 0, 0.7);
}

/* 表情选择器样式 */
.emoji-picker {
  position: absolute;
  bottom: 100%;
  left: 0;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 10px;
  margin-bottom: 10px;
  z-index: 1000;
}

.emoji-container {
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 5px;
}

.emoji {
  font-size: 1.5rem;
  cursor: pointer;
  padding: 5px;
  border-radius: 4px;
  transition: all 0.3s ease;
  text-align: center;
}

.emoji:hover {
  background: rgba(0, 0, 0, 0.1);
}

/* 暗色主题适配 */
.dark-theme .emoji-picker {
  background: #1a1a1a;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.dark-theme .emoji:hover {
  background: rgba(255, 255, 255, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .emoji-container {
    grid-template-columns: repeat(6, 1fr);
  }
  
  .emoji {
    font-size: 1.2rem;
  }
}

/* 添加评论图片样式 */
.comment-image {
  margin: 10px 0;
  max-width: 300px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.comment-img {
  width: 100%;
  height: auto;
  display: block;
  cursor: pointer;
  transition: transform 0.3s ease;
}

.comment-img:hover {
  transform: scale(1.02);
}

/* 暗色主题适配 */
.dark-theme .comment-image {
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .comment-image {
    max-width: 100%;
  }
}

/* 添加弹幕动画 */
@keyframes danmakuMove {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(-150vw); /* 确保弹幕完全移出屏幕 */
  }
}

.danmaku-item {
  position: absolute;
  white-space: nowrap;
  padding: 4px 12px;
  border-radius: 20px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(5px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  pointer-events: auto;
  cursor: pointer;
  font-size: 0.9rem;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  will-change: transform;
  z-index: 999;
}

/* 修改悬停效果 */
.danmaku-item:hover {
  background: rgba(0, 0, 0, 0.8);
}

/* 移除之前的动画暂停相关代码 */

/* 添加分页样式 */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 30px;
  padding: 20px 0;
}

.page-btn {
  min-width: 36px;
  height: 36px;
  border: 1px solid var(--border-color);
  background: var(--card-bg);
  color: var(--text-color);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 14px;
}

.page-btn:hover:not(:disabled) {
  background: var(--hover-bg);
  border-color: var(--text-secondary);
}

.page-btn.active {
  background: var(--primary-color, #7c3aed);
  color: white;
  border-color: var(--primary-color, #7c3aed);
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* 暗色主题适配 */
.dark-theme .page-btn {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(255, 255, 255, 0.1);
}

.dark-theme .page-btn:hover:not(:disabled) {
  background: rgba(255, 255, 255, 0.1);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .page-btn {
    min-width: 32px;
    height: 32px;
    font-size: 13px;
  }
}
</style>

<!-- 添加全局样式，确保消息框样式能应用于动态创建的元素 -->
<style>
/* 自定义消息框样式 */
.custom-message-container {
  position: fixed;
  bottom: 20px;
  right: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  z-index: 9999;
  max-width: 350px;
}

.custom-message {
  background: rgba(40, 45, 60, 0.85);
  color: white;
  padding: 15px 20px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
  transform: translateX(120%);
  opacity: 0;
  transition: all 0.3s cubic-bezier(0.68, -0.55, 0.265, 1.55);
  position: relative;
  backdrop-filter: blur(8px);
  border-left: 4px solid transparent;
  overflow: hidden;
}

.custom-message.show {
  transform: translateX(0);
  opacity: 1;
}

.custom-message.leave {
  transform: translateX(120%);
  opacity: 0;
}

.custom-message-content {
  font-size: 14px;
  line-height: 1.5;
}

.custom-message-success {
  border-left-color: #67c23a;
}

.custom-message-warning {
  border-left-color: #e6a23c;
}

.custom-message-error {
  border-left-color: #f56c6c;
}

.custom-message-info {
  border-left-color: #909399;
}

/* 进度条使用 ::after 伪类 */
.custom-message::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  animation: message-progress linear;
  animation-duration: var(--message-duration, 3000ms);
}

.custom-message-success::after {
  background-color: rgba(103, 194, 58, 0.6);
}

.custom-message-warning::after {
  background-color: rgba(230, 162, 60, 0.6);
}

.custom-message-error::after {
  background-color: rgba(245, 108, 108, 0.6);
}

.custom-message-info::after {
  background-color: rgba(144, 147, 153, 0.6);
}

@keyframes message-progress {
  0% {
    width: 100%;
  }
  100% {
    width: 0;
  }
}
</style> 