import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

/* Layout */
import Layout from '@/layout'

/**
 * Note: sub-menu only appear when route children.length >= 1
 * Detail see: https://panjiachen.github.io/vue-element-admin-site/guide/essentials/router-and-nav.html
 *
 * hidden: true                   if set true, item will not show in the sidebar(default is false)
 * alwaysShow: true               if set true, will always show the root menu
 *                                if not set alwaysShow, when item has more than one children route,
 *                                it will becomes nested mode, otherwise not show the root menu
 * redirect: noRedirect           if set noRedirect will no redirect in the breadcrumb
 * name:'router-name'             the name is used by <keep-alive> (must set!!!)
 * meta : {
    roles: ['admin','editor']    control the page roles (you can set multiple roles)
    title: 'title'               the name show in sidebar and breadcrumb (recommend set)
    icon: 'svg-name'/'el-icon-x' the icon show in the sidebar
    breadcrumb: false            if set false, the item will hidden in breadcrumb(default is true)
    activeMenu: '/example/list'  if set path, the sidebar will highlight the path you set
  }
 */

/**
 * constantRoutes
 * a base page that does not have permission requirements
 * all roles can be accessed
 */
export const constantRoutes = [
  {
    path: '/login',
    component: () => import('@/views/login/index'),
    hidden: true
  },

  {
    path: '/404',
    component: () => import('@/views/404'),
    hidden: true
  },

  {
    path: '/',
    component: Layout,
    redirect: '/dashboard',
    children: [{
      path: 'dashboard',
      name: 'Dashboard',
      component: () => import('@/views/dashboard/index'),
      meta: { title: '首页', icon: 'dashboard', affix: true }
    }]
  },

  {
    path: '/data',
    component: Layout,
    redirect: '/data/community/summary',
    name: 'Data',
    meta: { title: '集成数据', icon: 'el-icon-s-help' },
    children: [
      {
        path: 'heat-exchange',
        name: 'Power-exchange',
        component: () => import('@/views/heat-exchange/index'),
        meta: { title: '换热站', icon: 'heat-exchange' }
      },
      {
        path: 'trade',
        name: 'Trade',
        component: () => import('@/views/trade/index'),
        meta: { title: '贸易系统', icon: 'table' }
      },
      {
        path: 'community',
        name: 'Community',
        redirect: '/data/community/summary',
        component: () => import('@/views/community/index'),
        meta: { title: '小区', icon: 'community' },
        children: [
          {
            path: 'summary',
            name: 'Summary',
            component: () => import('@/views/community/list/index'),
            meta: { title: '小区概览', icon: 'table' }
          },
          {
            path: 'info',
            name: 'Info',
            component: () => import('@/views/community/info/index'),
            meta: { title: '小区详情', icon: 'table' }
          }
        ]
      },
      {
        path: '/user',
        name: 'User',
        redirect: '/data/user/summary',
        component: () => import('@/views/user/index'),
        meta: { title: '用户', icon: 'user' },
        children: [
          {
            path: 'summary',
            name: 'Summary',
            component: () => import('@/views/user/list/index'),
            meta: { title: '用户概览', icon: 'table' }
          },
          {
            path: 'info',
            name: 'Info',
            component: () => import('@/views/user/info/index'),
            meta: { title: '用户详情', icon: 'table' }
          }
        ]
      }
    ]
  },

  {
    path: '/analyze',
    component: Layout,
    redirect: '/data/analyze/abnormal',
    name: 'Analyze',
    meta: { title: '数据分析', icon: 'chart' },
    children: [
      {
        path: 'abnormal',
        name: 'Abnormal',
        component: () => import('@/views/abnormal/index'),
        meta: { title: '故障统计', icon: 'table' }
      },
      {
        path: 'leakage',
        name: 'Leakage',
        component: () => import('@/views/leakage/index'),
        meta: { title: '漏损分析', icon: 'table' }
      },
      {
        path: 'publish',
        name: 'Publish',
        component: () => import('@/views/publish/index'),
        meta: { title: '数据发布', icon: 'table' }
      }
    ]
  },

  {
    path: '/settings',
    component: Layout,
    redirect: '/settings/rights',
    name: 'Settings',
    meta: { title: '系统设置', icon: 'nested' },
    children: [
      {
        path: 'rights',
        component: () => import('@/views/rights/index'),
        name: 'Rights',
        meta: { title: '权限管理' }
      }
    ]
  },

  // 404 page must be placed at the end !!!
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

// Detail see: https://github.com/vuejs/vue-router/issues/1234#issuecomment-357941465
export function resetRouter() {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
