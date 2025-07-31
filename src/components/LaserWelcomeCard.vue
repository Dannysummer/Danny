<template>
  <!-- 容器 -->
  <div class="container">
    <!-- 卡片容器，初始状态为激活状态 -->
    <div class="card-wrapper" ref="wrap" :class="{ active: isActive }">
      <!-- 卡片，初始状态为激活状态 -->
      <section id="card" ref="card" :class="{ active: isActive }">
        <!-- 内部容器 -->
        <div class="inside" :class="{ active: isActive }">
          <!-- 激光效果 -->
          <div class="card__laser" :class="{ active: isActive }"></div>
          <!-- 头像内容 -->
          <div class="card__content avatar__content">
            <!-- 头像图片 -->
            <img class="avatar" :src="avatarSrc" alt="" />
          </div>
          <!-- 其他内容 -->
          <div class="card__content">
            <!-- 详细信息 -->
            <div class="card__details">
              <!-- 标题 -->
              <h3>{{ title }}</h3>
              <!-- 描述 -->
              <p>{{ subtitle }}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  </div>
</template>

<script>
export default {
  name: "LaserWelcomeCard",
  props: {
    title: {
      type: String,
      default: "_技术小白_"
    },
    subtitle: {
      type: String,
      default: "Technical Novice"
    },
    avatarSrc: {
      type: String,
      default: "/iamges/Avatar.png"
    },
    autoAnimate: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      isActive: true,
      easer: null,
      animationId: null,
      observer: null,
      mouseTracking: false,
      firstInteraction: false,
      initialAnimationComplete: false,
      mousePosition: { x: 0, y: 0 },
      targetPosition: { x: 0, y: 0 },
      lastTimestamp: 0,
      isDragging: false
    };
  },
  mounted() {
    this.$nextTick(() => {
      // 确保DOM已渲染
      this.setupInitialState();
      
      // 添加可见性观察器
      this.setupIntersectionObserver();
      
      // 开始动画循环
      if (this.autoAnimate) {
        this.startAnimationLoop();
      }
    });
  },
  beforeUnmount() {
    // 清理所有事件和定时器
    this.cleanup();
  },
  methods: {
    setupInitialState() {
      const card = this.$refs.card;
      const wrap = this.$refs.wrap;
      
      if (!card || !wrap) return;
      
      // 添加事件监听器
      card.addEventListener("pointerenter", this.handleFirstPointerEnter);
      
      // 设置全局事件以追踪指针位置，即使不在卡片上
      document.addEventListener("pointermove", this.updateMousePosition);
      
      // 基本样式设置
      this.setStaticPosition(wrap);
      
      // 启动初始动画序列
      this.startInitialAnimation();
    },
    
    updateMousePosition(e) {
      // 全局鼠标位置追踪
      this.mousePosition = {
        x: e.clientX,
        y: e.clientY
      };
    },
    
    startAnimationLoop() {
      // 创建平滑动画的循环
      const animationStep = (timestamp) => {
        if (!this.lastTimestamp) {
          this.lastTimestamp = timestamp;
        }
        
        const deltaTime = timestamp - this.lastTimestamp;
        this.lastTimestamp = timestamp;
        
        // 只有在鼠标追踪模式下才平滑追踪
        if (this.mouseTracking && !this.isDragging) {
          // 平滑追踪鼠标位置的逻辑
          this.smoothCardUpdate(deltaTime);
        }
        
        // 继续动画循环
        this.animationId = requestAnimationFrame(animationStep);
      };
      
      this.animationId = requestAnimationFrame(animationStep);
    },
    
    smoothCardUpdate(deltaTime) {
      const card = this.$refs.card;
      const wrap = this.$refs.wrap;
      
      if (!card || !wrap) return;
      
      // 获取卡片相对于视口的位置
      const rect = card.getBoundingClientRect();
      
      // 计算相对于卡片的鼠标位置
      const relativeX = this.mousePosition.x - rect.left;
      const relativeY = this.mousePosition.y - rect.top;
      
      // 检查鼠标是否在卡片上
      const isMouseInCard = 
        relativeX >= 0 && 
        relativeX <= rect.width && 
        relativeY >= 0 && 
        relativeY <= rect.height;
      
      // 如果鼠标在卡片上，将目标设为当前鼠标位置
      if (isMouseInCard) {
        this.targetPosition = {
          x: relativeX,
          y: relativeY
        };
      } else if (!this.firstInteraction) {
        // 如果是首次加载且鼠标不在卡片上，将目标设为中心
        this.targetPosition = {
          x: rect.width / 2,
          y: rect.height / 2
        };
      }
      
      // 使用LERP平滑过渡到目标位置
      const easeFactor = 0.08; // 调整这个值可以改变过渡速度
      const lerpX = this.lerp(this.targetPosition.x, relativeX, easeFactor * (deltaTime / 16.67));
      const lerpY = this.lerp(this.targetPosition.y, relativeY, easeFactor * (deltaTime / 16.67));
      
      // 更新卡片样式
      this.cardUpdate({ 
        offsetX: isMouseInCard ? relativeX : lerpX, 
        offsetY: isMouseInCard ? relativeY : lerpY
      });
    },
    
    // 线性插值函数
    lerp(start, end, t) {
      return start + (end - start) * t;
    },
    
    setStaticPosition(wrap) {
      // 设置卡片的静态初始位置
      wrap.style.setProperty("--pointer-x", "50%");
      wrap.style.setProperty("--pointer-y", "50%");
      wrap.style.setProperty("--background-x", "50%");
      wrap.style.setProperty("--background-y", "50%");
      wrap.style.setProperty("--pointer-from-center", "0");
      wrap.style.setProperty("--pointer-from-top", "0.5");
      wrap.style.setProperty("--pointer-from-left", "0.5");
      wrap.style.setProperty("--card-opacity", "1");
      wrap.style.setProperty("--rotate-x", "0deg");
      wrap.style.setProperty("--rotate-y", "0deg");
    },
    
    startInitialAnimation() {
      const wrap = this.$refs.wrap;
      if (!wrap) return;
      
      // 使用setTimeout来模拟原始代码中的延迟动画效果
      setTimeout(() => {
        // 首先设置初始位置（右上角）
        this.cardUpdate({ offsetX: wrap.clientWidth - 70, offsetY: 60 });
        
        // 然后添加动画，从右上角移动到中心位置
        const halfW = wrap.clientWidth / 2;
        const halfH = wrap.clientHeight / 2;
        
        this.easer = this.easedFunc(
          3000, // 持续3秒
          (p) => {
            // 从右上角逐渐移动到中心
            let x = this.adjust(p, 0, 1, wrap.clientWidth - 70, halfW);
            let y = this.adjust(p, 0, 1, 60, halfH);
            this.cardUpdate({ offsetX: x, offsetY: y });
          },
          () => {
            // 动画完成后设置为非活动状态
            this.isActive = false;
            this.initialAnimationComplete = true;
            
            // 设置目标位置为中心
            this.targetPosition = {
              x: halfW,
              y: halfH
            };
          }
        );
      }, 500); // 延迟500ms开始动画
    },
    
    handleFirstPointerEnter(e) {
      // 处理首次鼠标进入
      const card = this.$refs.card;
      if (card) {
        card.removeEventListener("pointerenter", this.handleFirstPointerEnter);
      }
      
      // 标记为正在拖动，避免LERP动画干扰
      this.isDragging = true;
      
      // 取消任何正在进行的动画
      if (this.easer && this.easer.cancel) {
        this.easer.cancel();
        this.easer = null;
      }
      
      // 启用完整的交互
      this.enableFullInteraction();
      
      // 设置活动状态
      this.isActive = true;
      this.firstInteraction = true;
      
      // 处理当前鼠标位置
      this.cardUpdate(e);
      
      // 延迟一会后取消拖动标记
      setTimeout(() => {
        this.isDragging = false;
      }, 50);
    },
    
    enableFullInteraction() {
      const card = this.$refs.card;
      if (!card) return;
      
      // 完整的鼠标事件监听
      card.addEventListener("pointerenter", this.handlePointerEnter);
      card.addEventListener("pointermove", this.handlePointerMove);
      card.addEventListener("pointerleave", this.handlePointerOut);
      
      // 启用鼠标跟踪
      this.mouseTracking = true;
    },
    
    setupIntersectionObserver() {
      if ('IntersectionObserver' in window) {
        this.observer = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              // 当卡片进入视口
              if (this.initialAnimationComplete) {
                // 如果初始动画已完成，根据是否有过交互决定行为
                if (this.firstInteraction) {
                  this.enableFullInteraction();
                } else {
                  // 保持静态状态
                  this.isActive = true;
                }
              } else {
                // 如果初始动画未完成，重新开始初始动画
                this.isActive = true;
                this.startInitialAnimation();
              }
            } else {
              // 当卡片离开视口，取消所有动画
              this.cleanup(false);
            }
          });
        }, { 
          threshold: 0.2, // 当20%的卡片可见时触发
          rootMargin: "100px" // 提供额外的触发空间
        });
        
        if (this.$refs.wrap) {
          this.observer.observe(this.$refs.wrap);
        }
      }
    },
    
    handlePointerMove(e) {
      // 鼠标移动时设置为拖动状态
      this.isDragging = true;
      this.cardUpdate(e);
      
      // 移动时更新目标位置
      const rect = this.$refs.card.getBoundingClientRect();
      this.targetPosition = {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
      };
      
      // 短暂延迟后取消拖动状态，使平滑动画能够接管
      clearTimeout(this.dragTimeout);
      this.dragTimeout = setTimeout(() => {
        this.isDragging = false;
      }, 50);
    },
    
    cleanup(removeObserver = true) {
      // 清理所有事件监听器和动画
      const card = this.$refs.card;
      if (card) {
        card.removeEventListener("pointerenter", this.handleFirstPointerEnter);
        card.removeEventListener("pointerenter", this.handlePointerEnter);
        card.removeEventListener("pointermove", this.handlePointerMove);
        card.removeEventListener("pointerleave", this.handlePointerOut);
      }
      
      // 移除全局事件监听
      document.removeEventListener("pointermove", this.updateMousePosition);
      
      // 取消动画
      if (this.easer && this.easer.cancel) {
        this.easer.cancel();
        this.easer = null;
      }
      
      // 清除定时器
      clearTimeout(this.dragTimeout);
      
      // 取消所有帧动画
      if (this.animationId) {
        cancelAnimationFrame(this.animationId);
        this.animationId = null;
      }
      
      // 如果需要，取消观察器
      if (removeObserver && this.observer) {
        this.observer.disconnect();
        this.observer = null;
      }
    },
    
    cardUpdate(e) {
      // 如果不跟踪鼠标或者元素不存在，直接返回
      if (!this.mouseTracking && this.firstInteraction) return;
      
      const wrap = this.$refs.wrap;
      const card = this.$refs.card;
      
      if (!wrap || !card) return;
      
      // 获取鼠标位置
      let pos = [e.offsetX, e.offsetY];
      
      // 处理触摸事件
      if (e.pointerType === "touch") {
        e.preventDefault();
        // 触摸事件需要特殊处理，因为offsetX/Y在某些浏览器的触摸事件中可能不准确
        const rect = card.getBoundingClientRect();
        pos = [e.clientX - rect.left, e.clientY - rect.top];
      }
      
      // 获取卡片尺寸
      const dimensions = card.getBoundingClientRect();
      const l = pos[0];
      const t = pos[1];
      const h = dimensions.height;
      const w = dimensions.width;
      
      // 计算鼠标位置百分比
      const px = this.clamp(Math.abs((100 / w) * l), 0, 100);
      const py = this.clamp(Math.abs((100 / h) * t), 0, 100);
      
      // 计算相对中心的位置
      const cx = px - 50;
      const cy = py - 50;
      
      // 计算鼠标与中心的距离
      const fromCenter = this.clamp(
        Math.sqrt((py - 50) * (py - 50) + (px - 50) * (px - 50)) / 50,
        0,
        1
      );
      
      // 根据鼠标距中心的距离计算动态旋转角度的强度
      const rotateIntensity = this.ease(fromCenter); // 使用缓动函数
      
      // 更新CSS变量
      wrap.style.setProperty("--pointer-x", `${px}%`);
      wrap.style.setProperty("--pointer-y", `${py}%`);
      wrap.style.setProperty("--background-x", `${this.adjust(px, 0, 100, 35, 65)}%`);
      wrap.style.setProperty("--background-y", `${this.adjust(py, 0, 100, 35, 65)}%`);
      wrap.style.setProperty("--pointer-from-center", `${fromCenter}`);
      wrap.style.setProperty("--pointer-from-top", `${py / 100}`);
      wrap.style.setProperty("--pointer-from-left", `${px / 100}`);
      wrap.style.setProperty("--rotate-x", `${this.round(-(cx / 5) * rotateIntensity)}deg`);
      wrap.style.setProperty("--rotate-y", `${this.round((cy / 4) * rotateIntensity)}deg`);
      wrap.style.setProperty("--card-opacity", "1");
    },
    
    handlePointerEnter(e) {
      // 鼠标进入时设置活动状态
      this.isActive = true;
      this.isDragging = true;
      
      // 取消之前的动画
      if (this.easer && this.easer.cancel) {
        this.easer.cancel();
        this.easer = null;
      }
      
      // 直接处理鼠标位置
      this.cardUpdate(e);
      
      // 延迟后恢复平滑过渡
      setTimeout(() => {
        this.isDragging = false;
      }, 50);
    },
    
    handlePointerOut(e) {
      const wrap = this.$refs.wrap;
      const card = this.$refs.card;
      if (!wrap || !card) return;
      
      // 清除之前的动画
      if (this.easer && this.easer.cancel) {
        this.easer.cancel();
        this.easer = null;
      }
      
      // 获取卡片尺寸和中心点
      const dimensions = card.getBoundingClientRect();
      const halfW = wrap.clientWidth / 2;
      const halfH = wrap.clientHeight / 2;
      
      // 获取鼠标位置
      const rect = card.getBoundingClientRect();
      const offsetX = e.clientX - rect.left;
      const offsetY = e.clientY - rect.top;
      
      // 先立即更新当前位置，避免跳跃
      this.cardUpdate({ offsetX, offsetY });
      
      // 设置目标位置为中心点
      this.targetPosition = {
        x: halfW,
        y: halfH
      };
      
      // 使用全新的缓动函数，模拟原始实现
      this.easer = this.easedFunc(
        1200, // 使用与原始代码相似的持续时间
        (p) => {
          // 使用纯三次方缓动函数，与原始代码一致
          const easedP = this.ease(p);
          
          // 从当前位置平滑过渡到中心位置，直接使用adjust函数
          let x = this.adjust(easedP, 0, 1, offsetX, halfW);
          let y = this.adjust(easedP, 0, 1, offsetY, halfH);
          
          // 使用cardUpdate方法更新位置，与原始代码保持一致
          this.cardUpdate({ offsetX: x, offsetY: y });
          
          // 在过渡结束阶段逐渐移除活跃状态
          if (p > 0.7) {
            const opacityFade = this.adjust(p, 0.7, 1, 1, 0);
            wrap.style.setProperty("--card-opacity", `${opacityFade}`);
          }
        },
        () => {
          // 动画完成后完全重置状态
          this.isActive = false;
          
          // 确保静态位置设置回中心
          this.setStaticPosition(wrap);
          this.isDragging = false;
        }
      );
    },
    
    // 多阶段平滑缓动函数，实现更自然的退出动画
    multiStageEasing(x) {
      if (x < 0.5) {
        // 前半程使用缓入函数，开始慢速过渡
        return this.easeInOutCubic(x * 2) / 2;
      } else {
        // 后半程使用缓出函数，结束慢速过渡
        return 0.5 + this.smoothOut((x - 0.5) * 2) / 2;
      }
    },
    
    // 平滑退出缓动函数
    smoothOut(x) {
      return 1 - Math.pow(1 - x, 3);
    },
    
    // 缓入缓出三次方缓动函数
    easeInOutCubic(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    },
    
    // 缓动函数，与原始代码一致
    ease(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    },
    
    // 弹性缓动
    elasticOut(x) {
      const c4 = (2 * Math.PI) / 3;
      
      return x === 0
        ? 0
        : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
    },
    
    easedFunc(durationMs, onProgress, onComplete) {
      let startTime = performance.now();
      let canceled = false;
      
      const loop = () => {
        if (canceled) return;
        
        const currentTime = performance.now();
        const progress = Math.min((currentTime - startTime) / durationMs, 1);
        const easedProgress = this.ease(progress);
        
        onProgress(easedProgress);
        
        if (progress < 1) {
          this.animationId = requestAnimationFrame(loop);
        } else {
          if (onComplete) onComplete();
          this.animationId = null;
        }
      };
      
      this.animationId = requestAnimationFrame(loop);
      
      return {
        cancel: () => {
          canceled = true;
          if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
          }
        }
      };
    },
    
    // 辅助函数，与原始代码完全一致
    round(value, precision = 3) {
      return parseFloat(value.toFixed(precision));
    },
    
    clamp(value, min = 0, max = 100) {
      return Math.min(Math.max(value, min), max);
    },
    
    adjust(value, fromMin, fromMax, toMin, toMax) {
      return this.round(
        toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin)
      );
    }
  }
};
</script>

<style>
:root {
  --pointer-x: 50%;
  --pointer-y: 50%;
  --pointer-from-center: 0;
  --pointer-from-top: 0.5;
  --pointer-from-left: 0.5;
  --card-opacity: 0;
  --rotate-x: 0deg;
  --rotate-y: 0deg;
  --background-x: 50%;
  --background-y: 50%;
  --card-scale: 1;
  --translate-x: 0px;
  --translate-y: 0px;

  --grain: url(/public/laserCard/grain.webp);
  --metafy: url(/public/laserCard/circle_repeat.png);
  --sunpillar-1: hsl(2, 100%, 73%);
  --sunpillar-2: hsl(53, 100%, 69%);
  --sunpillar-3: hsl(93, 100%, 69%);
  --sunpillar-4: hsl(176, 100%, 76%);
  --sunpillar-5: hsl(228, 100%, 74%);
  --sunpillar-6: hsl(283, 100%, 73%);
  --sunpillar-clr-1: var(--sunpillar-1);
  --sunpillar-clr-2: var(--sunpillar-2);
  --sunpillar-clr-3: var(--sunpillar-3);
  --sunpillar-clr-4: var(--sunpillar-4);
  --sunpillar-clr-5: var(--sunpillar-5);
  --sunpillar-clr-6: var(--sunpillar-6);

  --card-radius: 6.55% / 4.75%;

  --canvas: 220;
  --bg: hsl(var(--canvas), 15%, 22%);
}

.container {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 100%;
  overflow: visible;
  padding: 20px;
}

.card-wrapper {
  position: relative;
  perspective: 500px;
  transform: translate3d(0, 0, 0.1px);
  cursor: pointer;
  width: 100%;
  max-width: 400px;
  margin-bottom: 30px;
  overflow: visible;
}

.card-wrapper:hover,
.card-wrapper.active {
  --card-opacity: 1;
}

.card-wrapper::before {
  content: "";
  position: absolute;
  inset: -10px;
  z-index: -1;
  border-radius: calc(var(--card-radius) + 2%);
  background-image: radial-gradient(
    farthest-side circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
    hsla(266, 100%, 90%, 0.8) 10%,
    hsla(266, 25%, 70%, 0.5) 50%,
    hsla(266, 0%, 60%, 0) 100%
  );
  filter: contrast(1) saturate(1.5) blur(40px) opacity(0.8);
  transform: scale(0.85) translate3d(0, 0, 0.1px);
  transition: filter 0.6s ease, transform 0.6s ease;
  pointer-events: none;
}

.card-wrapper.active::before {
  filter: contrast(1) saturate(2) blur(40px) opacity(1);
  transform: scale(0.9) translate3d(0, 0, 0.1px);
}

#card {
  height: 80vh;
  max-height: 540px;
  display: grid;
  aspect-ratio: 0.718;
  border-radius: var(--card-radius);
  position: relative;
  background-blend-mode: color-dodge, normal, normal, normal, normal;
  animation: glow 12s linear infinite;
  box-shadow: rgba(0, 0, 0, 0.8) calc((var(--pointer-from-left) * 10px) - 3px)
    calc((var(--pointer-from-top) * 20px) - 6px) 20px -5px;
  transition: transform 1s ease;
  transform: translate3d(0, 0, 0.1px) rotateX(0deg) rotateY(0deg);
  background-size: 100% 100%;
  background-position: 0px 0px, 0px 0px, 50% 50%, 0px 0px;
  background-image: radial-gradient(
      farthest-side circle at var(--pointer-x, 50%) var(--pointer-y, 50%),
      hsla(266, 100%, 90%, var(--card-opacity)) 4%,
      hsla(266, 50%, 80%, calc(var(--card-opacity) * 0.75)) 10%,
      hsla(266, 25%, 70%, calc(var(--card-opacity) * 0.5)) 50%,
      hsla(266, 0%, 60%, 0) 100%
    ),
    radial-gradient(35% 52% at 55% 20%, #00ffaac4 0%, #073aff00 100%),
    radial-gradient(100% 100% at 50% 50%, #00c1ffff 1%, #073aff00 76%),
    conic-gradient(
      from 124deg at 50% 50%,
      #c137ffff 0%,
      #07c6ffff 40%,
      #07c6ffff 60%,
      #c137ffff 100%
    );

  overflow: visible;
  padding-bottom: 2%;
}

#card:hover,
#card.active {
  transition: none;
  transform: translate3d(0, 0, 0.1px) rotateX(var(--rotate-y))
    rotateY(var(--rotate-x));
}

#card * {
  display: grid;
  grid-area: 1/-1;
  border-radius: var(--card-radius);
  transform: translate3d(0px, 0px, 0.1px);
  pointer-events: none;
}

#card .inside {
  inset: 1px;
  position: absolute;
  background-image: linear-gradient(145deg, #60496e8c 0%, #71c4ff44 100%);
  background-color: rgb(0 0 0 / 90%);
  transform: translate3d(0px, 0px, 0.01px);
  overflow: visible;
  transition: all 0.8s ease;
}

#card .inside.active {
  box-shadow: 0 0 30px rgba(114, 137, 218, 0.15) inset;
}

.card__laser {
  mask-image: var(--metafy);
  mask-mode: luminance;
  mask-repeat: repeat;
  mask-size: 150%;
  mask-position: top calc(200% - (var(--background-y) * 5)) left
    calc((100% - var(--background-x)));
  transition: filter 0.6s ease, opacity 0.8s ease-in-out;
  filter: brightness(0.66) contrast(1.33) saturate(0.33) opacity(0.5);
  animation: holo 18s linear infinite;
  mix-blend-mode: color-dodge;
  overflow: visible;
}

.card__laser.active {
  opacity: 1;
}

.card__laser,
.card__laser::after {
  --space: 5%;
  --angle: -45deg;
  display: grid;
  transform: translate3d(0, 0, 1px);
  overflow: visible;
  z-index: 3;
  background: transparent;
  background-size: cover;
  background-position: center;
  background-image: repeating-linear-gradient(
      0deg,
      var(--sunpillar-clr-1) calc(var(--space) * 1),
      var(--sunpillar-clr-2) calc(var(--space) * 2),
      var(--sunpillar-clr-3) calc(var(--space) * 3),
      var(--sunpillar-clr-4) calc(var(--space) * 4),
      var(--sunpillar-clr-5) calc(var(--space) * 5),
      var(--sunpillar-clr-6) calc(var(--space) * 6),
      var(--sunpillar-clr-1) calc(var(--space) * 7)
    ),
    repeating-linear-gradient(
      var(--angle),
      #0e152e 0%,
      hsl(180, 10%, 60%) 3.8%,
      hsl(180, 29%, 66%) 4.5%,
      hsl(180, 10%, 60%) 5.2%,
      #0e152e 10%,
      #0e152e 12%
    ),
    radial-gradient(
      farthest-corner circle at var(--pointer-x) var(--pointer-y),
      hsla(0, 0%, 0%, 0.1) 12%,
      hsla(0, 0%, 0%, 0.15) 20%,
      hsla(0, 0%, 0%, 0.25) 120%
    );
  background-position: 0% var(--background-y),
    calc(var(--background-x)) var(--background-y), center center;
  background-blend-mode: color, hard-light;
  background-size: 500% 500%, 300% 300%, 200% 200%;
  background-repeat: repeat;
}

.card__laser::before,
.card__laser::after {
  content: "";
  background-position: center;
  background-size: cover;
  grid-area: 1/1;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.5s ease-in-out;
}

#card:hover .card__laser,
#card.active .card__laser {
  filter: brightness(0.85) contrast(1.5) saturate(0.5);
  animation: none;
}

#card:hover .card__laser::before,
#card:hover .card__laser::after,
#card.active .card__laser::before,
#card.active .card__laser::after {
  opacity: 1;
}

.card__laser::before {
  background-image: linear-gradient(
      45deg,
      var(--sunpillar-4),
      var(--sunpillar-5),
      var(--sunpillar-6),
      var(--sunpillar-1),
      var(--sunpillar-2),
      var(--sunpillar-3)
    ),
    radial-gradient(
      circle at var(--pointer-x) var(--pointer-y),
      hsl(0, 0%, 70%) 0%,
      hsla(0, 0%, 30%, 20%) 90%
    ),
    var(--grain);

  background-size: 250% 250%, 100% 100%, 220px 220px;
  background-position: var(--pointer-x) var(--pointer-y), center center,
    calc(var(--pointer-x) * 0.01) calc(var(--pointer-y) * 0.01);
  background-blend-mode: color-dodge;

  filter: brightness(calc(2 - var(--pointer-from-center)))
    contrast(calc(var(--pointer-from-center) + 2))
    saturate(calc(0.5 + var(--pointer-from-center)));
  mix-blend-mode: luminosity;
}

.card__laser::after {
  background-position: 0% var(--background-y),
    calc((var(--background-x)) * 0.4) calc(var(--background-y) * 0.5),
    center center;
  background-size: 200% 300%, 700% 700%, 100% 100%;
  mix-blend-mode: difference;
  filter: brightness(0.8) contrast(1.5);
}

.card__laser,
.avatar {
  will-change: transform, opacity, background-image, background-size,
    background-position, background-blend-mode, filter, box-shadow;
}

#card .avatar__content .avatar {
  grid-area: 1/-1;
  object-fit: cover;
  width: 28%;
  border-radius: 50%;
  aspect-ratio: 1;
  place-self: center;
  align-self: start;
  margin-top: 8%;
  border: 2px solid rgba(255, 255, 255, 0.5);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  transition: transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275), 
              box-shadow 0.5s ease, 
              border-color 0.5s ease;
  transform-origin: center center;
  transform: scale(1) translateZ(0.01px);
}

#card.active .avatar__content .avatar,
#card:hover .avatar__content .avatar {
  transform: scale(1.05) translateZ(10px);
  box-shadow: 0 12px 42px rgba(0, 0, 0, 0.3),
    0 0 0 2px rgba(255, 255, 255, 0.7);
  border-color: rgba(255, 255, 255, 0.8);
}

.card__content {
  position: absolute;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: white;
  width: 100%;
  height: 100%;
  z-index: 10;
  pointer-events: none;
}

#card .card__details {
  position: absolute;
  bottom: 15%;
  left: 0;
  width: 100%;
  text-align: center;
  padding: 0 10px 20px;
  transform: translateZ(1px);
  z-index: 20;
  transition: transform 0.4s ease-out;
}

#card:hover .card__details,
#card.active .card__details {
  transform: translateZ(5px);
}

.card__details h3 {
  font-weight: 600;
  letter-spacing: 1px;
  font-size: 36px;
  margin: 0;
  color: white;
  text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
  font-family: system-ui, sans-serif;
  opacity: 0.95;
  transition: opacity 0.3s ease, transform 0.3s ease, text-shadow 0.3s ease;
}

.card__details p {
  font-weight: 400;
  font-size: 16px;
  margin: 5px 0 0;
  color: rgba(255, 255, 255, 0.8);
  letter-spacing: 0.5px;
  font-family: system-ui, sans-serif;
  opacity: 0.9;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

#card:hover .card__details h3,
#card.active .card__details h3 {
  opacity: 1;
  text-shadow: 0 4px 12px rgba(0, 0, 0, 0.5), 0 0 2px rgba(255, 255, 255, 0.5);
  transform: translateY(-2px);
}

#card:hover .card__details p,
#card.active .card__details p {
  opacity: 1;
  transform: translateY(-1px);
}

@keyframes glow {
  0%, 100% { filter: brightness(0.75) saturate(1.5) hue-rotate(0deg); }
  33% { filter: brightness(0.7) saturate(1.4) hue-rotate(5deg); }
  66% { filter: brightness(0.85) saturate(1.6) hue-rotate(-5deg); }
}

@keyframes holo {
  0% {
    mask-position: -10% -10%;
  }
  100% {
    mask-position: 110% 110%;
  }
}

@media (max-width: 768px) {
  #card {
    height: 60vh;
    max-height: 450px;
  }
  
  .card__details h3 {
    font-size: 28px;
  }
  
  .card__details p {
    font-size: 14px;
  }
}

@media (max-width: 480px) {
  #card {
    height: 50vh;
    max-height: 350px;
  }
  
  .card__details h3 {
    font-size: 24px;
  }
  
  .card__details p {
    font-size: 12px;
  }
}
</style> 