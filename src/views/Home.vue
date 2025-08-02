<template>
  <div class="home">
    <!-- 添加视频背景 -->
    <div class="video-background">
      <video class="background-video" autoplay loop muted playsinline>
        <source src="/vedio/夏日的风.mp4" type="video/mp4">
      </video>
      <div class="overlay"></div>
    </div>

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
              <div class="music-view">
                <canvas ref="visualizerCanvas" class="audio-visualizer"></canvas>
              </div>

            </div>
            <div class="player-controls">
              <div class="progress-container">
                <span class="time">{{ formatTime(musicStore.currentTime) }}</span>
                <div class="progress-bar" @mousedown="startDragging" @mousemove="handleDragging" @mouseup="stopDragging"
                  @mouseleave="stopDragging" @click="handleProgressClick">
                  <div class="progress" :style="{ width: `${progress}%` }"></div>
                  <div class="progress-handle" :style="{ left: `${progress}%` }" v-show="isDragging || isHovering">
                  </div>
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
                  <input type="range" min="0" max="100" v-model="volume" @input="handleVolumeChange"
                    class="volume-slider" />
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
              <div class="car-container">
                <img class="car" src="/gif/car.gif" alt="行驶的小车动画">
              </div>
              <div class="home-friends-grid">
                <div v-for="friend in topFriends" :key="friend.name" class="home-friend-card"
                  @click="openFriendLink(friend.url)">
                  <div class="friend-avatar-container">
                    <img :src="friend.avatar" :alt="friend.name" class="friend-avatar">
                  </div>
                  <div class="friend-info">
                    <h4 class="friend-name">{{ friend.name }}</h4>
                    <!-- <p class="friend-desc">{{ friend.description }}</p> -->
                  </div>
                </div>
              </div>
              <div class="view-more-friends">
                <router-link to="/friends" class="more-friends-link">
                  <span>查看更多友链</span>
                  <Icon icon="material-symbols:arrow-forward" class="arrow-icon" />
                </router-link>
              </div>
            </div>

            <!-- 最新文章列表 -->
            <div class="recent-posts">
              <h3 class="section-title">最新文章</h3>
              <div class="post-list">
                <!-- 加载状态 -->
                <div v-if="isLoadingRecentPosts" class="post-loading">
                  <div class="mini-spinner"></div>
                  <span>加载中...</span>
                </div>

                <!-- 文章列表 -->
                <router-link v-else-if="recentPosts.length > 0" v-for="post in recentPosts" :key="post.id"
                  :to="{ name: 'article', params: { id: post.id } }" class="post-item">
                  <img :src="post.coverImage || post.cover || '/articles/cover/1.jpg'" :alt="post.title"
                    class="post-thumb" />
                  <div class="post-info">
                    <h4 class="post-title">{{ post.title }}</h4>
                    <span class="post-date">{{ formatDate(post.publishDate || post.createTime) }}</span>
                  </div>
                </router-link>

                <!-- 空状态 -->
                <div v-else class="post-empty">
                  <span>暂无最新文章</span>
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
                <div v-for="(whisper, index) in latestWhispers" :key="index" class="whisper-item"
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
            <!-- 加载状态 -->
            <div v-if="isLoadingArticles" class="loading-state">
              <div class="loading-spinner"></div>
              <span class="loading-text">正在加载精选文章...</span>
            </div>

            <!-- 空状态 -->
            <div v-else-if="featuredArticles.length === 0" class="empty-state">
              <div class="empty-icon">📰</div>
              <span class="empty-text">暂无精选文章</span>
              <span class="api-hint">请实现 API: GET /api/articles/recent</span>
            </div>

            <!-- 文章列表 -->
            <article v-else v-for="(article, index) in featuredArticles" :key="article.id" class="featured-article"
              :class="{ 'image-right': index % 2 === 1 }" @mousemove="handleMouseMove" @mouseleave="handleMouseLeave"
              ref="articleRefs">
              <div class="article-cover"
                :style="{ backgroundImage: `url(${article.coverImage || article.cover || '/articles/cover/1.jpg'})` }">
              </div>
              <div class="article-content">
                <div class="article-meta">
                  <span class="article-category">{{ article.category }}</span>
                  <span class="article-date">{{ formatDate(article.publishDate || article.createTime) }}</span>
                </div>
                <h3 class="article-title">{{ article.title }}</h3>
                <p class="article-summary">{{ article.aiSummary || article.excerpt || '暂无摘要...' }}</p>
                <div class="article-footer">
                  <div class="article-tags">
                    <span v-for="tag in article.tags" :key="tag" class="tag">{{ tag }}</span>
                  </div>
                  <router-link :to="{ name: 'article', params: { id: article.id } }" class="read-more">
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
            <div v-for="(song, index) in musicStore.playlist" :key="index" class="list-item"
              :class="{ 'active': song === musicStore.currentSong }" @click="musicStore.playSong(index)">
              <div class="song-info">
                <span class="song-title">{{ song.title }}</span>
                <span class="song-artist">{{ song.artist }}</span>
              </div>
              <Icon v-if="song === musicStore.currentSong"
                :icon="musicStore.isPlaying ? 'mdi:volume-high' : 'mdi:volume-off'" class="playing-icon" />
            </div>
          </div>
        </div>
      </div>
    </Transition>
    <!-- 添加提示组件 -->
    <div class="mode-toast" v-if="showToast" :class="{ 'show': showToast }">
      {{ toastMessage }}
    </div>

    <FooterBanner v-if="!$route.meta.hideFooter" />
  </div>
</template>

<style scoped>
.home {
  padding: 0;
  position: relative;
  min-height: 100vh;
  overflow-x: hidden;
}

/* 视频背景相关样式 */
.video-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: -1;
  overflow: hidden;
}

.background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 115%;
  /* 扩大尺寸超出屏幕 */
  height: 115%;
  /* 扩大尺寸超出屏幕 */
  object-fit: cover;
  transform: translate(-50%, -50%) scale(1.00);
  /* 初始缩放 */
  transition: transform 0.6s cubic-bezier(0.25, 0.45, 0.45, 0.95);
}

.overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

.main-content {
  padding: 20px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 300px;
  gap: 20px;
  max-width: 1200px;
  margin: 0 auto;
  position: relative;
  z-index: 2;
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
  background: transparent;
  background-size: cover;
  background-position: center;
  padding: 60px 0;
  text-align: center;
  position: relative;
  overflow: hidden;
  z-index: 1;
  height: 180px;
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
  background: rgba(0, 0, 0, 0.2);
  z-index: 2;
  backdrop-filter: blur(3px);
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
      transparent);
}

.title-wrapper::after {
  right: -120%;
  background: linear-gradient(90deg,
      transparent,
      #87CEEB 20%,
      #87CEEB 80%,
      transparent);
  transition-delay: 0.2s;
}

/* 添加额外的装饰线 */
.title-wrapper>span::before,
.title-wrapper>span::after {
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

.transition-banner:hover .title-wrapper>span::before,
.transition-banner:hover .title-wrapper>span::after {
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
  color: #87CEEB;
  /* 天蓝色 */
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
  color: rgb(135, 206, 235);
  /* 发光的蓝色 */
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
.title-wrapper>span::before,
.title-wrapper>span::after {
  transition: all 0.8s cubic-bezier(0.165, 0.84, 0.44, 1);
}

.section-desc {
  font-size: 1.2rem;
  color: #ffffff;
  opacity: 0.9;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.featured-articles {
  background: transparent;
  background-size: cover;
  background-position: center 30%;
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
  background: rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(3px);
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 12px;
  overflow: hidden;
  position: relative;
  transition: all 0.5s cubic-bezier(0.23, 1, 0.32, 1), box-shadow 0.3s ease;
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.2),
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
  background: linear-gradient(45deg,
      rgba(255, 255, 255, 0.1),
      rgba(255, 255, 255, 0.2));
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
  background: rgba(0, 0, 0, 0.4);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.4),
    inset 0 0 0 1px rgba(255, 255, 255, 0.1);
}

.dark-theme .featured-article:hover {
  box-shadow:
    0 0 25px rgba(135, 206, 235, 0.2),
    0 0 10px rgba(135, 206, 235, 0.1),
    0 0 5px rgba(135, 206, 235, 0.05),
    inset 0 0 0 1px rgba(135, 206, 235, 0.3);
  background: rgba(0, 0, 0, 0.5);
  transform: translateY(-2px);
}

.dark-theme .featured-article::before {
  background: linear-gradient(45deg,
      rgba(135, 206, 235, 0.1),
      rgba(135, 206, 235, 0.2));
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
  color: white;
  margin-bottom: 15px;
  line-height: 1.3;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.4);
}

.article-summary {
  color: rgba(255, 255, 255, 0.9);
  opacity: 0.9;
  margin-bottom: auto;
  line-height: 1.6;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
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
  --article-bg-image: url('/background/article-card-bg2.jpg');
  /* 日间模式背景 */
}

.dark-theme {
  --bg-primary-rgb: 26, 26, 26;
  --article-bg-image: url('/background/article-card-bg.jpg');
  /* 夜间模式背景 */
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
  background: rgba(135, 206, 235, 0.8);
  /* 半透明天蓝色 */
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
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: white;
}

.user-avatar {
  display: flex;
  /* 添加这行 */
  justify-content: center;
  /* 添加这行 */
  align-items: center;
  /* 添加这行 */
}

.user-avatar img {
  width: 160px;
  height: 160px;
  border: 1px solid rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  margin-bottom: 0px;
  margin-left: 0;
  /* 移除原来的 margin-left: 20% */
}

.username {
  font-size: 1.5rem;
  color: white;
  margin-bottom: 15px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
  color: white;
}

.label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
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
  padding: 12px 40px 12px 15px;
  border: none;
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.search-box input:focus {
  outline: none;
  box-shadow: 0 0 0 2px rgba(135, 206, 235, 0.4);
  background: rgba(255, 255, 255, 0.15);
}

.search-box input::placeholder {
  color: rgba(255, 255, 255, 0.6);
}

.search-icon {
  position: absolute;
  right: 15px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.7);
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
  background: linear-gradient(135deg, #87CEEB, #5B9FBF);
  /* 天蓝色到深天蓝色 */
}

.green {
  background: linear-gradient(135deg, #87CEEB, #48D1CC);
  /* 天蓝色到绿松石色 */
}

.orange {
  background: linear-gradient(135deg, #87CEEB, #6495ED);
  /* 天蓝色到矢车菊蓝 */
}

.pink {
  background: linear-gradient(135deg, #87CEEB, #4169E1);
  /* 天蓝色到皇家蓝 */
}

.friend-links {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  color: white;
  margin-top: 20px;
}

.car {
  /* margin-top: -100px; */
}

.car-container {
  display: flex;
  justify-content: center;
  margin: 10px 0;
  overflow: hidden;
}

.car {
  max-width: 100%;
  height: auto;
}

.home-friends-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
  margin-top: 15px;
}

.home-friend-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  cursor: pointer;
  aspect-ratio: 1/1;
  display: flex;
  flex-direction: column;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.home-friend-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.2), rgba(0, 0, 0, 0.7));
  z-index: 1;
}

.home-friend-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
  border-color: rgba(135, 206, 235, 0.3);
}

.home-friend-card:hover::before {
  background: linear-gradient(to bottom, rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.8));
}

.friend-avatar-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 0;
}

.friend-avatar {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: all 0.3s ease;
}

.home-friend-card:hover .friend-avatar {
  transform: scale(1.05);
}

.friend-info {
  padding: 15px;
  text-align: center;
  position: relative;
  z-index: 2;
  margin-top: auto;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
}

.friend-name {
  font-size: 1.1rem;
  margin: 0;
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.5);
}

.friend-desc {
  font-size: 0.8rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.7);
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

.view-more-friends {
  text-align: center;
  margin-top: 15px;
}

.more-friends-link {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #87CEEB;
  text-decoration: none;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.more-friends-link:hover {
  gap: 8px;
  color: white;
}

@media (max-width: 480px) {
  .home-friends-grid {
    grid-template-columns: 1fr;
  }

  .home-friend-card {
    aspect-ratio: auto;
    height: 100px;
    flex-direction: row;
  }

  .friend-avatar-container {
    width: 100%;
    height: 100%;
  }

  .friend-info {
    text-align: left;
    margin-left: 15px;
    justify-content: center;
  }
}

/* 最新文章列表样式 */
.recent-posts {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 12px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  color: white;
}

.section-title {
  font-size: 1.3rem;
  color: white;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: -5px;
  left: 0;
  width: 100%;
  height: 2px;
  background: #87CEEB;
  transition: width 0.3s ease;
}

.recent-posts:hover .section-title::after {
  width: 100%;
}

.post-item {
  display: flex;
  gap: 10px;
  padding: 10px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  color: inherit;
  text-decoration: none;
}

.post-item:hover {
  transform: translateX(5px);
  background: rgba(135, 206, 235, 0.1);
  border-radius: 6px;
  padding-left: 8px;
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

/* 最新文章加载和空状态样式 */
.post-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 20px;
  color: rgba(255, 255, 255, 0.7);
}

.mini-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(135, 206, 235, 0.2);
  border-top: 2px solid #87CEEB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.post-empty {
  text-align: center;
  padding: 20px;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
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
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--card-border-light);
  box-shadow: var(--card-shadow-light);
}

/* 搜索框特殊样式 */
.search-box input {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: var(--card-border-light);
  box-shadow: var(--card-shadow-light);
}

/* 暗色主题适配 */
.dark-theme .user-card,
.dark-theme .recent-posts,
.dark-theme .featured-article,
.dark-theme .friend-links,
.dark-theme .latest-whispers {
  background: rgba(20, 20, 20, 0.6);
  border: var(--card-border-dark);
  box-shadow: var(--card-shadow-dark);
}

.dark-theme .search-box input {
  background: rgba(20, 20, 20, 0.6);
  /* background: var(--card-bg-dark); */
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
  background: rgba(20, 20, 20, 0.6);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(135, 206, 235, 0.2);
  box-shadow:
    0 4px 20px rgba(0, 0, 0, 0.3),
    0 0 15px rgba(135, 206, 235, 0.1);
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
  max-width: 200px;
}

/* 音频可视化样式 */
.audio-visualizer {
  width: 100%;
  height: 60px;
  border-radius: 8px;
  background: transparent;
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
  0% {
    transform: translateX(0);
  }

  100% {
    transform: translateX(-100%);
  }
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

.music-view {
  width: 100%;
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
  background: rgba(20, 20, 20, 0.6);
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

.mode-btn,
.list-btn {
  opacity: 0.8;
  transition: all 0.3s ease;
}

.mode-btn:hover,
.list-btn:hover {
  opacity: 1;
  color: #87CEEB;
}

/* 音乐列表弹出层样式 */
.music-list-overlay {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  width: 350px;
  /* 设置合适的宽度 */
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
  left: -16px;
  /* 调整位置到左边 */
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

.list-item.active{
    color: #1b90be;
    background: rgb(98 210 255 / 23%);
}

.song-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.song-title {
  color: var(--text-primary);
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
  0% {
    opacity: 0.6;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0.6;
  }
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

/* 加载和空状态样式 */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 15px;
  padding: 60px 20px;
  text-align: center;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(135, 206, 235, 0.2);
  border-top: 3px solid #87CEEB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.loading-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  padding: 60px 20px;
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.empty-icon {
  font-size: 3rem;
  opacity: 0.6;
}

.empty-text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 1.1rem;
}

.api-hint {
  font-size: 0.9rem;
  color: rgba(255, 193, 7, 0.8);
  background: rgba(255, 193, 7, 0.1);
  padding: 8px 12px;
  border-radius: 6px;
  font-family: monospace;
  border: 1px solid rgba(255, 193, 7, 0.2);
}

/* 暗色主题适配 */
.dark-theme .loading-state,
.dark-theme .empty-state {
  background: rgba(20, 20, 20, 0.6);
  border: 1px solid rgba(135, 206, 235, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
}

.dark-theme .loading-spinner {
  border-color: rgba(135, 206, 235, 0.3);
  border-top-color: #87CEEB;
}

/* 最新树洞样式 */
.latest-whispers {
  background: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  border-radius: 12px;
  padding: 20px;
  margin-top: 20px;
  color: white;
}

.whispers-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 15px;
}

.whisper-item {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 12px;
  transition: all 0.3s ease;
  position: relative;
  border: 1px solid rgba(135, 206, 235, 0.1);
  backdrop-filter: blur(5px);
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
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
  background: rgba(0, 0, 0, 0.3);
  border-color: rgba(135, 206, 235, 0.2);
  box-shadow:
    0 4px 15px rgba(0, 0, 0, 0.2),
    0 0 10px rgba(135, 206, 235, 0.1);
}

.whisper-content {
  color: white;
  font-size: 0.9rem;
  line-height: 1.5;
  margin-bottom: 8px;
}

.whisper-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.7);
}

.audio-visualizer {
  width: 100%;
  height: 80px;
  margin: 0px 0px;
  border-radius: 0px;
  background: rgba(0, 0, 0, 0.0);
}

</style>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import Banner from '../components/Banner.vue'
import { Icon } from '@iconify/vue'
import { useMusicStore } from '../stores/music'
import { useDark } from '@vueuse/core'
import { config } from '../config/index'
import { getRecentArticles, type Article } from '../services/article'
import { formatDate } from '../utils/formatDate'
import FooterBanner from '@/components/FooterBanner.vue'

const articleRefs = ref<HTMLElement[]>([])
const musicStore = useMusicStore()
const showToast = ref(false)
const toastMessage = ref('')
const volume = ref(20)
const previousVolume = ref(20)
const shouldMarquee = ref(false)
const shouldMarqueeArtist = ref(false)

// 音频可视化相关
const visualizerCanvas = ref<HTMLCanvasElement | null>(null)
let audioContext: AudioContext
let analyser: AnalyserNode
let dataArray: Uint8Array
let animationId: number
const lastVisualizerUpdate = ref(0)
const visualizerFrameRate = ref(60) // 将帧率从默认的60FPS降低到30FPS
const smoothFactor = ref(0.2) // 平滑因子，值在0-1之间，值越小越平滑

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

// 文章数据和加载状态
const featuredArticles = ref<Article[]>([])
const isLoadingArticles = ref(true)

// 最新文章数据
const recentPosts = ref<Article[]>([])
const isLoadingRecentPosts = ref(true)

// 初始化音频可视化
const initAudioVisualizer = () => {
  if (!visualizerCanvas.value) return
  
  const canvas = visualizerCanvas.value
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  
  // 设置canvas尺寸
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  
  // 创建音频上下文
  audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
  analyser = audioContext.createAnalyser()
  analyser.fftSize = 256
  
  const bufferLength = analyser.frequencyBinCount
  dataArray = new Uint8Array(bufferLength)
  
  // 创建一个虚拟音频元素用于分析
  const audio = new Audio()
  audio.src = musicStore.currentSong.src
  audio.crossOrigin = "anonymous"
  
  // 连接音频源
  const source = audioContext.createMediaElementSource(audio)
  source.connect(analyser)
  analyser.connect(audioContext.destination)
  
  // 如果音乐正在播放，也播放这个音频
  if (musicStore.isPlaying) {
    audio.play()
  }
  
  // 开始绘制
  drawVisualizer(ctx, canvas.width, canvas.height, bufferLength)
  
  // 监听音乐播放状态变化
  watch(() => musicStore.isPlaying, (playing) => {
    if (playing) {
      audio.play()
    } else {
      audio.pause()
    }
  })
  
  // 监听歌曲变化
  watch(() => musicStore.currentSong, (newSong) => {
    audio.src = newSong.src
    if (musicStore.isPlaying) {
      audio.play()
    }
  })
}

// 绘制可视化效果
const drawVisualizer = (ctx: CanvasRenderingContext2D, width: number, height: number, bufferLength: number) => {
  // 添加帧率控制
  const now = performance.now()
  const deltaTime = now - lastVisualizerUpdate.value || 0
  const minFrameTime = 1000 / visualizerFrameRate.value
  
  if (deltaTime >= minFrameTime) {
    lastVisualizerUpdate.value = now
    
    analyser.getByteFrequencyData(dataArray)
    
    ctx.clearRect(0, 0, width, height)
    
    // 固定柱子宽度为4px，间距为2px
    const barWidth = 4
    const gap = 2
    const barTotalWidth = barWidth + gap
    
    // 计算可以容纳的柱子数量
    const barCount = Math.floor(width / barTotalWidth)
    
    // 根据主题模式设置柱子颜色
    if (isDark.value) {
      // 暗黑模式使用主题蓝色和发光效果
      ctx.fillStyle = '#87CEEB'
      ctx.shadowColor = '#87CEEB'
      ctx.shadowBlur = 8
    } else {
      // 白天模式使用黑色，不发光
      ctx.fillStyle = '#2e2e2e'
      ctx.shadowColor = '2e2e2e'
      ctx.shadowBlur = 0
    }
    
    // 计算起始位置，使柱子居中
    const startX = (width - barCount * barTotalWidth + gap) / 2
    
    // 添加一个数组来存储上一帧的柱子高度
    const previousHeights = (window as any).previousHeights || new Array(barCount).fill(0)
    ;(window as any).previousHeights = previousHeights
    
    for (let i = 0; i < barCount; i++) {
      // 从dataArray中采样数据，如果barCount大于bufferLength，则进行插值
      let dataIndex = Math.floor(i * bufferLength / barCount)
      // 修改柱子的最大高度为容器高度的80%
      let targetHeight = (dataArray[dataIndex] / 255) * (height * 0.8)
      
      // 应用平滑过渡效果
      let barHeight = previousHeights[i] + (targetHeight - previousHeights[i]) * smoothFactor.value
      previousHeights[i] = barHeight
      
      // 绘制柱状图
      ctx.fillRect(startX + i * barTotalWidth, height - barHeight, barWidth, barHeight)
    }
  }
  
  animationId = requestAnimationFrame(() => drawVisualizer(ctx, width, height, bufferLength))
}

// 在播放按钮点击事件中使用
const handlePlayClick = () => {
  musicStore.togglePlay()
  if (!audioContext && musicStore.isPlaying) {
    initAudioVisualizer()
  }
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

// 监听音乐播放状态
watch(() => musicStore.isPlaying, (playing) => {
  if (playing && !audioContext) {
    initAudioVisualizer()
  }
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

// 添加视差效果处理函数
const handleParallax = (e: MouseEvent) => {
  const video = document.querySelector('.background-video') as HTMLElement;
  if (!video) return;

  // 计算鼠标位置相对于窗口中心的偏移百分比
  const mouseX = e.clientX / window.innerWidth - 0.5; // -0.5 到 0.5 之间
  const mouseY = e.clientY / window.innerHeight - 0.5; // -0.5 到 0.5 之间

  // 计算视频位移，乘以一个小系数使得移动效果轻微
  const moveX = -(mouseX * 200); // 水平方向移动系数
  const moveY = -(mouseY * 200); // 垂直方向移动系数

  // 应用变换，包括初始的居中和缩放
  video.style.transform = `translate(calc(-50% + ${moveX}px), calc(-50% + ${moveY}px)) scale(1.1)`;
}

// 在组件挂载时添加鼠标移动事件监听
onMounted(() => {
  checkMarquee();
  window.addEventListener('resize', checkMarquee);

  // 添加视差效果的事件监听
  window.addEventListener('mousemove', handleParallax);

  // 每5秒切换一次文本
  setInterval(switchText, 5000);

  // 设置主题监听
  const cleanupThemeListener = setupThemeListener()

  // 获取文章和友链数据
  fetchFeaturedArticles();
  fetchRecentPosts();
  fetchTopFriends();
  
  // 如果音乐正在播放，初始化音频可视化
  if (musicStore.isPlaying) {
    initAudioVisualizer();
  }
});

// 在组件卸载时移除事件监听
onUnmounted(() => {
  window.removeEventListener('resize', checkMarquee);
  window.removeEventListener('mousemove', handleParallax);

  // 移除主题变化监听器在此处应该也被清理
  const cleanupThemeListener = setupThemeListener()
  cleanupThemeListener()
  
  // 清理音频可视化资源
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  if (audioContext) {
    audioContext.close();
  }
  
  // 清理音频元素
  const audioElements = document.querySelectorAll('audio')
  audioElements.forEach(audio => {
    audio.pause()
    audio.src = ''
  })
});

// 友链相关
// 定义友链类型
interface FriendLink {
  name: string;
  avatar: string;
  url: string;
  description: string;
  category?: string;
  cover?: string;
}

const topFriends = ref<FriendLink[]>([]);

// 获取特色文章数据
const fetchFeaturedArticles = async () => {
  try {
    isLoadingArticles.value = true
    const articles = await getRecentArticles(3) // 获取最新3篇文章作为特色文章
    featuredArticles.value = articles
    console.log('特色文章加载成功:', articles.length)
  } catch (error) {
    console.error('加载特色文章失败:', error)
    featuredArticles.value = []
  } finally {
    isLoadingArticles.value = false
  }
}

// 获取最新文章数据（侧边栏显示）
const fetchRecentPosts = async () => {
  try {
    isLoadingRecentPosts.value = true
    const articles = await getRecentArticles(3) // 获取最新3篇文章
    recentPosts.value = articles
    console.log('最新文章加载成功:', articles.length)
  } catch (error) {
    console.error('加载最新文章失败:', error)
    recentPosts.value = []
  } finally {
    isLoadingRecentPosts.value = false
  }
}

// 获取友链数据
const fetchTopFriends = async () => {
  try {
    const response = await fetch(`${config.api.apiUrl}/friend-links`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      console.error('获取友链失败:', response.status);
      return;
    }

    const data = await response.json();

    if (data.success) {
      // 只展示3个友链
      topFriends.value = data.data.friends.slice(0, 3);
    }
  } catch (error) {
    console.error('获取友链出错:', error);
  }
};

// 打开友链
const openFriendLink = (url: string) => {
  const fullUrl = url.startsWith('http') ? url : `https://${url}`;
  window.open(fullUrl, '_blank', 'noopener noreferrer');
};

// 监听主题变化事件
const setupThemeListener = () => {
  const handleThemeChange = () => {
    // 重新计算依赖isDark的计算属性
    checkMarquee()
  }

  document.addEventListener('themeChange', handleThemeChange)

  return () => {
    document.removeEventListener('themeChange', handleThemeChange)
  }
}
</script>