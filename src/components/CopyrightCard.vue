<template>
  <div class="copyright-card">
    <div class="card-content">
      <div class="card-header">
        <Icon icon="mdi:copyright" class="header-icon" />
        <span class="header-title">版权声明</span>
      </div>
      <div class="Title">
          <router-link :to="`/article/${article.id}`" class="article-link">
            {{ article.title }}
          </router-link>
        </div>
      <div class="info-list">
        <div class="info-item">
          <span class="icon-label">
            <Icon icon="mdi:account" class="item-icon" />
            <span class="item-label">文章作者：</span>
          </span>
          <span class="item-author-value">{{ article.author || '匿名' }}</span>
        </div>
        <div class="info-item">
          <span class="icon-label">
            <Icon icon="mdi:calendar" class="item-icon" />
            <span class="item-label">发布时间：</span>
          </span>
          <span class="item-create-time-value">{{ formatDate(article.createTime) }}</span>
        </div>
        <div class="info-item">
          <span class="icon-label">
            <Icon icon="mdi:calendar" class="item-icon" />
            <span class="item-label">更新时间：</span>
          </span>
          <span class="item-create-time-value">{{ formatDate(article.updateTime) }}</span>
        </div>
        <div class="info-item">
          <span class="icon-label">
            <Icon icon="mdi:license" class="item-icon" />
            <span class="item-label">许可协议：</span>
          </span>
          <a :href="getLicenseLink()" target="_blank" class="license-link">
            {{ article.license || 'All Rights Reserved' }}
          </a>
        </div>
      </div>
      <div class="license-notice">
        本文采用{{ article.license || 'All Rights Reserved' }}协议进行许可。转载请注明来源：{{ article.author || '本站' }}的博客。
      </div>
    </div>
    
    <!-- 添加分享区域 -->
    <div class="share-section">
      <!-- 文章标签 -->
      <div class="article-tags">
        <Icon icon="mdi:tag-multiple" class="tags-icon" />
        <div class="tags-list">
          <span v-for="tag in article.tags" 
                :key="tag" 
                class="tag-item">
            {{ tag }}
          </span>
        </div>
      </div>
      
      <!-- 分享按钮 -->
      <div class="share-buttons">
        <div class="share-title">
          <Icon icon="mdi:share-variant" class="share-icon" />
          分享到
        </div>
        <div class="social-buttons">
          <button class="social-btn weibo" @click="shareToWeibo">
            <Icon icon="mdi:sina-weibo" />
          </button>
          <button class="social-btn facebook" @click="shareToFacebook">
            <Icon icon="mdi:facebook" />
          </button>
          <button class="social-btn twitter" @click="shareToTwitter">
            <Icon icon="mdi:twitter" />
          </button>
          <button class="social-btn wechat" @click="showQRCode('wechat')">
            <Icon icon="mdi:wechat" />
          </button>
          <button class="social-btn qq" @click="showQRCode('qq')">
            <Icon icon="mdi:qqchat" />
          </button>
        </div>
      </div>
    </div>
  </div>

  <!-- 二维码弹窗 -->
  <div v-if="showQR" class="qr-modal" @click="showQR = false">
    <div class="qr-container" @click.stop>
      <div class="qr-title">{{ qrType === 'wechat' ? '微信' : 'QQ' }}扫码分享</div>
      <canvas ref="qrCodeRef" class="qr-code"></canvas>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import { ref, nextTick } from 'vue'
import QRCode from 'qrcode'
import { formatDate } from '../utils/formatDate'

const props = defineProps<{
  article: {
    id: number
    title: string
    author?: string
    createTime: string
    updateTime: string
    license?: string
    description?: string
    tags?: string[]
  }
}>()

const showQR = ref(false)
const qrType = ref<'wechat' | 'qq'>('wechat')
const qrCodeRef = ref<HTMLCanvasElement | null>(null)

const getLicenseLink = () => {
  const license = props.article.license
  if (license?.includes('CC BY-NC-SA')) {
    return 'https://creativecommons.org/licenses/by-nc-sa/4.0/'
  }
  return '#'
}

// 生成分享链接
const getShareLink = () => {
  const url = encodeURIComponent(window.location.href)
  const title = encodeURIComponent(props.article.title)
  const desc = encodeURIComponent(props.article.description || '')
  return { url, title, desc }
}

// 分享到微博
const shareToWeibo = () => {
  const { url, title, desc } = getShareLink()
  window.open(`http://service.weibo.com/share/share.php?url=${url}&title=${title}${desc}`)
}

// 分享到Twitter
const shareToTwitter = () => {
  const { url, title } = getShareLink()
  window.open(`https://twitter.com/intent/tweet?url=${url}&text=${title}`)
}

// 添加 Facebook 分享函数
const shareToFacebook = () => {
  const { url, title } = getShareLink()
  window.open(`https://www.facebook.com/sharer/sharer.php?u=${url}&t=${title}`)
}

// 显示二维码
const showQRCode = async (type: 'wechat' | 'qq') => {
  qrType.value = type
  showQR.value = true
  
  await nextTick() // 等待 DOM 更新
  
  if (qrCodeRef.value) {
    const { url } = getShareLink()
    try {
      await QRCode.toCanvas(qrCodeRef.value, url, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000',
          light: '#fff'
        }
      })
    } catch (err) {
      console.error('生成二维码失败:', err)
    }
  }
}
</script>

<style scoped>
.copyright-card {
  font-family: var(--font-chinese-primary);
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(0, 168, 255, 0.2);
  margin-top: 20px;
  position: relative;
  overflow: hidden;
}

.copyright-card::before {
  content: "\f25e"; /* Font Awesome 的 CC 图标 Unicode */
  position: absolute;
  right: -15px;
  top: -120px;
  font-size: 310px;
  font-family: "Font Awesome 5 Brands"; /* 使用 Font Awesome 字体 */
  opacity: 0.5;
  z-index: -1; /* 改为负值，确保在内容下层 */
  filter: blur(5px);
  transition: 0.5s ease-in-out;
  color: rgba(255, 255, 255, 0.5);
  pointer-events: none; /* 禁用伪元素的事件响应 */
}

.copyright-card:hover::before {
  filter: blur(0);
  opacity: 0.9;
  transform: scale(1.05);
}

.card-content,
.share-section {
  position: relative;
  z-index: 1; /* 确保内容在上层 */
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: -12px;
  
  .header-icon {
    font-size: 1.5em;
    color: #FF5722;
  }
  
  .header-title {
    font-size: 1.4em;
    color: #fff;
    font-weight: bold;
  }
}

.info-list {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr 1.5fr 1.5fr;
  gap: 12px;
}

.info-item {
  display: flex;
  align-items: left;
  flex-direction: column;
  gap: 0px;
  color: rgba(255, 255, 255, 0.9);
  
  .item-icon {
    font-size: 1.4em;
    color: #2196F3;
  }
  
  .item-label {
    font-size: 1.0em;
    color: rgba(255, 255, 255, 0.7);
    white-space: nowrap;
  }
  
  .item-author-value {
    margin-top: -20px;
    font-size: 2.2em;
    color: #00f7ff;
  }

  .item-create-time-value {
    margin-top: -2px;
    font-size: 1.3em;
    color: #21b1f3;
  }
}

.icon-label {
  display: flex;
  align-items: center;
  gap: 8px;
}

.article-link {
  color: #ffffff;
  font-size: 3rem;
  text-decoration: none;
  transition: all 0.3s ease;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  
  &:hover {
    color: #04e2ff;
    /* text-decoration: underline; */
  }
}

.license-link {
  font-size: 1.2em;
  color: #21b1f3;
  text-decoration: none;
  transition: all 0.3s ease;
  
  &:hover {
    color: #13efff;
    text-decoration: underline;
  }
}

.license-notice {
  margin-top: 16px;
  width: 70%;
  padding: 12px;
  background: rgba(0, 132, 255, 0.397);
  border-radius: 8px;
  color: rgb(255, 255, 255);
  font-size: 1.1em;
  line-height: 1.6;
  grid-column: 1 / -1;
}

.share-section {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.article-tags {
  display: flex;
  align-items: center;
  gap: 12px;
  
  .tags-icon {
    color: #00d9ff;
    font-size: 2.0em;
  }
  
  .tags-list {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  
  .tag-item {
    padding: 4px 12px;
    border: 2px solid rgba(33, 149, 243, 0.973);
    /* background: rgba(33, 150, 243, 0.1); */
    border-radius: 20px;
    color: #ffffff;
    font-size: 0.8em;
    transition: all 0.3s ease;
    
    &:hover {
      color: #fff;
      background: rgba(33, 149, 243, 0.973);
      transform: translateY(-2px);
    }
  }
}

.share-buttons {
  display: flex;
  align-items: center;
  gap: 16px;
  
  .share-title {
    display: flex;
    align-items: center;
    gap: 6px;
    color: rgba(255, 255, 255, 0.7);
    
    .share-icon {
      color: #2196F3;
    }
  }
  
  .social-buttons {
    display: flex;
    gap: 12px;
  }
  
  .social-btn {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.2em;
    cursor: pointer;
    transition: all 0.3s ease;
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    
    &:hover {
      transform: translateY(-3px);
    }
    
    &.weibo:hover {
      background: #E6162D;
    }
    
    &.facebook:hover {
      background: #1877F2;
    }
    
    &.twitter:hover {
      background: #1DA1F2;
    }
    
    &.wechat:hover {
      background: #07C160;
    }
    
    &.qq:hover {
      background: #12B7F5;
    }
  }
}

.qr-modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.qr-container {
  background: #fff;
  padding: 24px;
  border-radius: 12px;
  text-align: center;
  
  .qr-title {
    color: #333;
    margin-bottom: 16px;
    font-size: 1.1em;
  }
  
  .qr-code {
    background: #fff;
    padding: 12px;
    border-radius: 8px;
  }
}

/* 字体定义已移至全局配置 */
</style> 