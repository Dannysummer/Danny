declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// 添加这些声明
declare module '../views/UserProfile.vue' {}
declare module '../views/Login.vue' {}
declare module '../components/AdminLayout.vue' {}
declare module '../views/Dashboard.vue' {}
declare module '../views/ArticleManagement.vue' {}
declare module '../views/ArticleEditor.vue' {}
declare module '../views/CommentManagement.vue' {}
declare module '../views/UserManagement.vue' {}
declare module '../views/CategoryManagement.vue' {}
declare module '../views/TagManagement.vue' {}
declare module '../views/Settings.vue' {} 