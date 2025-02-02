<template>
  <div class="about-container">
    <!-- 头部背景 -->
    <div class="about-header">
      <video class="background-video" autoplay loop muted playsinline>
        <source src="/vedio/夏日飞鱼.mp4" type="video/mp4">
      </video>
      <div class="header-content">
        <div class="avatar-container">
          <img src="../assets/logo.png" alt="我的头像" class="avatar">
        </div>
        <Logo class="header-logo" />
        <p class="subtitle">生活就是一场华丽的冒险</p>
        <div class="social-links">
          <a href="https://github.com/yourusername" target="_blank">
            <Icon icon="mdi:github" />
          </a>
          <a href="mailto:your.email@example.com">
            <Icon icon="mdi:email" />
          </a>
          <a href="https://space.bilibili.com/yourid" target="_blank">
            <Icon icon="ri:bilibili-fill" />
          </a>
        </div>
      </div>
    </div>

    <!-- 遮罩层 -->
    <div class="blur-mask"></div>

    <!-- 内容区域 -->
    <div class="about-content">
      <!-- 个人简介 -->
      <section class="section">
        <h2>
          <Icon icon="mdi:account-outline" />
          <span>自我介绍</span>
        </h2>
        <div class="section-content">
          <p class="intro-text">一个热爱生活、追求美好的理想主义者。喜欢用镜头记录生活的点滴，用文字表达内心的感动。</p>
        </div>
      </section>

      <!-- 技能栈 -->
      <section class="section">
        <h2>
          <Icon icon="mdi:code-tags" />
          <span>技能栈</span>
        </h2>
        <div class="skills-grid">
          <div v-for="skill in skills" :key="skill.name" class="skill-card">
            <div class="skill-icon" :style="{ backgroundColor: skill.color }">
              <Icon :icon="skill.icon" />
            </div>
            <div class="skill-info">
              <h3>{{ skill.name }}</h3>
              <div class="skill-level">
                <div class="level-bar" :style="{ width: `${skill.level}%` }"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 工作经历 -->
      <section class="section">
        <h2>
          <Icon icon="mdi:briefcase-outline" />
          <span>工作经历</span>
        </h2>
        <div class="timeline">
          <div v-for="job in experience" :key="job.company" class="timeline-item">
            <div class="timeline-dot"></div>
            <div class="timeline-content">
              <h3>{{ job.title }}</h3>
              <h4>{{ job.company }}</h4>
              <p class="timeline-date">{{ job.period }}</p>
              <p class="timeline-description">{{ job.description }}</p>
            </div>
          </div>
        </div>
      </section>

      <!-- 兴趣爱好 -->
      <section class="section">
        <h2>
          <Icon icon="mdi:heart-outline" />
          <span>兴趣爱好</span>
        </h2>
        <div class="interests-grid">
          <div v-for="interest in interests" :key="interest.name" class="interest-card">
            <Icon :icon="interest.icon" />
            <span>{{ interest.name }}</span>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Icon } from '@iconify/vue'
import Logo from '../components/Logo.vue'
import { onMounted, onUnmounted } from 'vue'

const skills = [
  { name: 'Vue.js', level: 90, icon: 'mdi:vuejs', color: '#42b883' },
  { name: 'TypeScript', level: 85, icon: 'mdi:language-typescript', color: '#3178c6' },
  { name: 'CSS3', level: 88, icon: 'mdi:language-css3', color: '#264de4' },
  { name: 'Node.js', level: 75, icon: 'mdi:nodejs', color: '#339933' },
  // 添加更多技能...
]

const experience = [
  {
    title: '高级前端开发工程师',
    company: '某科技公司',
    period: '2020 - 至今',
    description: '负责公司核心产品的前端架构设计和开发，带领团队完成多个重要项目。'
  },
  // 添加更多经历...
]

const interests = [
  { name: '摄影', icon: 'mdi:camera' },
  { name: '阅读', icon: 'mdi:book-open-page-variant' },
  { name: '旅行', icon: 'mdi:airplane' },
  { name: '音乐', icon: 'mdi:music' },
  // 添加更多兴趣...
]

// 添加视差滚动效果
const handleScroll = () => {
  const header = document.querySelector('.about-header') as HTMLElement
  const content = document.querySelector('.about-content') as HTMLElement
  const mask = document.querySelector('.blur-mask') as HTMLElement
  const scrolled = window.scrollY

  if (header && content && mask) {
    header.style.cssText = `transform: translateY(${scrolled * 0.5}px); transition: none;`
    content.style.cssText = `transform: translateY(${scrolled * 0.1}px); transition: none;`
    // 遮罩的滚动速度和 header 保持一致
    mask.style.cssText = `transform: translateY(${scrolled * 0.5}px); transition: none;`
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll)
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.about-container {
  min-height: 100vh;
  background: var(--bg-primary);
  overflow: hidden;
  perspective: 1px;
}

.about-header {
  height: 60vh;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  will-change: transform;
  z-index: 1;
  transform-style: preserve-3d;
  backface-visibility: hidden;
}

.blur-mask {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 60.5vh;
  background: linear-gradient(
    to bottom,
    rgba(255, 255, 255, 0.4) 80%,
    rgba(255, 255, 255, 1)
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 60%,
    black
  );
  backdrop-filter: blur(8px);
  z-index: 2;
  pointer-events: none;
}

/* 暗色模式下的遮罩样式 */
html.dark .blur-mask {
  background: linear-gradient(
    to bottom,
    rgba(26, 26, 26, 0.4) 80%,
    rgba(26, 26, 26, 1)
  );
}

.background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translate(-50%, -50%);
  object-fit: cover;
  z-index: 0;
}

.header-content {
  text-align: center;
  z-index: 2;
  position: relative;
}

.avatar-container {
  width: 180px;
  height: 180px;
  margin: 0 auto 2rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(135, 206, 235, 0.5);
  box-shadow: 0 0 30px rgba(135, 206, 235, 0.3);
  transition: all 0.3s ease;
}

.avatar-container:hover {
  transform: scale(1.05);
  border-color: rgba(135, 206, 235, 0.8);
  box-shadow: 0 0 40px rgba(135, 206, 235, 0.4);
}

.avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.header-logo {
  margin: 1rem 0;
  transform: scale(1.5);
}

.subtitle {
  font-size: 1.4rem;
  font-weight: 300;
  margin: 1rem 0;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.social-links {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
  margin-top: 2rem;
}

.social-links a {
  color: white;
  font-size: 1.5rem;
  transition: transform 0.3s ease;
}

.social-links a:hover {
  transform: translateY(-3px);
}

.about-content {
  max-width: 1200px;
  margin: -60px auto 0;
  padding: 0 2rem;
  position: relative;
  z-index: 3;
  will-change: transform;
  background: none;
  transform-style: preserve-3d;
  backface-visibility: hidden;
  margin-bottom: 200px;
}

.section {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(135, 206, 235, 0.1);
  transition: all 0.3s ease;
  border-radius: 1rem;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.section:hover {
  border-color: rgba(135, 206, 235, 0.3);
  box-shadow: 0 8px 20px rgba(135, 206, 235, 0.1);
}

.section h2 {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.8rem;
  border-bottom: 2px solid rgba(135, 206, 235, 0.2);
  padding-bottom: 0.5rem;
}

.skills-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.skill-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.5rem;
  transition: transform 0.3s ease;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(135, 206, 235, 0.1);
  backdrop-filter: blur(5px);
}

.skill-card:hover {
  transform: translateY(-2px);
}

.skill-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.skill-level {
  height: 4px;
  background: rgba(0, 0, 0, 0.1);
  border-radius: 2px;
  margin-top: 0.5rem;
}

.level-bar {
  height: 100%;
  background: linear-gradient(90deg, #87CEEB, rgba(135, 206, 235, 0.5));
  border-radius: 2px;
  transition: width 1s ease;
}

.timeline {
  position: relative;
  padding-left: 2rem;
}

.timeline::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 2px;
  background: linear-gradient(to bottom, #667eea, #764ba2);
}

.timeline-item {
  position: relative;
  padding-bottom: 2rem;
}

.timeline-dot {
  position: absolute;
  left: -2.4rem;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #667eea;
  border: 2px solid white;
  box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.2);
}

.interests-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
}

.interest-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  background: var(--bg-primary);
  border-radius: 0.5rem;
  transition: all 0.3s ease;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(135, 206, 235, 0.1);
  backdrop-filter: blur(5px);
}

.interest-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.intro-text {
  font-size: 1.2rem;
  line-height: 1.8;
  color: var(--text-primary);
  text-align: justify;
  padding: 1rem 0;
}

/* 暗色主题适配 */
.dark-theme .section {
  background: rgba(0, 0, 0, 0.3);
}

.dark-theme .skill-card,
.dark-theme .interest-card {
  background: rgba(0, 0, 0, 0.2);
}

/* 响应式设计 */
@media screen and (max-width: 768px) {
  .about-header {
    height: 50vh;
  }

  .about-content {
    margin-top: -40px;
    padding: 0 1rem;
  }

  .section {
    padding: 1.5rem;
  }
}
</style> 