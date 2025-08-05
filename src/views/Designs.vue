<template>
  <div class="designs-page">
    <!-- 主横幅 -->
    <div class="main-banner">
      <div class="banner-content">
        <h1 class="banner-heading">我的设计<br/>作品集</h1>
        <div class="banner-description">探索创意，感受设计的力量</div>
        <a href="#categories" class="discover-btn">探索更多</a>
      </div>
    </div>

    <!-- 导航菜单 -->
    <div class="design-nav" id="categories">
      <div class="nav-container">
        <div 
          v-for="(category, index) in categories" 
          :key="index" 
          class="nav-item"
          :class="{ active: activeCategory === category.id }"
          @click="scrollToCategory(category.id)"
        >
          {{ category.name }}
        </div>
      </div>
    </div>

    <!-- 设计分类展示区 -->
    <div class="design-categories">
      <!-- 海报设计 -->
      <section id="poster" class="category-section">
        <div class="category-banner" style="background-image: url('https://picsum.photos/id/17/1920/800')">
          <div class="banner-overlay">
            <div class="category-title">
              <h2>海报<br/>设计</h2>
              <a href="#" class="view-more">查看详情</a>
            </div>
          </div>
        </div>
        
        <div class="category-info">
          <div class="category-description">
            <p>我的海报设计注重视觉冲击力和信息传达的平衡，善于使用色彩和排版创造引人注目的视觉效果。作品风格多样，从极简主义到丰富多彩的表现形式，根据主题精心打造每一件作品。</p>
          </div>
          
          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-number">25+</span>
              <span class="stat-label">项目</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">3</span>
              <span class="stat-label">获奖作品</span>
            </div>
          </div>
        </div>
        
        <!-- 作品展示 -->
        <div class="works-showcase">
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/21/400/300" alt="海报设计作品">
            </div>
            <div class="work-title">城市文化节</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/22/400/300" alt="海报设计作品">
            </div>
            <div class="work-title">音乐会宣传</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/23/400/300" alt="海报设计作品">
            </div>
            <div class="work-title">艺术展览</div>
          </div>
        </div>
      </section>

      <!-- 3D建模设计 -->
      <section id="3d" class="category-section">
        <div class="category-banner" style="background-image: url('https://picsum.photos/id/36/1920/800')">
          <div class="banner-overlay">
            <div class="category-title">
              <h2>3D<br/>建模</h2>
              <a href="#" class="view-more">查看详情</a>
            </div>
          </div>
        </div>
        
        <div class="category-info">
          <div class="category-description">
            <p>在3D建模领域，我专注于创建高品质、细节丰富的模型。从概念到最终渲染，每个环节都精心把控。作品涵盖角色设计、场景构建、产品建模等多个方向，追求真实感与艺术表现力的完美结合。</p>
          </div>
          
          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-number">18</span>
              <span class="stat-label">项目</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">4</span>
              <span class="stat-label">合作伙伴</span>
            </div>
          </div>
        </div>
        
        <!-- 作品展示 -->
        <div class="works-showcase">
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/37/400/300" alt="3D建模作品">
            </div>
            <div class="work-title">角色设计</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/38/400/300" alt="3D建模作品">
            </div>
            <div class="work-title">建筑可视化</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/39/400/300" alt="3D建模作品">
            </div>
            <div class="work-title">产品渲染</div>
          </div>
        </div>
      </section>

      <!-- 视频剪辑 -->
      <section id="video" class="category-section">
        <div class="category-banner" style="background-image: url('https://picsum.photos/id/96/1920/800')">
          <div class="banner-overlay">
            <div class="category-title">
              <h2>视频<br/>剪辑</h2>
              <a href="#" class="view-more">查看详情</a>
            </div>
          </div>
        </div>
        
        <div class="category-info">
          <div class="category-description">
            <p>我的视频剪辑作品注重节奏感和故事叙述，通过精准的剪辑技术和创意表达，为观众带来引人入胜的视觉体验。从短片创作到商业宣传片，每个项目都力求在有限的时间内传达最大的信息量和情感冲击。</p>
          </div>
          
          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-number">30+</span>
              <span class="stat-label">作品</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">5</span>
              <span class="stat-label">商业案例</span>
            </div>
          </div>
        </div>
        
        <!-- 作品展示 -->
        <div class="works-showcase">
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/97/400/300" alt="视频剪辑作品">
            </div>
            <div class="work-title">旅行纪录片</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/98/400/300" alt="视频剪辑作品">
            </div>
            <div class="work-title">品牌宣传片</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/99/400/300" alt="视频剪辑作品">
            </div>
            <div class="work-title">短片创作</div>
          </div>
        </div>
      </section>

      <!-- 插画作品 -->
      <section id="illustration" class="category-section">
        <div class="category-banner" style="background-image: url('https://picsum.photos/id/65/1920/800')">
          <div class="banner-overlay">
            <div class="category-title">
              <h2>插画<br/>作品</h2>
              <a href="#" class="view-more">查看详情</a>
            </div>
          </div>
        </div>
        
        <div class="category-info">
          <div class="category-description">
            <p>我的插画作品风格独特，擅长将想象力与技巧相结合，创造出富有表现力的视觉艺术。作品涵盖数字绘画、角色设计、概念艺术等多个领域，每幅作品都融入了个人的艺术理念和情感表达。</p>
          </div>
          
          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-number">40+</span>
              <span class="stat-label">作品</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">2</span>
              <span class="stat-label">画展</span>
            </div>
          </div>
        </div>
        
        <!-- 作品展示 -->
        <div class="works-showcase">
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/66/400/300" alt="插画作品">
            </div>
            <div class="work-title">角色设计</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/67/400/300" alt="插画作品">
            </div>
            <div class="work-title">概念场景</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/68/400/300" alt="插画作品">
            </div>
            <div class="work-title">商业插画</div>
          </div>
        </div>
      </section>

      <!-- UI设计 -->
      <section id="ui" class="category-section">
        <div class="category-banner" style="background-image: url('https://picsum.photos/id/24/1920/800')">
          <div class="banner-overlay">
            <div class="category-title">
              <h2>UI<br/>设计</h2>
              <a href="#" class="view-more">查看详情</a>
            </div>
          </div>
        </div>
        
        <div class="category-info">
          <div class="category-description">
            <p>在UI设计领域，我专注于创造直观、美观且实用的用户界面。注重用户体验，将功能性与美学完美结合。项目包括网站设计、应用界面、交互原型等，每个作品都经过精心构思和反复优化，以确保最佳的用户体验。</p>
          </div>
          
          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-number">15</span>
              <span class="stat-label">项目</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">8</span>
              <span class="stat-label">客户</span>
            </div>
          </div>
        </div>
        
        <!-- 作品展示 -->
        <div class="works-showcase">
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/25/400/300" alt="UI设计作品">
            </div>
            <div class="work-title">移动应用</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/26/400/300" alt="UI设计作品">
            </div>
            <div class="work-title">网站设计</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/27/400/300" alt="UI设计作品">
            </div>
            <div class="work-title">后台管理系统</div>
          </div>
        </div>
      </section>

      <!-- LOGO设计 -->
      <section id="logo" class="category-section">
        <div class="category-banner" style="background-image: url('https://picsum.photos/id/91/1920/800')">
          <div class="banner-overlay">
            <div class="category-title">
              <h2>LOGO<br/>设计</h2>
              <a href="#" class="view-more">查看详情</a>
            </div>
          </div>
        </div>
        
        <div class="category-info">
          <div class="category-description">
            <p>我的LOGO设计追求简洁、独特且富有记忆点，致力于为每个品牌创造专属的视觉标识。从概念构思到最终呈现，每个LOGO都经过细致的研究和多次迭代，确保其能够准确传达品牌核心理念。</p>
          </div>
          
          <div class="category-stats">
            <div class="stat-item">
              <span class="stat-number">35</span>
              <span class="stat-label">设计</span>
            </div>
            <div class="stat-item">
              <span class="stat-number">20</span>
              <span class="stat-label">客户</span>
            </div>
          </div>
        </div>
        
        <!-- 作品展示 -->
        <div class="works-showcase">
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/92/400/300" alt="LOGO设计作品">
            </div>
            <div class="work-title">品牌LOGO</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/93/400/300" alt="LOGO设计作品">
            </div>
            <div class="work-title">活动LOGO</div>
          </div>
          <div class="work-card">
            <div class="work-image">
              <img src="https://picsum.photos/id/94/400/300" alt="LOGO设计作品">
            </div>
            <div class="work-title">产品LOGO</div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'

// 设计类别
const categories = [
  { id: 'poster', name: '海报设计' },
  { id: '3d', name: '3D建模设计' },
  { id: 'video', name: '视频剪辑' },
  { id: 'illustration', name: '插画作品' },
  { id: 'ui', name: 'UI设计' },
  { id: 'logo', name: 'LOGO设计' }
]

// 当前活跃的类别
const activeCategory = ref('poster')

// 滚动到指定类别区域
const scrollToCategory = (categoryId: string) => {
  activeCategory.value = categoryId
  const element = document.getElementById(categoryId)
  if (element) {
    element.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// 监听滚动事件，实时更新活跃的类别
const handleScroll = () => {
  const scrollPosition = window.scrollY
  // 获取所有类别区域元素
  const sections = document.querySelectorAll('.category-section')
  
  // 遍历所有类别区域，检查哪个在视口中
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i]
    const rect = section.getBoundingClientRect()
    
    // 如果类别区域的顶部在视口的上半部分
    if (rect.top <= window.innerHeight / 2 && rect.bottom >= window.innerHeight / 2) {
      activeCategory.value = section.id
      break
    }
  }
}

onMounted(() => {
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped lang="scss">
// 页面整体样式
.designs-page {
  width: 100%;
  background-color: #fff;
  overflow-x: hidden;
  font-family: 'Helvetica Neue', Arial, sans-serif;
}

// 主横幅
.main-banner {
  height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #1a232e, #2c3e50);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle at 30% 30%, rgba(135, 206, 235, 0.3) 0%, rgba(0, 0, 0, 0) 70%);
    pointer-events: none;
  }
}

.banner-content {
  text-align: left;
  max-width: 1200px;
  padding: 0 20px;
  position: relative;
  z-index: 1;
}

.banner-heading {
  font-size: 5rem;
  font-weight: 800;
  line-height: 1.1;
  margin-bottom: 30px;
  color: #fff;
  letter-spacing: -1px;
}

.banner-description {
  font-size: 1.5rem;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 40px;
}

.discover-btn {
  display: inline-block;
  padding: 15px 40px;
  background-color: #87CEEB;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  font-size: 1.1rem;
  border-radius: 3px;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #5fb6e0;
    transform: translateY(-3px);
  }
}

// 导航菜单
.design-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  background-color: #fff;
  border-bottom: 1px solid #eaeaea;
}

.nav-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  overflow-x: auto;
  scrollbar-width: none; /* Firefox */
  
  &::-webkit-scrollbar {
    display: none; /* Chrome, Safari, Opera */
  }
}

.nav-item {
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  white-space: nowrap;
  font-size: 1rem;
  font-weight: 500;
  color: #333;
  
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 3px;
    background: #87CEEB;
    transition: width 0.3s ease;
  }
  
  &:hover, &.active {
    color: #87CEEB;
    
    &::after {
      width: 80%;
    }
  }
}

// 设计分类区域
.design-categories {
  padding: 0;
}

.category-section {
  margin-bottom: 100px;
}

.category-banner {
  height: 70vh;
  background-size: cover;
  background-position: center;
  position: relative;
  display: flex;
  align-items: center;
}

.banner-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
}

.category-title {
  max-width: 1200px;
  margin: 0 auto;
  width: 100%;
  padding: 0 40px;
  
  h2 {
    font-size: 5rem;
    font-weight: 800;
    color: #fff;
    line-height: 1;
    margin-bottom: 30px;
    letter-spacing: -1px;
  }
}

.view-more {
  display: inline-block;
  padding: 12px 30px;
  background-color: #87CEEB;
  color: #fff;
  text-decoration: none;
  font-weight: 600;
  border-radius: 3px;
  font-size: 1rem;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: #5fb6e0;
    transform: translateY(-3px);
  }
}

.category-info {
  max-width: 1200px;
  margin: 0 auto;
  padding: 50px 20px 30px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  flex-wrap: wrap;
}

.category-description {
  flex: 2;
  margin-right: 40px;
  
  p {
    font-size: 1.1rem;
    line-height: 1.6;
    color: #555;
    margin: 0;
  }
}

.category-stats {
  flex: 1;
  display: flex;
  gap: 30px;
}

.stat-item {
  display: flex;
  flex-direction: column;
}

.stat-number {
  font-size: 2.5rem;
  font-weight: 700;
  color: #87CEEB;
}

.stat-label {
  font-size: 1rem;
  color: #666;
}

// 作品展示
.works-showcase {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 30px;
}

.work-card {
  overflow: hidden;
  border-radius: 6px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
    
    .work-image img {
      transform: scale(1.05);
    }
  }
}

.work-image {
  overflow: hidden;
  position: relative;
  aspect-ratio: 4/3;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.5s ease;
  }
}

.work-title {
  padding: 15px 20px;
  font-size: 1.1rem;
  font-weight: 600;
  color: #333;
  background: #fff;
}

// 响应式样式
@media (max-width: 1024px) {
  .banner-heading, .category-title h2 {
    font-size: 4rem;
  }
  
  .banner-description {
    font-size: 1.3rem;
  }
  
  .category-info {
    flex-direction: column;
  }
  
  .category-description {
    margin-right: 0;
    margin-bottom: 30px;
  }
}

@media (max-width: 768px) {
  .banner-heading, .category-title h2 {
    font-size: 3rem;
  }
  
  .banner-description {
    font-size: 1.1rem;
  }
  
  .discover-btn, .view-more {
    padding: 12px 25px;
    font-size: 0.9rem;
  }
  
  .nav-item {
    padding: 15px 10px;
    font-size: 0.9rem;
  }
  
  .category-banner {
    height: 50vh;
  }
  
  .stat-number {
    font-size: 2rem;
  }
  
  .works-showcase {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 480px) {
  .banner-heading, .category-title h2 {
    font-size: 2.5rem;
  }
  
  .banner-description {
    font-size: 1rem;
  }
  
  .category-banner {
    height: 40vh;
  }
  
  .category-stats {
    flex-direction: column;
    gap: 15px;
  }
  
  .works-showcase {
    grid-template-columns: 1fr;
  }
}
</style> 