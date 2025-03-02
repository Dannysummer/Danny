import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleArchiving from '../views/ArticleArchiving.vue'
import Article from '../views/Article.vue'
import Message from '../views/Message.vue'
import Login from '../views/Login.vue'
import Friends from '../views/Friends.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/articles',
      name: 'ArticleArchiving',
      component: ArticleArchiving,
      meta: {
        title: '文章整理',
        group: 'memoir'
      }
    },
    {
      path: '/article/:id',
      name: 'article',
      component: Article,
      props: true,
      meta: {
        title: '文章详情'
      }
    },
    {
      path: '/message',
      name: 'message',
      component: Message
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: {
        title: '登录页',
        hideFooter: true,
        hideLoading: true
      }
    },
    {
      path: '/essays',
      name: 'Essays',
      component: () => import('../views/Memoir/Essays.vue'),
      meta: {
        title: '随笔 - 朝花夕拾',
        group: 'memoir'
      }
    },
    {
      path: '/gallery',
      name: 'Gallery',
      component: () => import('../views/Memoir/Gallery.vue'),
      meta: {
        title: '相册 - 朝花夕拾',
        group: 'memoir'
      }
    },
    {
      path: '/reading',
      name: 'Reading',
      component: () => import('../views/Memoir/Reading.vue'),
      meta: {
        title: '阅读 - 朝花夕拾',
        group: 'memoir'
      }
    },
    {
      path: '/test',
      name: 'test',
      component: () => import('../views/test.vue')
    },
    {
      path: '/about',
      name: 'About',
      component: () => import('../views/About.vue'),
      meta: {
        title: '知我',
        group: 'about'
      }
    },
    {
      path: '/hexotext',
      name: 'Hexotext',
      component: () => import('../views/Hexotext.vue')
    },
    {
      path: '/start',
      name: 'Start',
      component: () => import('../views/StartPage.vue'),
      meta: {
        title: '起始页',
        group: 'navigation',
        hideFooter: true,
        hideLoading: true,
        hideAvatar: true,
        hideParticles: true
      }
    },
    {
      path: '/friends',
      name: 'Friends',
      component: Friends,
      meta: {
        title: '友情链接'
      }
    },
    {
      path: '/profile',
      name: 'Profile',
      component: () => import('../views/Profile.vue'),
      meta: {
        requiresAuth: true
      }
    },
    // 其他路由...
  ]
})

export default router 