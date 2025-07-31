<template>
  <div class="share-page">
    <!-- 添加顶部横幅 -->
    <div class="share-banner">
      <div class="banner-content">
        <h1 class="banner-title">分享 & 关注</h1>
        <p class="banner-subtitle">关注博客动态，分享精彩内容</p>
      </div>
    </div>

    <div class="share-container">
      <!-- 分享说明 -->
      <div class="page-header">
        <p class="description">非常感谢您的访问与支持！您可以通过以下方式关注我的动态或分享本站内容给更多朋友。</p>
      </div>

      <!-- 社交平台部分 - 链接改为两列排列 -->
      <div class="share-section">
        <h2 class="section-title">社交平台</h2>
        <div class="link-grid">
          <ShareLink 
            icon="mdi:github" 
            title="Danny's GitHub" 
            description="关注我的GitHub，查看我的开源项目和代码" 
            link="https://github.com/DannySummer" 
            :icon-size="24"
          />
          
          <ShareLink 
            icon="mdi:bilibili" 
            title="B站账号" 
            description="关注我的B站，获取更多视频内容" 
            link="https://space.bilibili.com/123456789" 
            :icon-size="24"
          />
          
          <ShareLink 
            icon="mdi:wechat" 
            title="微信公众号" 
            description="扫描二维码关注我的公众号" 
            link="#" 
            :icon-size="24"
            @click.prevent="showQRCode('wechat')"
          />
          
          <ShareLink 
            icon="mdi:qqchat" 
            title="QQ交流群" 
            description="加入QQ交流群，与志同道合的朋友一起讨论" 
            link="#" 
            :icon-size="24"
            @click.prevent="showQRCode('qq')"
          />
        </div>
      </div>

      <!-- 订阅与联系部分 - 链接改为两列排列 -->
      <div class="share-section">
        <h2 class="section-title">订阅 & 联系</h2>
        <div class="link-grid">
          <ShareLink 
            icon="mdi:rss" 
            title="📡 RSS订阅" 
            description="订阅博客的RSS feed，获取最新文章更新" 
            link="/rss.xml" 
            :icon-size="24"
          />
          
          <ShareLink 
            icon="mdi:email" 
            title="邮件订阅" 
            description="输入邮箱订阅最新文章，定期收到更新" 
            link="#" 
            :icon-size="24"
            @click.prevent="showEmailSubscribe"
          />
          
          <ShareLink 
            icon="mdi:email-outline" 
            title="联系我" 
            description="有任何问题或建议，请发送邮件联系我" 
            :link="`mailto:${emailAddress}`" 
            :icon-size="24"
          />

          <ShareLink 
            icon="mdi:web" 
            title="友链交换" 
            description="欢迎与我交换友情链接，共同成长" 
            link="/friends" 
            :icon-size="24"
          />
          
          <ShareLink 
            icon="mdi:heart" 
            title="赞赏支持" 
            description="如果您喜欢我的内容，可以请我喝杯咖啡" 
            link="#" 
            :icon-size="24"
            @click.prevent="showQRCode('support')"
          />
          
          <ShareLink 
            icon="mdi:rss-box" 
            title="订阅源" 
            description="通过RSS订阅源获取最新内容" 
            link="/atom.xml" 
            :icon-size="24"
          />
        </div>
      </div>

      <!-- 分享本站按钮区域 -->
      <div class="share-section">
        <h2 class="section-title">分享本站</h2>
        <div class="share-buttons">
          <button @click="copyLink" class="share-button">
            <Icon icon="mdi:content-copy" :width="20" :height="20" />
            <span>复制链接</span>
          </button>
          <button @click="shareToWechat" class="share-button">
            <Icon icon="mdi:wechat" :width="20" :height="20" />
            <span>微信分享</span>
          </button>
          <button @click="shareToQQ" class="share-button">
            <Icon icon="mdi:qqchat" :width="20" :height="20" />
            <span>QQ分享</span>
          </button>
          <button @click="shareToWeibo" class="share-button">
            <Icon icon="mdi:sina-weibo" :width="20" :height="20" />
            <span>微博分享</span>
          </button>
        </div>
      </div>

      <!-- 推荐链接部分 - 两列排列 -->
      <div class="share-section">
        <h2 class="section-title">推荐链接</h2>
        <div class="link-grid">
          <ShareLink 
            icon="mdi:github" 
            title="hexo-circle-of-friends" 
            description="Python gets the friend's articles from hexo's friend-links" 
            link="https://github.com/Rock-Candy-Tea/hexo-circle-of-friends" 
            :icon-size="24"
          />
          
          <ShareLink 
            icon="mdi:vuejs" 
            title="Vue.js官方文档" 
            description="渐进式JavaScript框架" 
            link="https://vuejs.org/" 
            :icon-size="24"
          />
          
          <ShareLink 
            icon="mdi:language-javascript" 
            title="MDN Web Docs" 
            description="JavaScript参考文档" 
            link="https://developer.mozilla.org/" 
            :icon-size="24"
          />
          
          <ShareLink 
            icon="mdi:react" 
            title="React文档" 
            description="用于构建用户界面的JavaScript库" 
            link="https://reactjs.org/" 
            :icon-size="24"
          />
        </div>
      </div>

      <!-- 底部信息 -->
      <div class="share-footer">
        <p class="quote">感谢您的关注与支持！</p>
        <p class="quote">「分享创造快乐，连接成就价值」</p>
      </div>
    </div>

    <!-- QR Code Modal -->
    <div class="modal" v-if="qrCodeVisible">
      <div class="modal-content">
        <div class="modal-header">
          <h3>{{ qrCodeTitle }}</h3>
          <button class="close-btn" @click="qrCodeVisible = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <div class="qr-code-container">
            <img :src="qrCodeImage" alt="QR Code" class="qr-code-image" />
            <p>{{ qrCodeDescription }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Email Subscribe Modal -->
    <div class="modal" v-if="emailModalVisible">
      <div class="modal-content">
        <div class="modal-header">
          <h3>邮件订阅</h3>
          <button class="close-btn" @click="emailModalVisible = false">
            <Icon icon="mdi:close" />
          </button>
        </div>
        <div class="modal-body">
          <p class="modal-description">输入您的邮箱地址，订阅最新文章通知</p>
          <div class="email-form">
            <input 
              type="email" 
              v-model="subscriberEmail" 
              placeholder="your@email.com" 
              class="email-input"
            />
            <button class="submit-btn" @click="submitEmailSubscription">
              订阅
            </button>
          </div>
          <p class="privacy-note">我们不会向您发送垃圾邮件，您可以随时取消订阅。</p>
        </div>
      </div>
    </div>

    <!-- 使用消息通知组件 -->
    <MessageNotification ref="notification" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Icon } from '@iconify/vue';
import ShareLink from '../components/ShareLink.vue';
import MessageNotification from '../components/MessageNotification.vue';

// 站点信息
const siteUrl = 'https://www.dannysummer.asia';
const emailAddress = 'contact@dannysummer.asia';

// QR code 相关状态
const qrCodeVisible = ref(false);
const qrCodeImage = ref('');
const qrCodeTitle = ref('');
const qrCodeDescription = ref('');

// MessageNotification组件引用
const notification = ref<InstanceType<typeof MessageNotification> | null>(null);

// Email 订阅相关状态
const emailModalVisible = ref(false);
const subscriberEmail = ref('');
const subscriptionStatus = ref('');

// 显示二维码
const showQRCode = (type: string) => {
  if (type === 'wechat') {
    qrCodeTitle.value = '微信公众号';
    qrCodeImage.value = '/images/wechat-qrcode.jpg'; // 替换为实际图片路径
    qrCodeDescription.value = '扫描二维码，关注我的微信公众号';
  } else if (type === 'qq') {
    qrCodeTitle.value = 'QQ交流群';
    qrCodeImage.value = '/images/qq-qrcode.jpg'; // 替换为实际图片路径
    qrCodeDescription.value = '扫描二维码，加入QQ交流群';
  } else if (type === 'support') {
    qrCodeTitle.value = '赞赏支持';
    qrCodeImage.value = '/images/support-qrcode.jpg'; // 替换为实际图片路径
    qrCodeDescription.value = '如果您喜欢我的内容，可以请我喝杯咖啡';
  }
  qrCodeVisible.value = true;
};

// 显示邮件订阅框
const showEmailSubscribe = () => {
  emailModalVisible.value = true;
};

// 提交邮件订阅
const submitEmailSubscription = async () => {
  if (!subscriberEmail.value || !validateEmail(subscriberEmail.value)) {
    notification.value?.addMessage('请输入有效的邮箱地址', 'warning');
    return;
  }
  
  try {
    // 这里添加实际的订阅API调用
    // const response = await fetch('/api/subscribe', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //   },
    //   body: JSON.stringify({ email: subscriberEmail.value }),
    // });
    
    // if (response.ok) {
    //   subscriptionStatus.value = 'success';
    //   notification.value?.addMessage('订阅成功，感谢您的支持！', 'success');
    //   setTimeout(() => {
    //     emailModalVisible.value = false;
    //     subscriberEmail.value = '';
    //   }, 2000);
    // } else {
    //   subscriptionStatus.value = 'error';
    //   notification.value?.addMessage('订阅失败，请稍后重试', 'error');
    // }
    
    // 模拟成功
    subscriptionStatus.value = 'success';
    notification.value?.addMessage('订阅成功，感谢您的支持！', 'success');
    emailModalVisible.value = false;
    subscriberEmail.value = '';
  } catch (error) {
    console.error('订阅失败:', error);
    subscriptionStatus.value = 'error';
    notification.value?.addMessage('订阅失败，请稍后重试', 'error');
  }
};

// 验证邮箱格式
const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

// 复制链接
const copyLink = () => {
  navigator.clipboard.writeText(siteUrl).then(() => {
    notification.value?.addMessage('链接已复制到剪贴板！', 'success');
  }).catch(err => {
    console.error('复制失败:', err);
    notification.value?.addMessage('复制失败，请手动复制', 'error');
  });
};

// 微信分享
const shareToWechat = () => {
  showQRCode('wechat');
};

// QQ分享
const shareToQQ = () => {
  const shareUrl = `https://connect.qq.com/widget/shareqq/index.html?url=${encodeURIComponent(siteUrl)}&title=${encodeURIComponent('Danny\'s Blog')}&summary=${encodeURIComponent('技术分享与生活点滴')}`;
  window.open(shareUrl, '_blank');
  notification.value?.addMessage('已打开QQ分享页面', 'info');
};

// 微博分享
const shareToWeibo = () => {
  const shareUrl = `https://service.weibo.com/share/share.php?url=${encodeURIComponent(siteUrl)}&title=${encodeURIComponent('Danny\'s Blog - 技术分享与生活点滴')}`;
  window.open(shareUrl, '_blank');
  notification.value?.addMessage('已打开微博分享页面', 'info');
};
</script>

<style scoped>
/* 整体页面背景 */
.share-page {
  background-image: url('/background/startBg/start-bg2.png'); /* 替换为您的背景图片 */
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding: 0;
  position: relative;
}

/* 为背景添加遮罩，提高文字可读性 */
.share-page::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.2);
  z-index: 0;
}

/* 顶部横幅 */
.share-banner {
  position: relative;
  /* background-image: linear-gradient(120deg, #0d3d21 0%, #c2e9fb 100%); */
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 80px;
  overflow: hidden;
  z-index: 1;
}

.banner-content {
  text-align: center;
  color: white;
  z-index: 2;
}

.banner-title {
  font-size: 42px;
  font-weight: 700;
  margin-bottom: 12px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.banner-subtitle {
  font-size: 18px;
  font-weight: 500;
}

/* 为横幅添加装饰元素 */
.share-banner::before {
  content: '';
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('/public/background/transition-banner-bg.jpg'); /* 可选的图案纹理*/
  background-size: cover;
  opacity: 0.8;
  z-index: 1;
}

/* 主容器 */
.share-container {
  position: relative;
  max-width: 1200px;
  margin: 0 auto 0px;
  padding: 40px;
  background-color: var(--background-color);
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
}

.description {
  font-size: 36px;
  color: #ffffff;
  line-height: 1.6;
  max-width: 800px;
  margin: 0 auto;
}

/* 链接网格布局 - 两列 */
.link-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

/* 分享部分样式优化 */
.share-section {
  margin-bottom: 50px;
}

.section-title {
  font-size: 22px;
  font-weight: 600;
  margin-bottom: 25px;
  color: #ffffff;
  position: relative;
  padding-left: 16px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 4px;
  height: 24px;
  background-color: #49b1f5;
  border-radius: 2px;
}

/* 分享按钮优化 */
.share-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.share-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 18px;
  border-radius: 8px;
  background-color: #f5f5f5;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 15px;
  color: #333;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.share-button:hover {
  background-color: #42c9ff;
  color: #ffffff;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* 底部信息 */
.share-footer {
  text-align: center;
  margin: 40px;
  padding-top: 20px;
  border-top: 1px solid #eee;
  color: #666;
}

.quote {
  font-style: italic;
  color: #dadada;
  margin-top: 8px;
}

/* 弹窗样式优化 */
.modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 100;
  backdrop-filter: blur(5px);
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.15);
  width: 100%;
  max-width: 420px;
  animation: modal-fade-in 0.3s ease;
}

@keyframes modal-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 18px 24px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #333;
}

.close-btn {
  background: none;
  border: none;
  font-size: 22px;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
}

.close-btn:hover {
  color: #333;
}

.modal-body {
  padding: 30px;
}

.qr-code-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.qr-code-image {
  width: 220px;
  height: 220px;
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.modal-description {
  margin-bottom: 20px;
  text-align: center;
  color: var(--text-color)!important;
}

.email-form {
  display: flex;
  margin-bottom: 20px;
}

.email-input {
  flex: 1;
  padding: 12px 15px;
  border: 1px solid #ddd;
  border-radius: 4px 0 0 4px;
  font-size: 15px;
  transition: border-color 0.3s;
}

.email-input:focus {
  outline: none;
  border-color: #49b1f5;
}

.submit-btn {
  padding: 12px 20px;
  background-color: #49b1f5;
  color: white;
  border: none;
  border-radius: 0 4px 4px 0;
  cursor: pointer;
  font-size: 15px;
  transition: background-color 0.3s;
}

.submit-btn:hover {
  background-color: #36a0e8;
}

.privacy-note {
  font-size: 13px;
  color: #999;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .share-container {
    padding: 30px;
    max-width: 90%;
  }
  
  .link-grid {
    gap: 12px;
  }
  
  .banner-title {
    font-size: 36px;
  }
}

@media (max-width: 768px) {
  .share-banner {
    height: 180px;
  }
  
  .banner-title {
    font-size: 32px;
  }
  
  .share-container {
    padding: 25px;
  }
  
  .section-title {
    font-size: 20px;
  }
  
  .share-buttons {
    justify-content: center;
  }
  
  .link-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .share-banner {
    height: 150px;
  }
  
  .banner-title {
    font-size: 28px;
  }
  
  .banner-subtitle {
    font-size: 16px;
  }
  
  .share-container {
    padding: 20px;
  }
  
  .link-grid {
    grid-template-columns: 1fr;
  }
  
  .modal-content {
    max-width: 90%;
  }
  
  .qr-code-image {
    width: 180px;
    height: 180px;
  }
}
</style> 