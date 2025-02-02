<template>
  <div class="home">
    <Banner />
    
    <!-- 过渡 banner -->
    <div class="transition-banner">
      <div class="transition-content">
        <h2 class="section-title">
          <span class="title-wrapper">为你的美丽，爱慕未停</span>
        </h2>
        <p class="section-desc">I am waiting for your beauty.</p>
      </div>
    </div>

    <!-- 修改为左右布局的文章区域 -->
    <div class="featured-articles">
      <div class="page-container">
        <!-- 音乐播放器容器 -->
        <div class="music-container">
          <div class="music-player">
            <!-- 添加标题和分隔线 -->
            <div class="player-header">
              <h3 class="player-title">
                <span class="title-static">MusicPlayer</span>
                <span class="title-separator">-</span>
                <span class="title-dynamic">{{ currentText }}</span>
                <span class="title-separator">-</span>
                <span class="title-status">{{ musicStore.isPlaying ? 'Playing' : 'Stop' }}</span>
              </h3>
              <div class="player-divider">
                <img :src="dividerImage" alt="divider" class="divider-image" />
              </div>
            </div>
            
            <div class="music-info">
              <img :src="coverImage" alt="music cover" class="music-cover" />
              <div class="music-details">
                <div class="marquee-container">
                  <div class="marquee-content" :class="{ 'marquee-animation': shouldMarquee }">
                    <span class="song-name">{{ musicStore.currentSong.title }}</span>
                  </div>
                </div>
                <div class="marquee-container">
                  <div class="marquee-content" :class="{ 'marquee-animation': shouldMarqueeArtist }">
                    <span class="artist-name">{{ musicStore.currentSong.artist }}</span>
                  </div>
                </div>
              </div>
            </div>
            <div class="player-controls">
              <div class="progress-container">
                <span class="time">{{ formatTime(musicStore.currentTime) }}</span>
                <div class="progress-bar" 
                    @mousedown="startDragging"
                    @mousemove="handleDragging"
                    @mouseup="stopDragging"
                    @mouseleave="stopDragging"
                    @click="handleProgressClick">
                  <div class="progress" :style="{ width: `${progress}%` }"></div>
                  <div class="progress-handle" 
                        :style="{ left: `${progress}%` }"
                        v-show="isDragging || isHovering"
                  ></div>
                </div>
                <span class="time">{{ formatTime(musicStore.duration) }}</span>
              </div>
              <div class="controls-volume">
                <div class="control-buttons">
                  <button class="control-btn" @click="musicStore.prevSong">
                    <Icon icon="mdi:skip-previous" />
                  </button>
                  <button class="control-btn play-btn" @click="handlePlayClick">
                    <Icon :icon="musicStore.isPlaying ? 'mdi:pause' : 'mdi:play'" />
                  </button>
                  <button class="control-btn" @click="musicStore.nextSong">
                    <Icon icon="mdi:skip-next" />
                  </button>
                </div>
                <div class="volume-control">
                  <button class="volume-btn" @click="toggleMute">
                    <Icon :icon="volumeIcon" />
                  </button>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    v-model="volume" 
                    @input="handleVolumeChange"
                    class="volume-slider"
                  />
                </div>
                <div class="extra-controls">
                  <button class="control-btn mode-btn" @click="togglePlayMode" :title="playModeTitle">
                    <Icon :icon="playModeIcon" />
                  </button>
                  <button class="control-btn list-btn" @click="toggleMusicList">
                    <Icon icon="mdi:playlist-music" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 左右布局区域 -->
        <div class="content-layout">
          <!-- 左侧功能区 -->
          <div class="sidebar">
            <!-- 用户信息卡片 -->
            <div class="user-card">
              <div class="user-avatar">
                <img src="../assets/logo.png" alt="avatar" />
              </div>
              <div class="user-info">
                <h3 class="username">Dansela</h3>
                <div class="user-stats">
                  <div class="stat">
                    <span class="number">94</span>
                    <span class="label">文章</span>
                  </div>
                  <div class="stat">
                    <span class="number">6</span>
                    <span class="label">分类</span>
                  </div>
                  <div class="stat">
                    <span class="number">131032</span>
                    <span class="label">访问量</span>
                  </div>
                </div>
              </div>
              <button class="follow-btn">👉 关注我</button>
            </div>

            <!-- 搜索框 -->
            <div class="search-box">
              <input type="text" placeholder="搜索文章" />
              <Icon icon="mdi:magnify" class="search-icon" />
            </div>

            <!-- 友链 -->
            <div class="friend-links">
              <h3 class="section-title">友链</h3>
              <!-- 友链内容 -->
            </div>

            <!-- 最新文章列表 -->
            <div class="recent-posts">
              <h3 class="section-title">最新文章</h3>
              <div class="post-list">
                <div class="post-item" v-for="post in recentPosts" :key="post.id">
                  <img :src="post.cover" :alt="post.title" class="post-thumb" />
                  <div class="post-info">
                    <h4 class="post-title">{{ post.title }}</h4>
                    <span class="post-date">{{ post.date }}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 导航卡片 -->
            <div class="nav-cards">
              <router-link to="/poetize" class="nav-card blue">
                <span>Dansela</span>
                <span class="subtitle">美丽诗意</span>
              </router-link>
              <router-link to="/life" class="nav-card green">
                <span>生活瞬影</span>
                <span class="subtitle">记录美好生活</span>
              </router-link>
              <router-link to="/thoughts" class="nav-card orange">
                <span>望所盛家</span>
                <span class="subtitle">听美好 享静谧</span>
              </router-link>
              <router-link to="/resources" class="nav-card pink">
                <span>资源</span>
                <span class="subtitle">每日有趣的资源</span>
              </router-link>
            </div>

            <!-- 最新树洞组件 -->
            <div class="latest-whispers">
              <h3 class="section-title">最新树洞</h3>
              <div class="whispers-list">
                <div v-for="(whisper, index) in latestWhispers" 
                     :key="index" 
                     class="whisper-item"
                     :class="{ 'new': whisper.isNew }">
                  <div class="whisper-content">{{ whisper.content }}</div>
                  <div class="whisper-meta">
                    <span class="whisper-time">{{ whisper.time }}</span>
                    <div class="whisper-stats">
                      <span class="stat">
                        <Icon icon="mdi:heart-outline" />
                        {{ whisper.likes }}
                      </span>
                      <span class="stat">
                        <Icon icon="mdi:comment-outline" />
                        {{ whisper.comments }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 文章列表区域 -->
          <div class="articles-container">
            <article v-for="(article, index) in featuredArticles" 
                     :key="article.id" 
                     class="featured-article"
                     :class="{ 'image-right': index % 2 === 1 }"
                     @mousemove="handleMouseMove"
                     @mouseleave="handleMouseLeave"
                     ref="articleRefs">
              <div class="article-cover" :style="{ backgroundImage: `url(${article.cover})` }">
              </div>
              <div class="article-content">
                <div class="article-meta">
                  <span class="article-category">{{ article.category }}</span>
                  <span class="article-date">{{ article.date }}</span>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-summary">{{ article.summary }}</p>
                <div class="article-footer">
                  <div class="article-tags">
                    <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                  <router-link :to="`/article/${article.id}`" class="read-more">
                    阅读全文
                    <Icon icon="material-symbols:arrow-forward" class="arrow-icon" />
                  </router-link>
                </div>
              </div>
            </article>
          </div>
        </div>
      </div>
      
      <div class="view-more">
        <router-link to="/archive" class="view-more-link">
          查看更多文章
          <Icon icon="material-symbols:arrow-forward" class="arrow-icon" />
        </router-link>
      </div>
    </div>
    <!-- 添加音乐列表弹出层 -->
    <Transition name="slide-right">
      <div v-if="showMusicList" class="music-list-overlay" @click="toggleMusicList">
        <div class="music-list-container" @click.stop>
          <div class="list-header">
            <span class="list-title">播放列表 ({{ musicStore.playlist.length }})</span>
            <button class="close-btn" @click="toggleMusicList">
              <Icon icon="mdi:chevron-right" />
            </button>
          </div>
          <div class="list-content">
            <div 
              v-for="(song, index) in musicStore.playlist" 
              :key="index"
              class="list-item"
              :class="{ 'active': song === musicStore.currentSong }"
              @click="musicStore.playSong(index)"
            >
              <div class="song-info">
                <span class="song-title">{{ song.title }}</span>
                <span class="song-artist">{{ song.artist }}</span>
              </div>
              <Icon 
                v-if="song === musicStore.currentSong" 
                :icon="musicStore.isPlaying ? 'mdi:volume-high' : 'mdi:volume-off'" 
                class="playing-icon"
              />
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <!-- 添加提示组件 -->
    <div class="mode-toast" v-if="showToast" :class="{ 'show': showToast }">
      {{ toastMessage }}
    </div>
  </div>
</template>

<style scoped>
.home {
  padding: 0;
  background-color: #f4f5f5;
  position: relative;
}

.main-content {
  padding: 20px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
}

.article-area {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.article-item {
  padding: 20px 0;
  border-bottom: 1px solid #eee;
}

.article-item:last-child {
  border-bottom: none;
}

.title {
  font-size: 1.5rem;
  color: #333;
  margin-bottom: 10px;
}

.meta {
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 10px;
}

.meta span {
  margin-right: 20px;
}

.summary {
  color: #666;
  line-height: 1.6;
}

.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.info-card {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
  text-align: center;
}

.avatar img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  margin-bottom: 10px;
}

.stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 20px;
}

.stat-item {
  text-align: center;
}

.count {
  font-size: 1.2rem;
  font-weight: bold;
  color: #333;
}

.label {
  font-size: 0.9rem;
  color: #666;
}

.site-info {
  background: #fff;
  border-radius: 8px;
  padding: 20px;
}

.sidebar-title {
  font-size: 1.2rem;
  margin-bottom: 15px;
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }
}

.transition-banner {
  background: url('/background/transition-banner-bg.jpg');
  background-size: cover;
  background-position: center;
  padding: 60px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  z-index: 1;
  height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.transition-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.transition-content {
  position: relative;
  z-index: 3;
  max-width: 800px;
  margin: 0 auto;
  padding: 0 20px;
}

.section-title {
  font-size: 2.5rem;
  color: #ffffff;
  margin-bottom: 1rem;
  margin-top: 1rem;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  position: relative;
  display: inline-block;
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.title-wrapper {
  position: relative;
  display: inline-block;
  transition: color 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* 创建多条线的动画效果 */
.title-wrapper::before,
.title-wrapper::after {
  content: '';
  position: absolute;
  top: 50%;
  height: 2px;
  width: 0;
  background: #87CEEB;
  transition: width 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
  transform: translateY(-50%);
  opacity: 0;
}

.title-wrapper::before {
  left: -120%;
  background: linear-gradient(90deg, 
    transparent,
    #87CEEB 20%,
    #87CEEB 80%,
    transparent
  );
}

.title-wrapper::after {
  right: -120%;
  background: linear-gradient(90deg, 
    transparent,
    #87CEEB 20%,
    #87CEEB 80%,
    transparent
  );
  transition-delay: 0.2s;
}

/* 添加额外的装饰线 */
.title-wrapper > span::before,
.title-wrapper > span::after {
  content: '';
  position: absolute;
  top: 50%;
  height: 1px;
  width: 0;
  background: rgba(135, 206, 235, 0.5);
  transition: width 1s cubic-bezier(0.165, 0.84, 0.44, 1);
  transform: translateY(-50%);
  opacity: 0;
}

/* Hover 效果 */
.transition-banner:hover .title-wrapper::before,
.transition-banner:hover .title-wrapper::after {
  width: 100%;
  opacity: 1;
}

.transition-banner:hover .title-wrapper > span::before,
.transition-banner:hover .title-wrapper > span::after {
  width: 80%;
  opacity: 0.6;
  transition-delay: 0.3s;
}

.transition-banner:hover .section-title {
  text-shadow: 
    0 0 10px rgba(135, 206, 235, 0.4),
    0 0 20px rgba(135, 206, 235, 0.3),
    0 0 30px rgba(135, 206, 235, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.5);
  transition: all 0.5s ease;
}

.transition-banner:hover .title-wrapper {
  color: #87CEEB;  /* 天蓝色 */
}

/* 暗色主题特殊效果 */
.dark-theme .transition-banner:hover .section-title {
  text-shadow: 
    0 0 10px rgba(135, 206, 235, 0.6),
    0 0 20px rgba(135, 206, 235, 0.4),
    0 0 30px rgba(135, 206, 235, 0.3),
    0 0 40px rgba(135, 206, 235, 0.2),
    0 2px 4px rgba(0, 0, 0, 0.5);
}

.dark-theme .transition-banner:hover .title-wrapper {
  color: rgb(135, 206, 235);  /* 发光的蓝色 */
  text-shadow: 
    0 0 15px rgba(135, 206, 235, 0.8),
    0 0 25px rgba(135, 206, 235, 0.6),
    0 0 35px rgba(135, 206, 235, 0.4);
}

/* 确保过渡效果平滑 */
.section-title,
.title-wrapper,
.title-wrapper::before,
.title-wrapper::after,
.title-wrapper > span::before,
.title-wrapper > span::after {
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.section-desc {
  font-size: 1.2rem;
  color: #ffffff;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.featured-articles {
  background-image: var(--article-bg-image);
  background-size: cover;
  background-position: center 30%;
  background-attachment: fixed;
  position: relative;
  padding: 60px 20px;
  overflow: hidden;
}

.featured-articles::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  z-index: 0;
}

.articles-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.featured-article {
  display: grid;
  grid-template-columns: 38.2fr 61.8fr;
  background: rgba(var(--bg-primary-rgb), 0.3);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease;
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.1),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
  transform-style: preserve-3d;
  perspective: 1000px;
}

.featured-article::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: 12px;
  padding: 1px;
  background: linear-gradient(
    45deg,
    rgba(255, 255, 255, 0.1),
    rgba(255, 255, 255, 0.2)
  );
  mask: 
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box,
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s ease;
}

/* 暗色主题样式 */
.dark-theme .featured-article {
  background: rgba(var(--bg-primary-rgb), 0.2);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    inset 0 0 0 1px rgba(255, 255, 255, 0.15);
}

.dark-theme .featured-article:hover {
  box-shadow: 
    0 0 25px rgba(135, 206, 235, 0.2),
    0 0 10px rgba(135, 206, 235, 0.1),
    0 0 5px rgba(135, 206, 235, 0.05),
    inset 0 0 0 1px rgba(135, 206, 235, 0.3);
  background: rgba(var(--bg-primary-rgb), 0.25);
  transform: translateY(-2px);
}

.dark-theme .featured-article::before {
  background: linear-gradient(
    45deg,
    rgba(135, 206, 235, 0.1),
    rgba(135, 206, 235, 0.2)
  );
}

.dark-theme .featured-article:hover::before {
  opacity: 1;
}

/* 增强发光效果 */
.dark-theme .featured-article:hover .article-content {
  background: rgba(135, 206, 235, 0.05);
}

.dark-theme .featured-article:hover .article-title {
  text-shadow: 
    0 0 10px rgba(135, 206, 235, 0.3),
    0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark-theme .featured-article:hover .article-category {
  color: rgba(135, 206, 235, 0.9);
  text-shadow: 0 0 8px rgba(135, 206, 235, 0.4);
}

.dark-theme .tag {
  background: rgba(135, 206, 235, 0.1);
  border: 1px solid rgba(135, 206, 235, 0.2);
  transition: all 0.3s ease;
}

.dark-theme .featured-article:hover .tag {
  background: rgba(135, 206, 235, 0.15);
  border-color: rgba(135, 206, 235, 0.3);
  box-shadow: 0 0 8px rgba(135, 206, 235, 0.1);
}

.featured-article.image-right {
  grid-template-columns: 61.8fr 38.2fr;
  grid-template-areas: "content image";
}

.featured-article.image-right .article-cover {
  grid-area: image;
}

.featured-article.image-right .article-content {
  grid-area: content;
}

.article-cover {
  height: 100%;
  background-size: cover;
  background-position: center;
  position: relative;
  overflow: hidden;
}

.featured-article.image-right .article-cover {
  grid-area: image;
}

.featured-article:hover .article-cover {
  transform: scale(1.05);
}

.article-content {
  position: relative;
  padding: 30px;
  display: flex;
  flex-direction: column;
  background: transparent;
  z-index: 0;
}

.article-meta {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
}

.article-category {
  color: #87CEEB;
  font-weight: 500;
}

.article-date {
  color: var(--text-primary);
  opacity: 0.6;
}

.article-title {
  font-size: 1.8rem;
  color: var(--text-primary);
  margin-bottom: 15px;
  line-height: 1.3;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
}

.article-summary {
  color: var(--text-primary);
  opacity: 0.9;
  margin-bottom: auto;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.15);
}

.article-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--border-color);
}

.article-tags {
  display: flex;
  gap: 10px;
}

.tag {
  padding: 4px 12px;
  background: var(--bg-secondary);
  color: var(--text-primary);
  border-radius: 20px;
  font-size: 0.9rem;
}

.read-more {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #87CEEB;
  text-decoration: none;
  font-weight: 500;
  transition: gap 0.3s ease;
}

.read-more:hover {
  gap: 12px;
}

.arrow-icon {
  font-size: 1.2em;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .featured-article,
  .featured-article.image-right {
    grid-template-columns: 1fr;
    grid-template-areas: 
      "image"
      "content";
  }
  
  .article-cover {
    height: 200px;
  }
  
  .article-content {
    padding: 20px;
  }
  
  .article-title {
    font-size: 1.5rem;
  }
  
  .article-footer {
    flex-direction: column;
    gap: 15px;
    align-items: flex-start;
  }
}

/* 添加 CSS 变量到根样式 */
:root {
  --bg-primary-rgb: 255, 255, 255;
  --article-bg-image: url('/background/article-card-bg2.jpg'); /* 日间模式背景 */
}

.dark-theme {
  --bg-primary-rgb: 26, 26, 26;
  --article-bg-image: url('/background/article-card-bg.jpg'); /* 夜间模式背景 */
}

.view-more {
  position: relative;
  z-index: 2;
  text-align: center;
  margin-top: 50px;
}

.view-more-link {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  padding: 12px 30px;
  color: #fff;
  text-decoration: none;
  font-weight: 500;
  font-size: 1.1rem;
  background: rgba(135, 206, 235, 0.8);  /* 半透明天蓝色 */
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
  border-radius: 30px;
  transition: all 0.3s ease;
  box-shadow: 
    0 4px 15px rgba(135, 206, 235, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

.view-more-link:hover {
  transform: translateY(-2px);
  background: rgba(135, 206, 235, 0.9);
  box-shadow: 
    0 8px 25px rgba(135, 206, 235, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.3);
}

.view-more-link:active {
  transform: translateY(0);
}

.view-more-link .arrow-icon {
  font-size: 1.2em;
  transition: transform 0.3s ease;
}

.view-more-link:hover .arrow-icon {
  transform: translateX(4px);
}

/* 暗色主题适配 */
.dark-theme .view-more-link {
  background: rgba(135, 206, 235, 0.6);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.dark-theme .view-more-link:hover {
  background: rgba(135, 206, 235, 0.7);
  box-shadow: 
    0 8px 25px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.2);
}

/* 确保所有内容在粒子之上 */
.transition-banner,
.featured-articles {
  position: relative;
  z-index: 1;
}

/* 修改布局容器 */
.page-container {
  position: relative;
  z-index: 2;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* 侧边栏样式 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 用户卡片样式 */
.user-card {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.user-avatar {
  display: flex;  /* 添加这行 */
  justify-content: center;  /* 添加这行 */
  align-items: center;  /* 添加这行 */
}

.user-avatar img {
  width: 160px;
  height: 160px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  margin-bottom: 0px;
  margin-left: 0;  /* 移除原来的 margin-left: 20% */
}

.username {
  font-size: 1.5rem;
  color: var(--text-primary);
  margin-bottom: 15px;
}

.user-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 10px;
  margin: 15px 0;
}

.stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.number {
  font-size: 1.2rem;
  font-weight: bold;
  color: var(--text-primary);
}

.label {
  font-size: 0.9rem;
  color: var(--text-primary);
  opacity: 0.8;
}

.follow-btn {
  width: 100%;
  padding: 8px;
  border: none;
  border-radius: 20px;
  background: #87CEEB;
  color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

/* 搜索框样式 */
.search-box {
  position: relative;
  width: 100%;
}

.search-box input {
  width: calc(100% - 0px);
  padding: 10px 40px 10px 15px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  color: var(--text-primary);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--text-primary);
  opacity: 0.7;
  font-size: 1.2rem;
  cursor: pointer;
  transition: opacity 0.3s ease;
}

.search-icon:hover {
  opacity: 1;
}

/* 导航卡片样式 */
.nav-cards {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.nav-card {
  display: flex;
  flex-direction: column;
  padding: 15px;
  border-radius: 12px;
  color: white;
  text-decoration: none;
  transition: transform 0.3s ease;
}

.nav-card:hover {
  transform: translateX(5px);
  filter: brightness(1.1) contrast(1.1);
  box-shadow: 0 5px 15px rgba(135, 206, 235, 0.3);
}

.nav-card .subtitle {
  font-size: 0.9rem;
  opacity: 0.8;
}

.blue { 
  background: linear-gradient(135deg, #87CEEB, #5B9FBF); /* 天蓝色到深天蓝色 */
}

.green { 
  background: linear-gradient(135deg, #87CEEB, #48D1CC); /* 天蓝色到绿松石色 */
}

.orange { 
  background: linear-gradient(135deg, #87CEEB, #6495ED); /* 天蓝色到矢车菊蓝 */
}

.pink { 
  background: linear-gradient(135deg, #87CEEB, #4169E1); /* 天蓝色到皇家蓝 */
}

/* 最新文章列表样式 */
.recent-posts {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
}

.post-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.post-thumb {
  width: 60px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
}

.post-info {
  flex: 1;
}

.post-title {
  font-size: 0.9rem;
  margin-bottom: 5px;
  color: var(--text-primary);
}

.post-date {
  font-size: 0.8rem;
  color: var(--text-primary);
  opacity: 0.7;
}

/* 响应式设计 */
@media (max-width: 1024px) {
  .page-container {
    grid-template-columns: 250px 1fr;
  }
}

@media (max-width: 768px) {
  .page-container {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    order: 2;
  }
}

/* 修改卡片样式 */
.user-card,
.recent-posts,
.featured-article {
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--card-border-light);
  box-shadow: var(--card-shadow-light);
}

/* 搜索框特殊样式 */
.search-box input {
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--card-border-light);
  box-shadow: var(--card-shadow-light);
}

/* 暗色主题适配 */
.dark-theme .user-card,
.dark-theme .recent-posts,
.dark-theme .featured-article {
  background: var(--card-bg-dark);
  border: var(--card-border-dark);
  box-shadow: var(--card-shadow-dark);
}

.dark-theme .search-box input {
  background: var(--card-bg-dark);
  border: var(--card-border-dark);
  box-shadow: var(--card-shadow-dark);
}

/* 增强卡片悬停效果 */
.user-card:hover,
.recent-posts:hover,
.featured-article:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
}

/* 搜索框获得焦点时的效果 */
.search-box input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(135, 206, 235, 0.3);
}

/* 添加悬停效果 */
.nav-card:hover {
  transform: translateX(5px);
  filter: brightness(1.1) contrast(1.1);
  box-shadow: 0 5px 15px rgba(135, 206, 235, 0.3);
}

/* 暗色主题下的阴影效果 */
.dark-theme .nav-card {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.dark-theme .nav-card:hover {
  box-shadow: 0 5px 15px rgba(135, 206, 235, 0.2);
}

/* 音乐播放器样式 */
.music-player {
  background: rgba(20, 20, 20, 0.8);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(135, 206, 235, 0.2);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(135, 206, 235, 0.1);
  border-radius: 12px;
  padding: 20px;
  width: 100%;
  margin-bottom: 20px;
  color: rgba(255, 255, 255, 0.9);
}

.music-info {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-bottom: 20px;
}

.music-cover {
  width: 80px;
  height: 80px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.music-details {
  flex: 1;
}

.song-name {
  font-size: 1.1rem;
  font-weight: 500;
  margin-bottom: 8px;
  display: block;
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.artist-name {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.player-controls {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-bar {
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(135, 206, 235, 0.15);
  border-radius: 3px;
  cursor: pointer;
  transition: height 0.3s ease;
}

.progress-bar:hover {
  height: 8px;
}

.progress {
  height: 100%;
  background: #87CEEB;
  border-radius: 3px;
  position: relative;
  transition: width 0.1s linear;
}

.progress-handle {
  position: absolute;
  top: 50%;
  transform: translate(-50%, -50%);
  width: 12px;
  height: 12px;
  background: #87CEEB;
  border-radius: 50%;
  box-shadow: 0 0 10px rgba(135, 206, 235, 0.4);
  transition: transform 0.3s ease;
  cursor: pointer;
}

.progress-handle:hover {
  transform: translate(-50%, -50%) scale(1.2);
}

.control-buttons {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 30px;
  margin-top: 15px;
}

.control-btn {
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 50%;
  background: rgba(135, 206, 235, 0.1);
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  backdrop-filter: blur(5px);
  -webkit-backdrop-filter: blur(5px);
}

.play-btn {
  width: 50px;
  height: 50px;
  background: rgba(135, 206, 235, 0.2);
  border-radius: 50%;
}

/* 按钮悬停效果 */
.control-btn:hover {
  background: rgba(135, 206, 235, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(135, 206, 235, 0.2);
}

/* 暗色主题适配 */
.dark-theme .control-btn {
  background: rgba(135, 206, 235, 0.15);
  border: 1px solid rgba(135, 206, 235, 0.2);
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark-theme .play-btn {
  background: rgba(135, 206, 235, 0.25);
  box-shadow: 
    0 0 10px rgba(135, 206, 235, 0.2),
    inset 0 0 5px rgba(135, 206, 235, 0.1);
}

/* 按钮悬停效果 */
.dark-theme .control-btn:hover {
  background: rgba(135, 206, 235, 0.3);
  transform: translateY(-2px);
  box-shadow: 
    0 5px 15px rgba(135, 206, 235, 0.3),
    inset 0 0 8px rgba(135, 206, 235, 0.2);
  color: #87CEEB;
  text-shadow: 
    0 0 10px rgba(135, 206, 235, 0.8),
    0 0 20px rgba(135, 206, 235, 0.4);
}

/* 进度条样式优化 */
.dark-theme .progress-bar {
  background: rgba(135, 206, 235, 0.2);
}

.dark-theme .progress,
.dark-theme .progress-handle {
  background: #87CEEB;
  box-shadow: 
    0 0 10px rgba(135, 206, 235, 0.6),
    0 0 5px rgba(135, 206, 235, 0.3);
}

/* 音量控制样式优化 */
.dark-theme .volume-slider {
  background: rgba(135, 206, 235, 0.15);
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.2);
}

.dark-theme .volume-slider::-webkit-slider-thumb {
  background: #87CEEB;
  box-shadow: 
    0 0 10px rgba(135, 206, 235, 0.4),
    0 0 5px rgba(135, 206, 235, 0.2);
}

.dark-theme .volume-slider::-webkit-slider-thumb:hover {
  transform: scale(1.2);
  box-shadow: 
    0 0 15px rgba(135, 206, 235, 0.6),
    0 0 8px rgba(135, 206, 235, 0.3);
}

/* 图标样式 */
.control-btn .iconify {
  font-size: 1.5rem;
  color: var(--text-primary);
  transition: color 0.3s ease;
}

.play-btn .iconify {
  font-size: 1.8rem;
}

.control-btn:hover .iconify {
  color: #87CEEB;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .control-buttons {
    gap: 20px;
  }

  .control-btn {
    width: 35px;
    height: 35px;
  }

  .play-btn {
    width: 45px;
    height: 45px;
  }
}

@media (max-width: 480px) {
  .control-buttons {
    gap: 15px;
  }

  .control-btn {
    width: 32px;
    height: 32px;
  }

  .play-btn {
    width: 40px;
    height: 40px;
  }
}

/* 添加音乐播放器容器样式 */
.music-container {
  margin-bottom: 30px;
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 30px;
  width: calc(100% - 0px);
  margin-left: -0px;
}

/* 音乐播放器样式 */
.music-player {
  grid-column: 1 / -1;
  width: 100%;
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--card-border-light);
  box-shadow: var(--card-shadow-light);
  border-radius: 12px;
  padding: 20px;
}

/* 左右布局容器 */
.content-layout {
  display: grid;
  grid-template-columns: 300px minmax(0, 1fr);
  gap: 30px;
}

/* 响应式布局调整 */
@media (max-width: 1024px) {
  .music-container,
  .content-layout {
    grid-template-columns: 250px minmax(0, 1fr);
  }
  
  .music-player {
    width: calc(100% - 0px);
  }
}

@media (max-width: 768px) {
  .music-container,
  .content-layout {
    grid-template-columns: 1fr;
  }
  
  .music-container {
    width: 100%;
    margin-left: 0;
  }
  
  /* 移动端音乐播放器样式调整 */
  .music-info {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 15px;
  }
  
  .music-cover {
    width: 120px;
    height: 120px;
  }
  
  .control-buttons {
    gap: 20px;
  }
  
  .play-btn {
    width: 50px;
    height: 50px;
  }
  
  .sidebar {
    order: 2;
  }

  .music-player {
    width: calc(100% - 40px);
  }
}

/* 更小屏幕的适配 */
@media (max-width: 480px) {
  .music-cover {
    width: 100px;
    height: 100px;
  }
  
  .control-buttons {
    gap: 15px;
  }
  
  .play-btn {
    width: 45px;
    height: 45px;
  }
  
  .music-player {
    padding: 15px;
  }
}

/* 滚动文本容器 */
.marquee-container {
  width: 100%;
  overflow: hidden;
  position: relative;
}

.marquee-content {
  display: inline-block;
  white-space: nowrap;
  padding-right: 50px;
}

.marquee-animation {
  animation: marquee 15s linear infinite;
}

@keyframes marquee {
  0% { transform: translateX(0); }
  100% { transform: translateX(-100%); }
}

/* 进度条容器 */
.progress-container {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
}

.time {
  font-size: 0.8rem;
  color: var(--text-primary);
  opacity: 0.8;
  min-width: 45px;
}

/* 音量控制 */
.controls-volume {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.volume-control {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 120px;
}

.volume-btn {
  background: none;
  border: none;
  color: var(--text-primary);
  cursor: pointer;
  padding: 5px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.volume-btn:hover {
  color: #87CEEB;
}

.volume-slider {
  width: 80px;
  height: 4px;
  border-radius: 2px;
  background: rgba(135, 206, 235, 0.2);
  outline: none;
  transition: all 0.3s ease;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #87CEEB;
  cursor: pointer;
  transition: all 0.3s ease;
}

.volume-slider:hover::-webkit-slider-thumb {
  transform: scale(1.2);
}

/* 暗色主题适配 */
.dark-theme .volume-slider {
  background: rgba(135, 206, 235, 0.15);
}

/* 亮色主题适配 */
@media (prefers-color-scheme: light) {
  .music-player {
    background: rgba(255, 255, 255, 0.9);
    border: 1px solid rgba(135, 206, 235, 0.3);
    color: var(--text-primary);
  }

  .song-name {
    color: var(--text-primary);
    text-shadow: none;
  }

  .artist-name,
  .time {
    color: rgba(0, 0, 0, 0.6);
  }

  .volume-icon {
    color: var(--text-primary);
  }
}

/* 暗色主题强制覆盖 */
.dark-theme .music-player {
  background: rgba(20, 20, 20, 0.8);
  border: 1px solid rgba(135, 206, 235, 0.2);
  color: rgba(255, 255, 255, 0.9);
}

.dark-theme .song-name {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.dark-theme .artist-name,
.dark-theme .time {
  color: rgba(255, 255, 255, 0.7);
}

.dark-theme .volume-icon {
  color: rgba(255, 255, 255, 0.8);
}

/* 可以添加封面切换过渡效果 */
.music-cover {
  transition: all 0.3s ease;
}

/* 添加标题和分隔线样式 */
.player-header {
  margin-bottom: 15px;
}

.player-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
  margin: 0 0 10px 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-separator {
  opacity: 0.5;
}

.title-dynamic {
  color: #87CEEB;
  min-width: 120px;
  text-align: center;
  position: relative;
  transition: opacity 0.5s ease;
}

.title-status {
  color: var(--text-primary);
  opacity: 0.8;
}

/* 添加淡入淡出动画 */
.fade-out {
  opacity: 0;
}

.fade-in {
  opacity: 1;
}

/* 暗色主题适配 */
.dark-theme .title-dynamic {
  color: #87CEEB;
  text-shadow: 0 0 8px rgba(135, 206, 235, 0.3);
}

.dark-theme .title-status {
  color: rgba(255, 255, 255, 0.9);
}

/* 移动端适配 */
@media (max-width: 768px) {
  .player-title {
    font-size: 0.9rem;
    gap: 6px;
  }
  
  .title-dynamic {
    min-width: 100px;
  }
}

/* 修改分隔线样式 */
.player-divider {
  width: 100%;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 10px 0;
}

.divider-image {
  width: 100%;
  height: 20px;
  object-fit: fill;
  opacity: 0.8;
  transition: opacity 0.3s ease;
}

/* 暗色主题适配 */
.dark-theme .divider-image {
  opacity: 0.6;
}

/* 移动端适配 */
@media (max-width: 768px) {
  .player-divider {
    height: 15px;
    margin: 8px 0;
  }
  
  .divider-image {
    height: 15px;
  }
}

/* 播放模式和列表按钮样式 */
.extra-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.mode-btn, .list-btn {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.mode-btn:hover, .list-btn:hover {
  opacity: 1;
  color: #87CEEB;
}

/* 音乐列表弹出层样式 */
.music-list-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 350px; /* 设置合适的宽度 */
  background: rgba(0, 0, 0, 0.00001);
  backdrop-filter: blur(5px);
  z-index: 10001;
}

.music-list-container {
  width: 100%;
  height: 100%;
  background: var(--bg-primary);
  box-shadow: -2px 0 20px rgba(0, 0, 0, 0.0001);
}

.list-header {
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid var(--border-color);
}

.list-title {
  font-size: 1.1rem;
  font-weight: 500;
  color: var(--text-primary);
}

.close-btn {
  position: absolute;
  left: -16px; /* 调整位置到左边 */
  top: 50%;
  transform: translateY(-50%);
  width: 32px;
  height: 32px;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: 50%;
  color: var(--text-primary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 1;
}

.close-btn:hover {
  background: rgba(135, 206, 235, 0.1);
  color: #87CEEB;
  transform: translateY(-50%) scale(1.1);
}

.list-content {
  max-height: calc(70vh - 70px);
  overflow-y: auto;
  padding: 10px 0;
}

.list-item {
  padding: 12px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.list-item:hover {
  background: rgba(135, 206, 235, 0.1);
}

.list-item.active {
  color: #87CEEB;
  background: rgba(135, 206, 235, 0.05);
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-title {
  font-size: 0.95rem;
  font-weight: 500;
}

.song-artist {
  font-size: 0.85rem;
  opacity: 0.7;
}

.playing-icon {
  color: #87CEEB;
  animation: pulse 2s infinite;
}

/* 滑入动画 */
.slide-right-enter-active,
.slide-right-leave-active {
  transition: all 0.3s ease;
}

.slide-right-enter-from,
.slide-right-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* 暗色主题适配 */
.dark-theme .music-list-container {
  background: rgba(30, 30, 30, 0.95);
  border: 1px solid rgba(135, 206, 235, 0.1);
}

.dark-theme .list-item:hover {
  background: rgba(135, 206, 235, 0.15);
}

.dark-theme .list-item.active {
  background: rgba(135, 206, 235, 0.1);
}

/* 响应式适配 */
@media (max-width: 768px) {
  .music-list-overlay {
    width: 100%;
  }
}

/* 添加提示组件 */
.mode-toast {
  position: fixed;
  bottom: 20%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(135, 206, 235, 0.2);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  color: white;
  padding: 10px 24px;
  border-radius: 4px;
  opacity: 0;
  transition: opacity 0.3s;
  border: 1px solid rgba(135, 206, 235, 0.3);
  box-shadow: 
    0 4px 15px rgba(135, 206, 235, 0.2),
    0 0 10px rgba(135, 206, 235, 0.1);
  font-size: 14px;
  letter-spacing: 1px;
}

.mode-toast.show {
  opacity: 1;
  transform: translate(-50%, -10px);
}

/* 暗色主题适配 */
.dark-theme .mode-toast {
  background: rgba(30, 30, 30, 0.9);
  border-color: rgba(135, 206, 235, 0.2);
  box-shadow: 
    0 4px 15px rgba(0, 0, 0, 0.3),
    0 0 10px rgba(135, 206, 235, 0.1);
}

/* 最新树洞样式 */
.latest-whispers {
  background: var(--card-bg-light);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--card-border-light);
  box-shadow: var(--card-shadow-light);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
}

.whispers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

.whisper-item {
  background: rgba(135, 206, 235, 0.05);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid rgba(135, 206, 235, 0.1);
  backdrop-filter: blur(5px);
}

.whisper-item.new::before {
  content: 'New';
  position: absolute;
  top: 8px;
  right: 8px;
  background: #87CEEB;
  color: white;
  padding: 2px 6px;
  border-radius: 4px;
  font-size: 0.7rem;
  opacity: 0.8;
  box-shadow: 0 2px 8px rgba(135, 206, 235, 0.3);
}

.whisper-item:hover {
  transform: translateY(-2px);
  background: rgba(135, 206, 235, 0.1);
  border-color: rgba(135, 206, 235, 0.2);
  box-shadow: 
    0 4px 12px rgba(135, 206, 235, 0.1),
    0 0 8px rgba(135, 206, 235, 0.05);
}

.whisper-content {
  color: var(--text-color);
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 8px;
}

.whisper-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: var(--text-color);
  opacity: 0.8;
}

.whisper-stats {
  display: flex;
  gap: 12px;
}

.whisper-stats .stat {
  display: flex;
  align-items: center;
  gap: 4px;
  transition: all 0.3s ease;
  cursor: pointer;
}

.whisper-stats .stat:hover {
  color: #87CEEB;
  text-shadow: 0 0 8px rgba(135, 206, 235, 0.4);
}

/* 暗色主题适配 */
.dark-theme .latest-whispers {
  background: var(--card-bg-dark);
  border: var(--card-border-dark);
  box-shadow: var(--card-shadow-dark);
}

.dark-theme .whisper-item {
  background: rgba(0, 0, 0, 0.2);
  border-color: rgba(135, 206, 235, 0.1);
}

.dark-theme .whisper-item:hover {
  background: rgba(135, 206, 235, 0.1);
  border-color: rgba(135, 206, 235, 0.2);
  box-shadow: 
    0 4px 12px rgba(0, 0, 0, 0.2),
    0 0 8px rgba(135, 206, 235, 0.1);
}
</style>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import Banner from '../components/Banner.vue'
import { Icon } from '@iconify/vue'
import { useMusicStore } from '../stores/music'
import { useDark } from '@vueuse/core'

const articleRefs = ref<HTMLElement[]>([])
const musicStore = useMusicStore()
const showToast = ref(false)
const toastMessage = ref('')
const volume = ref(20)
const previousVolume = ref(20)
const shouldMarquee = ref(false)
const shouldMarqueeArtist = ref(false)

const isDark = useDark({
  selector: 'html',
  attribute: 'class',
  valueDark: 'dark-theme',
  valueLight: ''
})

const handleMouseMove = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  const centerX = rect.width / 2
  const centerY = rect.height / 2
  
  const rotateX = (y - centerY) / 40
  const rotateY = (centerX - x) / 200
  
  target.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.01, 1.01, 1.01)`
}

const handleMouseLeave = (e: MouseEvent) => {
  const target = e.currentTarget as HTMLElement
  target.style.transition = 'all 0.5s cubic-bezier(0.23, 1, 0.32, 1)'
  target.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)'
  setTimeout(() => {
    target.style.transition = ''
  }, 500)
}

const featuredArticles = ref([
  {
    id: 1,
    title: '探索 Vue 3 组合式 API 的最佳实践',
    summary: '组合式 API 是 Vue 3 中最重要的特性之一，它为我们提供了更好的代码组织方式和逻辑复用能力...',
    cover: '/articles/cover/1.jpg',
    date: '2024-03-21',
    category: '前端开发',
    tags: ['Vue3', 'JavaScript', '最佳实践']
  },
  {
    id: 2,
    title: '使用 TypeScript 提升代码质量',
    summary: 'TypeScript 作为 JavaScript 的超集，为我们带来了类型安全和更好的开发体验...',
    cover: '/articles/cover/2.jpg',
    date: '2024-03-20',
    category: '编程语言',
    tags: ['TypeScript', '最佳实践', '代码质量']
  },
  {
    id: 3,
    title: '深入理解 CSS Grid 布局',
    summary: 'CSS Grid 布局是一个强大的二维布局系统，它彻底改变了我们设计网页布局的方式...',
    cover: '/articles/cover/3.jpg',
    date: '2024-03-19',
    category: '前端开发',
    tags: ['CSS', 'Web设计', '响应式']
  }
])

// 添加最新文章数据
const recentPosts = ref([
  {
    id: 1,
    title: 'Dansela - 文档色彩与网站美化',
    cover: '/articles/cover/1.jpg',
    date: '2024-06-04'
  },
  {
    id: 2,
    title: 'Dansela - 部署文档',
    cover: '/articles/cover/2.jpg',
    date: '2022-12-26'
  },
  {
    id: 3,
    title: 'Dansela - 完整版',
    cover: '/articles/cover/3.jpg',
    date: '2022-03-03'
  }
])

// 在播放按钮点击事件中使用
const handlePlayClick = () => {
  musicStore.togglePlay()
}

// 计算进度百分比
const progress = computed(() => {
  if (!musicStore.duration) return 0
  return (musicStore.currentTime / musicStore.duration) * 100
})

// 音量图标
const volumeIcon = computed(() => {
  if (volume.value === 0) return 'mdi:volume-off'
  if (volume.value < 30) return 'mdi:volume-low'
  if (volume.value < 70) return 'mdi:volume-medium'
  return 'mdi:volume-high'
})

// 格式化时间
const formatTime = (time: number) => {
  const minutes = Math.floor(time / 60)
  const seconds = Math.floor(time % 60)
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

// 将这些函数移到这里
const handleProgressClick = (e: MouseEvent) => {
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = (e.clientX - rect.left) / rect.width
  musicStore.setProgress(percent * 100)
}

const handleVolumeChange = () => {
  musicStore.setVolume(Number(volume.value))
}

const toggleMute = () => {
  if (volume.value > 0) {
    previousVolume.value = volume.value
    volume.value = 0
  } else {
    volume.value = previousVolume.value
  }
  handleVolumeChange()
}

const checkMarquee = () => {
  const titleEl = document.querySelector('.song-name')
  const artistEl = document.querySelector('.artist-name')
  
  if (titleEl) {
    shouldMarquee.value = titleEl.scrollWidth > (titleEl.parentElement?.clientWidth || 0)
  }
  if (artistEl) {
    shouldMarqueeArtist.value = artistEl.scrollWidth > (artistEl.parentElement?.clientWidth || 0)
  }
}

// 监听歌曲变化
watch(() => musicStore.currentSong, () => {
  setTimeout(checkMarquee, 100)
  musicStore.setVolume(volume.value)
}, { immediate: true })

onMounted(() => {
  checkMarquee()
  window.addEventListener('resize', checkMarquee)
})

// 根据主题动态计算封面图片
const coverImage = computed(() => {
  if (isDark.value) {
    return '/music/cover/phonograph.png'
  }
  return musicStore.currentSong.cover || '/music/cover/music.png'
})

// 文本池
const textPool = [
  '起风了~~',
  '让音乐带你飞',
  '聆听美好时光',
  '感受音乐的魅力',
  '让心灵随乐起舞'
]

const currentTextIndex = ref(0)
const currentText = ref(textPool[0])

// 文本切换函数
const switchText = () => {
  const nextIndex = (currentTextIndex.value + 1) % textPool.length
  currentTextIndex.value = nextIndex
  
  // 添加淡出效果
  const titleDynamic = document.querySelector('.title-dynamic')
  if (titleDynamic) {
    titleDynamic.classList.add('fade-out')
    
    setTimeout(() => {
      currentText.value = textPool[nextIndex]
      titleDynamic.classList.remove('fade-out')
      titleDynamic.classList.add('fade-in')
      
      setTimeout(() => {
        titleDynamic.classList.remove('fade-in')
      }, 500)
    }, 500)
  }
}

// 启动文本切换定时器
onMounted(() => {
  // ... 其他 onMounted 代码保持不变 ...
  
  // 每5秒切换一次文本
  setInterval(switchText, 5000)
})

// 添加分隔线图片计算属性
const dividerImage = computed(() => {
  return isDark.value ? '/Icon/line-w.png' : '/Icon/line-b.png'
})

// 添加新的响应式变量
const showMusicList = ref(false)

// 播放模式相关
const playModeIcon = computed(() => {
  switch (musicStore.playMode) {
    case 'sequence':
      return 'mdi:repeat'
    case 'loop':
      return 'mdi:repeat-once'
    case 'random':
      return 'mdi:shuffle'
    default:
      return 'mdi:repeat'
  }
})

const playModeTitle = computed(() => {
  switch (musicStore.playMode) {
    case 'sequence':
      return '顺序播放'
    case 'loop':
      return '单曲循环'
    case 'random':
      return '随机播放'
    default:
      return '顺序播放'
  }
})

// 切换播放模式
const togglePlayMode = () => {
  const modes = ['sequence', 'loop', 'random'] as const
  const currentIndex = modes.indexOf(musicStore.playMode)
  const nextIndex = (currentIndex + 1) % modes.length
  const nextMode = modes[nextIndex]
  
  // 设置新的播放模式
  musicStore.setPlayMode(nextMode)
  
  // 显示提示信息（可以添加一个简单的提示组件）
  const modeMessages = {
    sequence: '顺序播放',
    loop: '单曲循环',
    random: '随机播放'
  }
  // TODO: 显示提示信息
  toastMessage.value = modeMessages[nextMode]
  showToast.value = true
  setTimeout(() => {
    showToast.value = false
  }, 2000)
}

// 切换音乐列表显示
const toggleMusicList = () => {
  showMusicList.value = !showMusicList.value
}

// 添加进度条拖动相关的状态
const isDragging = ref(false)
const isHovering = ref(false)

// 进度条拖动相关方法
const startDragging = (e: MouseEvent) => {
  isDragging.value = true
  handleDragging(e)
}

const handleDragging = (e: MouseEvent) => {
  if (!isDragging.value) return
  const bar = e.currentTarget as HTMLElement
  const rect = bar.getBoundingClientRect()
  const percent = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100))
  musicStore.setProgress(percent)
}

const stopDragging = () => {
  isDragging.value = false
}

/* 添加最新树洞数据 */
const latestWhispers = ref([
  {
    content: '哇哇哇',
    time: '刚刚',
    likes: 6,
    comments: 2,
    isNew: true
  },
  {
    content: '666',
    time: '10分钟前',
    likes: 8,
    comments: 3,
    isNew: true
  },
  {
    content: '植意来啦',
    time: '30分钟前',
    likes: 12,
    comments: 5,
    isNew: false
  },
  {
    content: '我爱你',
    time: '3小时前',
    likes: 25,
    comments: 11,
    isNew: false
  }
])
</script> 