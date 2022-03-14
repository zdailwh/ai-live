import Vue from 'vue'
import Router from 'vue-router'

const originalPush = Router.prototype.push
Router.prototype.push = function push (location, onResolve, onReject) {
  if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject)
  return originalPush.call(this, location).catch(err => err)
}

Vue.use(Router)

export const constantRoutes = [
  {
    path: '/',
    redirect: '/taskbatch/task',
    hidden: true
  },
  {
    path: '/index',
    name: 'Index',
    component: () => import('@/views/index'),
    meta: { title: '首页', active: 'index' },
    hidden: true
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('@/views/login'),
    meta: { title: '登录', active: 'login' },
    hidden: true
  },
  {
    path: '/updatePwdFirst',
    name: 'UpdatePwdFirst',
    component: () => import('@/views/updatePwdFirst'),
    meta: { title: '修改密码', active: 'updatePwdFirst' },
    hidden: true
  },
  {
    path: '/404',
    name: '404',
    component: () => import('@/views/error-page/404'),
    meta: { title: '404' },
    hidden: true
  },
  {
    path: '/500',
    name: '500',
    component: () => import('@/views/error-page/500'),
    meta: { title: '500' },
    hidden: true
  },
  {
    path: '/test',
    name: 'Test',
    component: () => import('@/views/test'),
    meta: { title: '测试', active: 'test' },
    hidden: true
  }
  // {
  //   path: '/queue',
  //   name: 'Queue',
  //   component: () => import('@/views/queue/index'),
  //   meta: { title: '当前队列', active: 'queue', icon: 'flag' },
  //   redirect: '/queue/my',
  //   children: [
  //     {
  //       path: 'my',
  //       name: 'My',
  //       component: () => import('@/views/queue/my'),
  //       meta: { title: '我的', active: 'queue' }
  //     },
  //     {
  //       path: 'all',
  //       name: 'All',
  //       component: () => import('@/views/queue/all'),
  //       meta: { title: '全部', active: 'queue' }
  //     }
  //   ]
  // },
  // {
  //   path: '/taskbatch',
  //   name: 'TaskBatch',
  //   component: () => import('@/views/taskBatch/index'),
  //   meta: { title: '任务管理', active: 'taskbatch', icon: 'schedule' },
  //   redirect: '/taskbatch/task',
  //   children: [
  //     {
  //       path: 'task',
  //       name: 'Task',
  //       component: () => import('@/views/taskBatch/task'),
  //       meta: { title: '任务', active: 'taskbatch' }
  //     },
  //     {
  //       path: 'batch',
  //       name: 'Batch',
  //       component: () => import('@/views/taskBatch/batch'),
  //       meta: { title: '任务单', active: 'taskbatch' }
  //     }
  //   ]
  // },
  // {
  //   path: '/facegroup',
  //   name: 'FaceGroup',
  //   component: () => import('@/views/faceGroup/index'),
  //   meta: { title: '人像库', active: 'facegroup', icon: 'smile' },
  //   redirect: '/facegroup/face',
  //   children: [
  //     {
  //       path: 'face',
  //       name: 'Face',
  //       component: () => import('@/views/faceGroup/face'),
  //       meta: { title: '人像', active: 'facegroup' }
  //     },
  //     {
  //       path: 'group',
  //       name: 'Group',
  //       component: () => import('@/views/faceGroup/group'),
  //       meta: { title: '标签', active: 'facegroup' }
  //     }
  //   ]
  // },
  // {
  //   path: '/mode',
  //   name: 'Mode',
  //   component: () => import('@/views/mode/index'),
  //   meta: { title: '审核模板', active: 'mode', icon: 'book' },
  //   redirect: '/mode/list',
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'ModeList',
  //       component: () => import('@/views/mode/modelist'),
  //       meta: { title: '模板列表', active: 'mode' }
  //     }
  //   ]
  // },
  // {
  //   path: '/taskResult/:taskId',
  //   name: 'TaskResult',
  //   component: () => import('@/views/taskResult'),
  //   meta: { title: '查看任务结果', active: 'task' },
  //   hidden: true
  // },
  // {
  //   path: '/adminsetting',
  //   name: 'AdminSetting',
  //   component: () => import('@/views/adminSetting/index'),
  //   meta: { title: '用户管理', active: 'adminSetting', icon: 'user', roles: ['admin'] },
  //   redirect: '/adminsetting/admin/index',
  //   children: [
  //     {
  //       path: 'admin/index',
  //       component: () => import('@/views/adminSetting/admin/index'),
  //       name: 'AdminList',
  //       meta: { title: '用户列表', active: 'adminSetting' }
  //     },
  //     {
  //       path: 'role/index',
  //       component: () => import('@/views/adminSetting/role/index'),
  //       name: 'RoleList',
  //       meta: { title: '角色列表', active: 'adminSetting' }
  //     },
  //     {
  //       path: 'roleperm/index',
  //       component: () => import('@/views/adminSetting/roleperm/index'),
  //       name: 'RolePerm',
  //       meta: { title: '角色配置', active: 'adminSetting' }
  //     },
  //     {
  //       path: 'pwdSet/index',
  //       component: () => import('@/views/adminSetting/admin/pwdSet'),
  //       name: 'AdminPwdSet',
  //       meta: { title: '密码强度设置', active: 'adminSetting' },
  //       hidden: true
  //     },
  //     {
  //       path: 'permission/index',
  //       component: () => import('@/views/adminSetting/permission/index'),
  //       name: 'PermissionList',
  //       meta: { title: '权限配置', active: 'adminSetting' },
  //       hidden: true
  //     },
  //     {
  //       path: 'roleuser/index',
  //       component: () => import('@/views/adminSetting/roleuser/index'),
  //       name: 'RoleUser',
  //       meta: { title: '用户角色', active: 'adminSetting' },
  //       hidden: true
  //     }
  //   ]
  // },
  // {
  //   path: '/my',
  //   name: 'My',
  //   component: () => import('@/views/adminSetting/index'),
  //   redirect: '/my/admin/edit',
  //   meta: { title: '个人账号', active: 'my' },
  //   hidden: true,
  //   children: [
  //     {
  //       path: 'admin/edit',
  //       component: () => import('@/views/adminSetting/admin/edit'),
  //       name: 'MyEdit',
  //       meta: { title: '编辑个人信息', active: 'my' }
  //     },
  //     {
  //       path: 'admin/updatePwd',
  //       component: () => import('@/views/adminSetting/admin/updatePwd'),
  //       name: 'MyUpdatePwd',
  //       meta: { title: '修改密码', active: 'my' }
  //     }
  //   ]
  // },
  // {
  //   path: '/log',
  //   name: 'Log',
  //   component: () => import('@/views/log/index'),
  //   meta: { title: '日志查询', active: 'log', icon: 'solution' },
  //   redirect: '/log/list',
  //   children: [
  //     {
  //       path: 'list',
  //       name: 'LogList',
  //       component: () => import('@/views/log/loglist'),
  //       meta: { title: '日志查询', active: 'log' }
  //     }
  //   ]
  // },
  // {
  //   path: '/syssetting',
  //   name: 'SysSetting',
  //   component: () => import('@/views/sysSetting/index'),
  //   meta: { title: '系统设置', active: 'sysSetting', icon: 'control' },
  //   redirect: '/syssetting/sysinfo',
  //   children: [
  //     {
  //       path: 'sysinfo',
  //       name: 'SysInfo',
  //       component: () => import('@/views/sysSetting/sysinfo'),
  //       meta: { title: '设备信息', active: 'sysSetting' }
  //     },
  //     {
  //       path: 'sysrestart',
  //       name: 'SysRestart',
  //       component: () => import('@/views/sysSetting/sysrestart'),
  //       meta: { title: '设备重启', active: 'sysSetting' }
  //     },
  //     {
  //       path: 'network',
  //       name: 'Network',
  //       component: () => import('@/views/sysSetting/network'),
  //       meta: { title: '网络配置', active: 'sysSetting' }
  //     },
  //     {
  //       path: 'storage',
  //       name: 'Storage',
  //       component: () => import('@/views/sysSetting/storage'),
  //       meta: { title: '存储管理', active: 'sysSetting' }
  //     }
  //   ]
  // }
]

export const asyncRoutes = [
  {
    path: '/channel',
    name: 'Channel',
    component: () => import('@/views/channel/index'),
    meta: { title: '频道配置', active: 'channel', icon: 'icon-mqxiaoxiduilieMQ-copy' },
    redirect: '/channel/list',
    children: [
      {
        path: 'list',
        name: 'ChannelList',
        component: () => import('@/views/channel/list'),
        meta: { title: '频道列表', active: 'channel' }
      }
    ]
  },
  {
    path: '/jiankan/:id',
    name: 'Jiankan',
    component: () => import('@/views/channel/jiankan'),
    meta: { title: '实时监控', active: 'jiankan' },
    hidden: true
  },
  {
    path: '/jiankanAll',
    name: 'JiankanAll',
    component: () => import('@/views/channel/jiankanAll'),
    meta: { title: '实时监控', active: 'jiankanAll' },
    hidden: true
  },
  {
    path: '/taskbatch',
    name: 'TaskBatch',
    component: () => import('@/views/taskBatch/index'),
    meta: { title: '结果查看', active: 'taskbatch', icon: 'icon-renwuguanli-copy' },
    redirect: '/taskbatch/task',
    children: [
      {
        path: 'task',
        name: 'Task',
        component: () => import('@/views/taskBatch/task'),
        meta: { title: '结果列表', active: 'taskbatch' }
      }
    ]
  },
  {
    path: '/facegroup',
    name: 'FaceGroup',
    component: () => import('@/views/faceGroup/index'),
    meta: { title: '人像库', active: 'facegroup', icon: 'icon-renlianshibie' },
    redirect: '/facegroup/face',
    children: [
      {
        path: 'face',
        name: 'Face',
        component: () => import('@/views/faceGroup/face'),
        meta: { title: '人像', active: 'facegroup' }
      },
      {
        path: 'group',
        name: 'Group',
        component: () => import('@/views/faceGroup/group'),
        meta: { title: '标签', active: 'facegroup' }
      }
    ]
  },
  {
    path: '/taskResult/:taskId',
    name: 'TaskResult',
    component: () => import('@/views/taskResult'),
    meta: { title: '查看结果详情', active: 'taskbatch' },
    hidden: true
  },
  {
    path: '/adminsetting',
    name: 'AdminSetting',
    component: () => import('@/views/adminSetting/index'),
    meta: { title: '用户管理', active: 'adminSetting', icon: 'icon-yonghuguanli', roles: ['admin'] },
    redirect: '/adminsetting/admin/index',
    children: [
      {
        path: 'admin/index',
        component: () => import('@/views/adminSetting/admin/index'),
        name: 'AdminList',
        meta: { title: '用户列表', active: 'adminSetting' }
      },
      {
        path: 'role/index',
        component: () => import('@/views/adminSetting/role/index'),
        name: 'RoleList',
        meta: { title: '角色列表', active: 'adminSetting' }
      },
      {
        path: 'roleperm/index',
        component: () => import('@/views/adminSetting/roleperm/index'),
        name: 'RolePerm',
        meta: { title: '角色配置', active: 'adminSetting' },
        hidden: true
      },
      {
        path: 'pwdSet/index',
        component: () => import('@/views/adminSetting/admin/pwdSet'),
        name: 'AdminPwdSet',
        meta: { title: '密码强度设置', active: 'adminSetting' },
        hidden: true
      },
      {
        path: 'permission/index',
        component: () => import('@/views/adminSetting/permission/index'),
        name: 'PermissionList',
        meta: { title: '权限配置', active: 'adminSetting' },
        hidden: true
      },
      {
        path: 'roleuser/index',
        component: () => import('@/views/adminSetting/roleuser/index'),
        name: 'RoleUser',
        meta: { title: '用户角色', active: 'adminSetting' },
        hidden: true
      }
    ]
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('@/views/adminSetting/index'),
    redirect: '/user/admin/edit',
    meta: { title: '个人账号', active: 'User' },
    hidden: true,
    children: [
      {
        path: 'admin/edit',
        component: () => import('@/views/adminSetting/admin/edit'),
        name: 'MyEdit',
        meta: { title: '编辑个人信息', active: 'User' },
        hidden: true
      },
      {
        path: 'admin/updatePwd',
        component: () => import('@/views/adminSetting/admin/updatePwd'),
        name: 'MyUpdatePwd',
        meta: { title: '修改密码', active: 'User' },
        hidden: true
      }
    ]
  },
  {
    path: '/log',
    name: 'Log',
    component: () => import('@/views/log/index'),
    meta: { title: '日志查询', active: 'log', icon: 'icon-rizhi' },
    redirect: '/log/list',
    children: [
      {
        path: 'list',
        name: 'LogList',
        component: () => import('@/views/log/loglist'),
        meta: { title: '日志查询', active: 'log' }
      }
    ]
  },
  {
    path: '/syssetting',
    name: 'SysSetting',
    component: () => import('@/views/sysSetting/index'),
    meta: { title: '系统设置', active: 'sysSetting', icon: 'icon-xitong' },
    redirect: '/syssetting/sysinfo',
    children: [
      {
        path: 'sysinfo',
        name: 'SysInfo',
        component: () => import('@/views/sysSetting/sysinfo'),
        meta: { title: '设备信息', active: 'sysSetting' }
      },
      {
        path: 'sysrestart',
        name: 'SysRestart',
        component: () => import('@/views/sysSetting/sysrestart'),
        meta: { title: '设备重启', active: 'sysSetting' }
      },
      {
        path: 'network',
        name: 'Network',
        component: () => import('@/views/sysSetting/network'),
        meta: { title: '网络配置', active: 'sysSetting' }
      },
      {
        path: 'storage',
        name: 'Storage',
        component: () => import('@/views/sysSetting/storage'),
        meta: { title: '存储管理', active: 'sysSetting' }
      }
    ]
  },
  { path: '*', redirect: '/404', hidden: true }
]

const createRouter = () => new Router({
  // mode: 'history', // require service support
  scrollBehavior: () => ({ y: 0 }),
  routes: constantRoutes
})

const router = createRouter()

export function resetRouter () {
  const newRouter = createRouter()
  router.matcher = newRouter.matcher // reset router
}

export default router
