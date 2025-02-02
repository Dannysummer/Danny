<template>
  <div class="welcome-card card">
    <div class="visitor-panel">
      <!-- 个人介绍部分 -->
      <div class="intro-section">
        <div class="intro-line">
          <Icon class="intro-title-icon" icon="mdi:account" />
          <span class="intro-title">欢迎来访者！</span>
        </div>
        <div class="intro-line">
          <Icon icon="mdi:hand-wave" />
          <span class="intro-text">我是Danny😊，一个<span class="highlight">热爱编程</span>的技术爱好者，喜欢分享经验。</span>
        </div>
        <div class="intro-line">
          <Icon icon="mdi:help-circle" />
          <span class="intro-text">有问题欢迎提问，确保内容有意义，详情请见<span class="link">提问的智慧</span>。</span>
        </div>
        <div class="intro-line">
          <Icon icon="mdi:email" />
          <span class="intro-text">欢迎通过<span class="link">邮箱📧</span>联系我！</span>
        </div>
      </div>
      <!-- 访客信息部分改造 -->
      <div class="visitor-info-section">
        <div class="visitor-info-header">
          <Icon icon="mdi:account-group" />
          <span>访客信息</span>
        </div>
        <div class="visitor-info-content">
          <div class="info-line">
            <Icon icon="mdi:emoticon-happy" />
            嗨嗨！热烈欢迎！来自
          </div>
          <div class="info-line highlight">
            <Icon icon="mdi:map-marker" />
            {{ visitorLocation.province }} {{ visitorLocation.city }} {{ visitorLocation.district }}
          </div>
          <div class="info-line">
            <Icon icon="mdi:account-heart" />
            的铁铁，你好呀！😊
          </div>
          <div class="info-line">
            <!-- <Icon icon="mdi:chili-hot" /> -->
            {{ localGreeting }}
          </div>
          <div class="info-line">
            <Icon icon="mdi:map-marker-distance" />
            <span>你目前距离博主 <span class="highlight">{{ calculateDistance(
              visitorLocation.latitude,
              visitorLocation.longitude,
              serverLocation.latitude,
              serverLocation.longitude
            ) }}</span> 公里！</span>
          </div>
          <div class="info-line">
            <Icon icon="mdi:ip-network" />
            <span style="text-align: left;">网络IP为：<span class="highlight">{{ visitorIP }}</span></span>
          </div>
          <div class="info-line">
            <Icon icon="mdi:weather-sunny" />
            {{ greeting }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { Icon } from '@iconify/vue'

const visitorIP = ref('')
const visitorLocation = ref({
  province: '',
  city: '',
  district: '',
  latitude: 0,
  longitude: 0
})

const serverLocation = {
  latitude: 30.2741, // 杭州纬度
  longitude: 120.1551, // 杭州经度
}

const greeting = ref('')
const localGreeting = ref('')

// 计算距离
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
  const R = 6371 // 地球半径，单位公里
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
  return Math.round(R * c)
}

// 根据时间生成问候语
const getTimeGreeting = () => {
  const hour = new Date().getHours()
  if (hour >= 5 && hour < 9) {
    return '早上好，快趁机多睡点觉！'
  } else if (hour >= 9 && hour < 12) {
    return '上午好，摸鱼时间到！'
  } else if (hour >= 12 && hour < 14) {
    return '中午好，该睡个午觉啦！'
  } else if (hour >= 14 && hour < 18) {
    return '下午好，来杯咖啡提提神！'
  } else if (hour >= 18 && hour < 22) {
    return '晚上好，要不要来点夜宵？'
  } else {
    return '夜深了，早点休息哦！'
  }
}

// 根据地区生成特色问候语
const getLocalGreeting = (province: string, city: string) => {
  const greetings: Record<string, string> = {
    // 中国各省市特色问候
    '四川省': '康康川妹子 🌶',
    '广东省': '食咗饭未呀 🥘',
    '陕西省': '来碗臊子面 🍜',
    '湖南省': '来点辣椒更开胃 🌶️',
    '江苏省': '要不要来碗阳春面 🍜',
    '浙江省': '来个小笼包先 🥟',
    '天津市': '来个煎饼果子 🥞',
    '山东省': '来个煎饼卷大葱 🥬',
    '河南省': '胡辣汤安排上 🍲',
    '云南省': '来碗过桥米线 🍜',
    '贵州省': '老干妈安排上 🌶',
    '广西省': '来个螺蛳粉伐 🍜',
    '福建省': '沙茶面了解一下 🍜',
    '新疆维吾尔自治区': '大盘鸡安排上 🍗',
    '内蒙古自治区': '来块手扒肉 🍖',
    '西藏自治区': '来碗甜茶暖暖 🫖',
    '海南省': '来个椰子冻 🥥',
    '安徽省': '来碗臭干饭 🍚',
    '江西省': '辣椒小炒肉安排 🌶',
    '湖北省': '来碗热干面 🍜',
    '河北省': '来个驴肉火烧 🥪',
    '山西省': '刀削面安排上 🍜',
    '辽宁省': '锅包肉安排上 🍖',
    '吉林省': '来碗酸菜白肉 🥘',
    '黑龙江省': '来碗大拉皮 🥗',
    '甘肃省': '来碗牛肉面 🍜',
    '青海省': '手抓羊肉安排 🍖',
    '宁夏回族自治区': '清真羊肉泡馍 🍜',
    '台湾省': '来碗卤肉饭 🍚',
    '香港特别行政区': 'Dim Sum 点心来一笼 🥟',
    '香港': 'Dim Sum 点心来一笼 🥟',
    '澳门特别行政区': '葡式蛋挞尝一个 🥮',
    
    // 国际化问候
    'United States': 'Welcome! 欢迎光临！🗽',
    'United Kingdom': 'Cheers mate! 欢迎您！☕',
    'Japan': 'いらっしゃいませ！欢迎光临！🗼',
    'Korea': '환영합니다！欢迎光临！🎌',
    'France': 'Bienvenue! 欢迎光临！🗼',
    'Germany': 'Willkommen! 欢迎光临！🍺',
    'Italy': 'Benvenuto! 欢迎光临！🍕',
    'Spain': '¡Bienvenido! 欢迎光临！💃',
    'Russia': 'Добро пожаловать! 欢迎光临！🏰',
    'Australia': "G'day mate! 欢迎光临！🦘",
    'Canada': 'Welcome eh! 欢迎光临！🍁',
    'Brazil': 'Bem-vindo! 欢迎光临！⚽',
    'India': 'नमस्ते! 欢迎光临！🕉',
    'Singapore': 'Welcome lah! 欢迎光临！🦁',
    'Malaysia': 'Selamat datang! 欢迎光临！🌺',
    'Thailand': 'ยินดีต้อนรับ! 欢迎光临！🏯',
    'Vietnam': 'Chào mừng! 欢迎光临！🍜',
    'Indonesia': 'Selamat datang! 欢迎光临！🌺',
    
    // 城市特色问候语
    '北京市': '来个炸酱面儿 🍜',
    '上海市': '来碗小馄饨伐 🥟',
    '成都市': '来盘兔头耍不 🐰',
    '重庆市': '来碗抄手耍不 🌶',
    '西安市': '来碗biangbiang面 🍜',
    '武汉市': '来碗热干面 🍜',
    '杭州市': '来碗片儿川 🍜',
    '南京市': '来碗鸭血粉丝 🍜',
    '苏州市': '来碗阳春面 🍜',
    '广州市': '来碗艇仔粥 🥣',
    '深圳市': '茶餐厅早茶啊 🫖',
    '厦门市': '来碗沙茶面 🍜',
    '青岛市': '来块大虾饺 🦐',
    '大连市': '来份焖子 🥘',
    '哈尔滨市': '来根红肠 🌭',
    '长沙市': '来碗臭豆腐 🍲',
    '昆明市': '来碗米线 🍜',
    '贵阳市': '来碗丝娃娃 🥬',
    '兰州市': '来碗牛肉面 🍜',
    '乌鲁木齐市': '来串羊肉串 🍖',
    '拉萨市': '来碗甜茶 🫖',
    '海口市': '来个椰子饭 🥥',
    '三亚市': '来个清补凉 🥤',
    '澳门': '来个蛋挞 🥮',
  }
  return greetings[province] || greetings[city] || 'Welcome! 欢迎来自远方的朋友 👋'
}

// 获取访客IP和地理位置
const getVisitorInfo = async () => {
  try {
    const response = await fetch('http://ip-api.com/json/?lang=zh-CN')
    const data = await response.json()
    visitorIP.value = data.query
    
    visitorLocation.value = {
      province: data.regionName || '未知',
      city: data.city || '未知',
      district: '',
      latitude: data.lat || 0,
      longitude: data.lon || 0
    }
    
    // 更新问候语
    greeting.value = getTimeGreeting()
    localGreeting.value = getLocalGreeting(
      visitorLocation.value.province,
      visitorLocation.value.city
    )
  } catch (error) {
    console.error('获取访客信息失败:', error)
    visitorIP.value = '无法获取'
    visitorLocation.value = {
      province: '未知',
      city: '未知',
      district: '未知',
      latitude: 0,
      longitude: 0
    }
    greeting.value = '欢迎访问！'
    localGreeting.value = 'Welcome! 欢迎来自远方的朋友 👋'
  }
}

onMounted(() => {
  getVisitorInfo()
})
</script>

<style scoped>
.welcome-card {
  background: rgba(30, 30, 30, 0.6) !important;
  backdrop-filter: blur(10px);
  color: #fff;
  padding: 1.2rem;
}

.visitor-panel {
  font-size: 0.875rem;
  line-height: 2;
}

/* 个人介绍部分 */
.intro-section {
  padding-bottom: 0.8rem;
  margin-bottom: 0.8rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  text-align: left;
}

.intro-line, .info-line {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 0.2rem 0;
  color: rgba(255, 255, 255, 0.9);
}

.intro-text {
  text-align: left !important;
}

.intro-title {
  text-align: left !important;
  font-size: 1.5rem;
}

.intro-title-icon {
  color: #3498db;
  font-size: 2.2rem !important;
  flex-shrink: 0;
  margin-top: 0.4rem !important;
}

.intro-line .iconify {
  color: #3498db;
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.4rem;
}

/* 访客信息部分 */
.visitor-info-section {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 1rem;
  backdrop-filter: blur(5px);
  text-align: center;
}

.visitor-info-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: #3498db;
  font-size: 1.1rem;
  justify-content: center;
}

.visitor-info-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.visitor-info-content .info-line {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px 8px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.visitor-info-content .info-line .iconify {
  margin-top: 2px;
}

.visitor-info-content .info-line > span {
  text-align: center;
}

.info-line:hover {
  background: rgba(255, 255, 255, 0.05);
}

.info-line .iconify {
  color: #3498db;
  font-size: 1.1rem;
  flex-shrink: 0;
  margin-top: 0.4rem;
}

/* 文本容器样式 */
.intro-line > span,
.info-line > span {
  flex: 1;
  line-height: 2;
  text-align: center;
}

.link {
  color: #3498db;
  cursor: pointer;
  display: inline;
  font-weight: inherit;
  font-size: inherit;
}

.link:hover {
  color: #2980b9;
  text-shadow: 0 0 10px rgba(52, 152, 219, 0.5);
}

.highlight {
  color: #3498db;
  font-weight: 500;
  text-shadow: 0 0 10px rgba(52, 152, 219, 0.3);
}

/* 卡片基础样式 */
.card {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}
</style> 