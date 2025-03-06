import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import ArticleArchiving from '../views/ArticleArchiving.vue'
import Article from '../views/Article.vue'
import Message from '../views/Message.vue'
import Login from '../views/Login.vue'
import Friends from '../views/Friends.vue'
import AdminLayout from '../admin/layouts/AdminLayout.vue'

// 前台路由
const frontendRoutes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/Home.vue'),
    meta: {
      title: '首页'
    }
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
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      title: '登录页',
      hideFooter: true,
      hideLoading: true
    }
  }
]

// 后台路由
const adminRoutes = [
  {
    path: '/admin',
    component: AdminLayout,
    redirect: '/admin/dashboard',
    children: [
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: () => import('../admin/views/Dashboard.vue'),
        meta: {
          title: '仪表盘'
        }
      },
      {
        path: 'articles',
        name: 'admin-articles',
        component: () => import('../admin/views/ArticleManagement.vue'),
        meta: {
          title: '文章管理'
        }
      },
      {
        path: 'users',
        name: 'admin-users',
        component: () => import('../admin/views/Dashboard.vue'),
        meta: {
          title: '用户管理'
        }
      },
      {
        path: 'settings',
        name: 'admin-settings',
        component: () => import('../admin/views/Dashboard.vue'),
        meta: {
          title: '系统设置'
        }
      },
      {
        path: 'social',
        name: 'AdminSocial',
        component: () => import('../admin/views/Social.vue'),
        meta: {
          requiresAuth: true,
          title: '社交管理'
        }
      }
    ],
    meta: {
      requiresAuth: true,
      isAdmin: true
    }
  }
]

// 404路由
const notFoundRoute = {
  path: '/:catchAll(.*)',
  name: 'NotFound',
  component: () => import('../views/NotFound.vue'),
  meta: {
    title: '页面未找到'
  }
}

// 合并所有路由
const routes = [
  ...frontendRoutes,
  ...adminRoutes,
  notFoundRoute
]

// 创建路由器，使用统一的路由配置
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: routes
})

// 全局前置守卫，处理需要登录和管理员权限的路由
router.beforeEach((to, from, next) => {
  // 此处简化处理，实际项目中需要通过后端验证权限
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
  const isAdmin = localStorage.getItem('isAdmin') === 'true';

  // 添加标题设置
  if (to.meta.title) {
    document.title = `${to.meta.title} - 春风不语博客`;
  } else {
    document.title = '春风不语博客';
  }

  if (to.matched.some(record => record.meta.requiresAuth) && !isLoggedIn) {
    // 需要登录但未登录，重定向到登录页
    next({ 
      path: '/login', 
      query: { redirect: to.fullPath } 
    });
  } else if (to.matched.some(record => record.meta.isAdmin) && !isAdmin) {
    // 需要管理员权限但不是管理员，重定向到首页
    next({ path: '/' });
  } else {
    // 其他情况正常放行
    next();
  }
});

export default router 