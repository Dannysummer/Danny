<template>
  <!-- 卡片容器，初始状态为激活状态 -->
  <div class="card-wrapper active" ref="wrap">
    <!-- 卡片，初始状态为激活状态 -->
    <section ref="card" id="card" class="active">
      <div class="card-border"></div>
      <!-- 内部容器 -->
      <div class="inside active">
        <div class="UserId">
          <span class="card-number">UID：{{ computedUseId }}</span>
        </div>
        <!-- 激光效果 -->
        <div class="card__laser active"></div>
        <!-- 头像内容 -->
        <div class="card__content avatar__content">
          <!-- 头像图片 -->
          <img class="avatar" :src="computedAvatarSrc" alt="" />
          <!-- 头像边框 -->
          <div class="avatar-border"></div>
        </div>
        <!-- 其他内容 -->
        <div class="card__content">
          <!-- 详细信息 -->
          <div class="card__details">
            <!-- <div class="uuid">UID : {{ useId }}</div> -->
            <!-- <div class="welcome">我尊贵的大人：</div> -->
            <!-- 标题 -->
            <div class="user-name">{{ computedUsername }}</div>
            <!-- 描述 -->
            <div class="welcome">您到来领地于</div>
            <div class="createtime">{{ computedCreateTime }}</div>
            <div class="welcome">您的排名为</div>
            <div class="rank">NO.{{ computedRank }}</div>
            <p>{{ description }}</p>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { useId, watch } from 'vue';
import { useUserStore } from '../stores/user';

export default {
  name: 'LaserCard',
  props: {
    username: {
      type: String,
      default: null
    },
    description: {
      type: String,
      default: 'SHARE CARD'
    },
    avatarSrc: {
      type: String,
      default: '/avatars/default-avatar.png'
    },
    createTime: {
      type: String,
      default: null
    },
    rank: {
      type: String,
      default: null
    },
    useId: {
      type: String,
      default: null
    },
  },
  data() {
    return {
      easer: null,
      userStore: null,
      computedUsername: '',
      computedAvatarSrc: '',
      computedCreateTime: '',
      computedRank: '',
      computedUseId: ''
    };
  },
  created() {
    // 创建时初始化userStore
    this.userStore = useUserStore();
    
    // 从props或userStore获取数据
    this.initUserData();
    
    // 监听userStore中排名的变化
    this.setupWatchers();
  },
  mounted() {
    // 获取DOM元素
    const $wrap = this.$refs.wrap;
    const $card = this.$refs.card;
    
    if (!$wrap || !$card) return;

    // 获取包裹元素的宽度和高度的一半
    const halfW = $wrap.clientWidth / 2 || 50;  // 提供默认值防止NaN
    const halfH = $wrap.clientHeight / 2 || 50; // 提供默认值防止NaN
    
    // 添加事件监听器
    $card.addEventListener('pointerenter', () => {
      // 当鼠标进入卡片时，取消之前的动画
      if (this.easer) {
        this.easer?.cancel?.();
      }
    });
    
    $card.addEventListener('pointermove', this.cardUpdate);
    
    $card.addEventListener('pointerout', (e) => {
      // 当鼠标离开卡片时，开始动画
      this.easer = this.easedFunc(
        1000,
        (p) => {
          // 计算鼠标离开时的位置
          let x = this.adjust(p, 0, 1, e.offsetX || halfW, halfW);
          let y = this.adjust(p, 0, 1, e.offsetY || halfH, halfH);
          this.cardUpdate({ offsetX: x, offsetY: y });
        },
        () => {
          // 动画结束后，移除active类（添加安全检查）
          if (this.$refs.card) {
            this.$refs.card.classList.remove('active');
          }
          if (this.$refs.wrap) {
            this.$refs.wrap.classList.remove('active');
          }
        }
      );
    });

    // 确保尺寸有效后再更新卡片的初始位置
    if ($wrap.clientWidth > 0 && $wrap.clientHeight > 0) {
      // 更新卡片的初始位置
      this.cardUpdate({ offsetX: halfW, offsetY: halfH });
      
      // 设置定时器，1秒后执行初始动画
      setTimeout(() => {
        // 定义缓动函数
        this.easer = this.easedFunc(
          3000,
          (p) => {
            // 根据缓动函数的参数p，计算卡片的位置
            let x = this.adjust(p, 0, 1, $wrap.clientWidth - 70, halfW);
            let y = this.adjust(p, 0, 1, 60, halfH);
            // 更新卡片的位置
            this.cardUpdate({ offsetX: x, offsetY: y });
          },
          () => {
            // 动画结束后，移除active类（添加安全检查）
            if (this.$refs.card) {
              this.$refs.card.classList.remove('active');
            }
            if (this.$refs.wrap) {
              this.$refs.wrap.classList.remove('active');
            }
          }
        );
      }, 1000);
    } else {
      // 如果尺寸无效，使用nextTick等待DOM更新后再尝试
      this.$nextTick(() => {
        const updatedHalfW = this.$refs.wrap?.clientWidth / 2 || 50;
        const updatedHalfH = this.$refs.wrap?.clientHeight / 2 || 50;
        this.cardUpdate({ offsetX: updatedHalfW, offsetY: updatedHalfH });
      });
    }
  },
  methods: {
    // 初始化用户数据
    initUserData() {
      const userInfo = this.userStore?.userInfo;
      
      // 使用props值或从userStore获取值
      this.computedUsername = this.username || userInfo?.username || 'Dansela';
      this.computedAvatarSrc = userInfo?.avatar || userInfo?.avatar || '/avatars/default-avatar.png';
      this.computedUseId = this.useId || userInfo?.id?.toString() || '111111111111';
      
      // 格式化创建时间
      if (this.createTime) {
        this.computedCreateTime = this.createTime;
      } else if (userInfo?.registrationTime || userInfo?.createTime) {
        const timestamp = userInfo.registrationTime || userInfo.createTime;
        const date = new Date(timestamp);
        this.computedCreateTime = `${date.getFullYear()}/${String(date.getMonth() + 1).padStart(2, '0')}/${String(date.getDate()).padStart(2, '0')}`;
      } else {
        this.computedCreateTime = '2025/01/01';
      }
      
      // 获取排名信息
      if (this.rank) {
        this.computedRank = this.rank;
      } else if (userInfo?.userRank && userInfo.userRank !== '0') {
        this.computedRank = userInfo.userRank;
      } else if (this.userStore && this.userStore.userRank && this.userStore.userRank !== '0') {
        this.computedRank = this.userStore.userRank;
      } else {
        this.computedRank = '1';
      }

      console.log('LaserCard初始化用户数据:', {
        username: this.computedUsername,
        avatarSrc: this.computedAvatarSrc,
        useId: this.computedUseId,
        createTime: this.computedCreateTime,
        rank: this.computedRank
      });
    },
    
    // 设置监听器
    setupWatchers() {
      // 使用Vue 3的watch API监听userStore中的userRank变化
      if (this.userStore) {
        // 监听userStore中的userRank变化
        watch(() => this.userStore.userRank, (newRank) => {
          if (newRank && newRank !== '0') {
            console.log('检测到排名更新:', newRank);
            this.computedRank = newRank;
          }
        });
        
        // 监听userStore中的userInfo变化
        watch(() => this.userStore.userInfo, (newUserInfo) => {
          if (newUserInfo) {
            if (newUserInfo.username && !this.username) {
              this.computedUsername = newUserInfo.username;
            }
            if (newUserInfo.avatar && !this.avatarSrc) {
              this.computedAvatarSrc = newUserInfo.avatar;
            }
            if (newUserInfo.id && !this.useId) {
              this.computedUseId = newUserInfo.id.toString();
            }
            if (newUserInfo.userRank && newUserInfo.userRank !== '0' && !this.rank) {
              this.computedRank = newUserInfo.userRank;
            }
          }
        }, { deep: true });
      }
    },
    // 更新卡片的位置和样式
    cardUpdate(e) {
      const $wrap = this.$refs.wrap;
      const $card = this.$refs.card;
      
      if (!$wrap || !$card) return;
      
      // 获取鼠标或触摸点的位置
      var pos = [e.offsetX || 0, e.offsetY || 0];
      // 如果是触摸事件，则阻止默认行为
      if (e.pointerType === 'touch') {
        e.preventDefault;
      }
      // 获取卡片的位置和尺寸
      var dimensions = $card.getBoundingClientRect();
      var l = pos[0];
      var t = pos[1];
      var h = dimensions.height || 1; // 防止除以零
      var w = dimensions.width || 1;   // 防止除以零
      
      // 防止无效值计算
      if (w <= 0 || h <= 0 || !isFinite(l) || !isFinite(t)) {
        return;
      }
      
      // 计算鼠标或触摸点在卡片中的位置百分比
      var px = this.clamp(Math.abs((100 / w) * l), 0, 100);
      var py = this.clamp(Math.abs((100 / h) * t), 0, 100);
      // 计算鼠标或触摸点相对于卡片中心的位置百分比
      var cx = px - 50;
      var cy = py - 50;
      
      // 确保所有值都是有效数字
      if (isNaN(px) || isNaN(py) || isNaN(cx) || isNaN(cy)) {
        px = 50;
        py = 50;
        cx = 0;
        cy = 0;
      }

      // 使用style.setProperty设置CSS变量而不是setAttribute
      $wrap.style.setProperty('--pointer-x', `${px}%`);
      $wrap.style.setProperty('--pointer-y', `${py}%`);
      $wrap.style.setProperty('--background-x', `${this.adjust(px, 0, 100, 35, 65)}%`);
      $wrap.style.setProperty('--background-y', `${this.adjust(py, 0, 100, 35, 65)}%`);
      $wrap.style.setProperty('--pointer-from-center', 
        `${this.clamp(Math.sqrt((py - 50) * (py - 50) + (px - 50) * (px - 50)) / 50, 0, 1)}`);
      $wrap.style.setProperty('--pointer-from-top', `${py / 100}`);
      $wrap.style.setProperty('--pointer-from-left', `${px / 100}`);
      $wrap.style.setProperty('--rotate-x', `${this.round(-(cx / 5))}deg`);
      $wrap.style.setProperty('--rotate-y', `${this.round(cy / 4)}deg`);
    },
    // 缓动函数
    ease(x) {
      return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    },
    // 创建一个带有缓动效果的函数
    easedFunc(durationMs, onProgress, onComplete, onCancel) {
      // 获取当前时间
      let startTime = performance.now();
      // 定义一个变量，用于标记是否取消
      let canceled = false;

      // 定义一个循环函数
      const loop = () => {
        // 如果已经取消，则返回
        if (canceled) return;
        // 获取当前时间
        const currentTime = performance.now();
        // 计算进度
        const progress = (currentTime - startTime) / durationMs;
        // 计算缓动进度
        const easedProgress = this.ease(progress);
        // 调用进度回调函数
        onProgress(easedProgress);
        // 如果进度小于1，则继续循环
        if (progress < 1) {
          requestAnimationFrame(loop);
        } else {
          // 如果进度等于1，则调用完成回调函数
          if (onComplete) onComplete();
        }
      };

      // 调用循环函数
      loop();

      // 返回一个对象，包含取消函数
      return {
        cancel: () => {
          // 设置取消标记为true
          canceled = true;
        },
      };
    },
    // 将一个数值四舍五入到指定的小数位数
    round(value, precision = 3) {
      return parseFloat(value.toFixed(precision));
    },
    // 将一个值限制在指定的最小值和最大值之间
    clamp(value, min = 0, max = 100) {
      return Math.min(Math.max(value, min), max);
    },
    // 将一个值从一个范围映射到另一个范围
    adjust(value, fromMin, fromMax, toMin, toMax) {
      // 确保输入值是有效数字
      if (isNaN(value) || !isFinite(value)) {
        return toMin;
      }
      return this.round(
        toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin)
      );
    }
  },
  beforeDestroy() {
    // 清理事件监听器
    if (this.$refs.card) {
      this.$refs.card.removeEventListener('pointerenter', this.onPointerEnter);
      this.$refs.card.removeEventListener('pointermove', this.cardUpdate);
      this.$refs.card.removeEventListener('pointerout', this.onPointerOut);
    }
    // 取消动画
    if (this.easer) {
      this.easer.cancel();
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
  /* --metafy: url(/public/laserCard/circle_repeat.png); */
  /* --metafy: url(/public/laserCard/无缝拼贴纹理4改1.png); */
  /* --metafy: url(/public/laserCard/无缝拼贴纹理3改.png); */
  --metafy: url(/public/laserCard/Dansela.png);
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
  scrollbar-width: none; /* 针对 Firefox */
  -ms-overflow-style: none; /* 针对 IE 和 Edge */
}

.card-wrapper {
  font-family: var(--font-chinese-decorative);
  position: relative;
  perspective: 500px;
  transform: translate3d(0, 0, 0.1px);
  cursor: pointer;
}

.card-wrapper:hover,
.card-wrapper.active {
  --card-opacity: 1;
}

.card-wrapper.active::before {
  filter: contrast(1) saturate(2) blur(40px) opacity(1);
  transform: scale(0.9) translate3d(0, 0, 0.1px);
}

#card {
  height: 80svh;
  max-height: 640px;
  display: grid;
  aspect-ratio: 0.618;
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

  overflow: hidden;
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
  /* border: 20px solid linear-gradient(to bottom, #60496e8c 0%, #71c4ff44 100%); */
  background-image: linear-gradient(145deg, #60496e8c 0%, #71c4ff44 100%);
  background-color: rgb(0 0 0 / 90%);
  transform: translate3d(0px, 0px, 0.01px);
}

.card__laser {
  mask-image: var(--metafy);
  mask-mode: luminance;
  mask-repeat: repeat;
  mask-size: 150%;
  mask-position: top calc(200% - (var(--background-y) * 5)) left
    calc((100% - var(--background-x)));
  transition: filter 0.6s ease;
  /*镭射光 亮度 对比度 饱和度 透明度 */
  filter: brightness(1.0) contrast(1.5) saturate(0.5) opacity(0.7);
  animation: holo 18s linear infinite;
  mix-blend-mode: color-dodge;
}

.card__laser,
.card__laser::after {
  --space: 5%;
  --angle: -45deg;
  display: grid;
  transform: translate3d(0, 0, 1px);
  overflow: hidden;
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

#card .avatar__content {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

#card .avatar__content .avatar {
  position: absolute;
  border-radius: 50%;
  object-fit: cover;
  width: 170px;
  height: 170px;
  max-width: 80%;
  /* margin-top: -20%; */
  /* margin: 0% auto ; */
  top: 14.2%;
  opacity: calc((1.5 - var(--pointer-from-center)));
  box-shadow: rgba(0, 0, 0, 0.6) calc((var(--pointer-from-left) * 6px) - 2px)
    calc((var(--pointer-from-top) * 14px) - 4px) 20px -3px;
  z-index: 2;
}

.avatar-border {
  position: absolute;
  width: 300px;
  height: 300px;
  top: 27.5%;
  left: 50%;
  transform: translate(-50%, -50%) translate3d(
    calc(var(--pointer-from-left) * -3px + 1.5px),
    calc(var(--pointer-from-top) * -3px + 1.5px),
    0.05px
  ) !important;
  background-image: url('/laserCard/avatar-border.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  z-index: 1;
  pointer-events: none;
  border-radius: 50%;
}

.card-border {
  position: absolute;
  width: 100%;
  height: 99.5%;
  margin: 0.2%;
  /* top: 30%; */
  /* left: 50%; */
  /* transform: translate(-50%, -50%) translate3d(
    calc(var(--pointer-from-left) * -3px + 1.5px),
    calc(var(--pointer-from-top) * -3px + 1.5px),
    0.05px
  ) !important; */
  background-image: url('/laserCard/酸性边框.svg');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  z-index: 1;
  pointer-events: none;
  border-radius: 50%;
}

.card__content {
  padding: 1em;
  grid-template-rows: 2fr 1fr;
  max-height: 100%;
  overflow: hidden;
  text-align: center;
  pointer-events: none;
  position: relative;
  transform: translate3d(
    calc(var(--pointer-from-left) * -6px + 3px),
    calc(var(--pointer-from-top) * -6px + 3px),
    0.1px
  ) !important;
  z-index: 5;
}

#card .card__details {
  z-index: 4;
  grid-row: 6/7;
  justify-content: space-evenly;
  display: flex;
  margin: auto;
  padding: 20px;
  width: 80%;
  gap: 0.0em;
  flex-direction: column;
  margin-top: 0.4em;
  border-radius: 15px;
  /* background-color: rgba(0, 0, 0, 0.15); */
  /* backdrop-filter: blur(3px); */
  /* border: 1px solid rgba(44, 243, 253, 0.15); */
  /* box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2); */
}

.card__details h3 {
  /* font-weight: 900; */
  font-family: 'alibaba';
  font-size: min(4svh, 1.5em);
  margin: 0;
  background-image: linear-gradient(0deg, #f092ff, #04f2ff);
  background-size: 1em 1.5em;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  mix-blend-mode: plus-lighter;
}

.uuid {
  font-family: 'alibaba';
  font-size: min(3svh, 0.9em);
  color: #8a8a8a;
  text-align: right;
  margin-bottom: 5px;
  opacity: 0.7;
}

.welcome {
  font-family: 'alibaba';
  font-size: min(3svh, 1.0em);
  background-image: linear-gradient(0deg, #ffffff, #2CF3FD);
  background-size: 1em 1.5em;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 2px 0;
  text-align: center;
}

.createtime {
  font-family: var(--font-chinese-decorative);
  font-size: min(4svh, 1.7em);
  background-image: linear-gradient(0deg, #E854FE, #2CF3FD);
  background-size: 1em 1.5em;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  mix-blend-mode: plus-lighter;
  margin: 8px 0;
  text-align: center;
  text-shadow: 0 0 15px rgba(232, 84, 254, 0.5);
  position: relative;
  letter-spacing: 1px;
}

.createtime::after {
  content: '';
  position: absolute;
  width: 80%;
  height: 2px;
  bottom: 5px;
  left: 10%;
  background: linear-gradient(90deg, transparent, #2CF3FD, transparent);
}

.user-name {
  font-family: 'alibaba';
  font-size: min(4svh, 2.8em);
  background-image: linear-gradient(0deg, #E854FE, #2CF3FD);
  background-size: 1em 1.5em;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  mix-blend-mode: plus-lighter;
  margin: 8px 0;
  text-align: center;
  font-weight: bold;
  letter-spacing: 2px;
  text-shadow: 0 0 20px rgba(44, 243, 253, 0.6);
  animation: glow-pulse 3s infinite alternate;
}

/* .user-name::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  padding: 1px;
  background: rgba(0, 0, 0, 0.8);
  mask:     
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.7;
  z-index: -1;
} */

.rank {
  display: inline-block !important;
  font-size: min(4svh, 2.3em);
  background-image: linear-gradient(0deg, #E854FE, #2CF3FD);
  -webkit-text-fill-color: transparent;
  background-clip: text;
  mix-blend-mode: plus-lighter;
  margin: 8px auto;
  padding: 5px 15px;
  border-radius: 12px;
  box-shadow: 0 0 15px rgba(232, 84, 254, 0.4);
  position: relative;
  /* border: 1px solid rgba(44, 243, 253, 0.2); */
  text-shadow: 0 0 15px rgba(44, 243, 253, 0.5);
  letter-spacing: 2px;
}

.rank::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: 13px;
  padding: 1px;
  background: linear-gradient(45deg, #E854FE, #2CF3FD);
  mask:     
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask: 
    linear-gradient(#fff 0 0) content-box, 
    linear-gradient(#fff 0 0);
  -webkit-mask-composite: xor;
  mask-composite: exclude;
  opacity: 0.7;
  z-index: -1;
}

@keyframes glow-pulse {
  0% {
    text-shadow: 0 0 15px rgba(44, 243, 253, 0.4);
  }
  100% {
    text-shadow: 0 0 25px rgba(232, 84, 254, 0.7);
  }
}

.card__details p {
  color: white;
  text-shadow: 0 -1px 1px black;
  background: linear-gradient(
    to bottom,
    #71bde9 calc(-100% + var(--pointer-y)),
    #0c3349 30%,
    #2f0633 70%,
    #e24ff0 calc(100% + var(--pointer-y))
  );
  text-transform: uppercase;
  font-size: 14px;
  margin-inline: auto;
  margin-block: 0;
  margin-top: 15px;
  padding: 0.5em 1.5em;
  border-radius: 0.8em !important;
  box-shadow: 0 0 0 1px #14181d,
    rgba(0, 0, 0, 0.6) calc((var(--pointer-from-left) * 6px) - 2px)
    calc((var(--pointer-from-top) * 14px) - 4px) 15px -5px;
}

@keyframes glow {
  0% {
    --bgrotate: 0deg;
  }
  100% {
    --bgrotate: 360deg;
  }
}

@keyframes holo {
  0% {
    background-position: 0% var(--background-y), 0% 0%, center center;
  }
  100% {
    background-position: 0% var(--background-y), 90% 90%, center center;
  }
}

.UserId {
  position: absolute;
  top: 3%;
  left: 10%;
  z-index: 5;
  font-family: var(--font-chinese-decorative);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85em;
  text-transform: uppercase;
}

.card-number {
  font-family: 'alibaba';
  z-index: 5;
  background: linear-gradient(45deg, #2CF3FD, #f092ff);
  -webkit-background-clip: text;
  background-clip: text;
  -webkit-text-fill-color: transparent;
  font-weight: bold;
  font-size: 1.4em;
  text-shadow: 0 0 10px rgba(44, 243, 253, 0.3);
  letter-spacing: 1px;
  display: inline-block;
  padding: 5px 10px;
  border-radius: 8px;
  /* backdrop-filter: blur(2px); */
  background-color: rgba(0, 0, 0, 0.2);
  /* border: 1px solid rgba(44, 243, 253, 0.3); */
}
</style> 