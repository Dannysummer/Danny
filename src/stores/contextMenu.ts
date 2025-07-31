/**
 * 全站右键菜单
 * 
 * 使用指南:
 * 1. 在App.vue中已经全局注册和初始化了右键菜单
 * 2. 如需在特定页面中使用特定菜单项，请确保路由名称在App.vue中的contextMap中有对应映射
 * 3. 添加页面特定菜单项:
 *    contextMenuStore.registerPageMenuItems('pageContextName', [
 *      {
 *        id: 'unique-id',
 *        label: '菜单项文本',
 *        icon: 'iconify图标名称',
 *        action: () => { 执行的动作 },
 *        shortcut: '快捷键提示(可选)',
 *        divider: true/false // 是否在此项下方显示分隔线
 *      }
 *    ])
 * 4. 更新已存在的菜单项:
 *    contextMenuStore.updatePageMenuItem('pageContextName', 'menu-item-id', {
 *      label: '新的菜单项文本',
 *      disabled: true/false,
 *      hidden: true/false
 *    })
 * 5. 主题自动跟随全局主题切换，无需额外配置
 */

import { defineStore } from 'pinia'
import { useThemeStore } from './theme'
import { useRouter } from 'vue-router'
import { watch } from 'vue'

// 菜单项接口
export interface MenuItem {
  id: string;
  label: string;
  icon?: string;
  shortcut?: string;
  action?: () => void;
  disabled?: boolean;
  hidden?: boolean;
  divider?: boolean;
}

// 菜单位置接口
export interface Position {
  x: number;
  y: number;
}

interface ContextMenuState {
  visible: boolean;
  position: Position;
  currentMenuItems: MenuItem[];
  currentContext: string;
  pageMenuItems: Record<string, MenuItem[]>;
  globalMenuItems: MenuItem[];
}

export const useContextMenuStore = defineStore('contextMenu', {
  state: (): ContextMenuState => ({
    visible: false,
    position: { x: 0, y: 0 },
    currentMenuItems: [],
    currentContext: '',
    pageMenuItems: {
      // 默认菜单项
      startPage: [
        {
          id: 'settings',
          label: '设置',
          icon: 'mdi:cog',
          action: undefined,
          divider: true
        },
        {
          id: 'wallpaper',
          label: '更换壁纸',
          icon: 'mdi:image',
          action: undefined
        }
      ],
      blogHome: [
        {
          id: 'view-categories',
          label: '查看分类',
          icon: 'mdi:tag-multiple',
          action: undefined,
          divider: true
        },
        {
          id: 'search-blog',
          label: '搜索文章',
          icon: 'mdi:magnify',
          action: undefined
        }
      ]
    },
    globalMenuItems: []
  }),

  actions: {
    showMenu(x: number, y: number, context: string) {
      this.position = { x, y }
      this.currentContext = context
      this.updateMenuItems()
      this.visible = true
    },

    hideMenu() {
      this.visible = false
    },

    // 更新当前菜单项
    updateMenuItems() {
      const router = useRouter()
      const themeStore = useThemeStore()
      
      // 添加全局菜单项
      this.globalMenuItems = [
        {
          id: 'toggle-theme',
          label: themeStore.isDarkTheme ? '切换到亮色模式' : '切换到暗色模式',
          icon: themeStore.isDarkTheme ? 'mdi:weather-sunny' : 'mdi:weather-night',
          action: () => themeStore.toggleTheme(),
          divider: true
        },
        {
          id: 'share',
          label: '分享',
          icon: 'mdi:share',
          action: () => {
            if (navigator.share) {
              navigator.share({
                title: document.title,
                url: window.location.href
              })
            } else {
              navigator.clipboard.writeText(window.location.href)
              // TODO: 添加提示
            }
          }
        },
        {
          id: 'refresh',
          label: '刷新页面',
          icon: 'mdi:refresh',
          shortcut: 'F5',
          action: () => window.location.reload(),
          divider: true
        },
        {
          id: 'go-home',
          label: '回到首页',
          icon: 'mdi:home',
          action: () => router.push('/'),
          divider: true
        },
        {
          id: 'copy',
          label: '复制',
          icon: 'mdi:content-copy',
          shortcut: 'Ctrl+C',
          action: () => document.execCommand('copy'),
          disabled: !window.getSelection()?.toString()
        }
      ]

      // 合并全局菜单项和页面特定菜单项
      if (this.currentContext && this.pageMenuItems[this.currentContext]) {
        this.currentMenuItems = [
          ...this.pageMenuItems[this.currentContext],
          ...this.globalMenuItems
        ]
      } else {
        this.currentMenuItems = [...this.globalMenuItems]
      }
    },

    // 初始化主题监听
    initThemeWatcher() {
      const themeStore = useThemeStore()
      
      // 监听主题变化，更新菜单项
      watch(() => themeStore.isDarkTheme, () => {
        if (this.visible) {
          this.updateMenuItems()
        }
      })
    },

    // 注册页面特定的菜单项
    registerPageMenuItems(context: string, items: MenuItem[]) {
      this.pageMenuItems[context] = items
    },

    // 更新页面特定的菜单项
    updatePageMenuItem(context: string, itemId: string, updates: Partial<MenuItem>) {
      if (!this.pageMenuItems[context]) return
      
      const itemIndex = this.pageMenuItems[context].findIndex(item => item.id === itemId)
      if (itemIndex !== -1) {
        this.pageMenuItems[context][itemIndex] = {
          ...this.pageMenuItems[context][itemIndex],
          ...updates
        }
      }
    }
  }
}) 