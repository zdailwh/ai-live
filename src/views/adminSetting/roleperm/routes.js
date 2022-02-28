export const routes = [
  {
    title: '当前队列',
    name: 'Queue',
    children: [
      {
        title: '我的',
        name: 'My',
        parent: 'Queue'
      },
      {
        title: '全部',
        name: 'All',
        parent: 'Queue'
      }
    ]
  },
  {
    title: '任务管理',
    name: 'TaskBatch',
    children: [
      {
        title: '任务',
        name: 'Task',
        parent: 'TaskBatch'
      },
      {
        title: '任务单',
        name: 'Batch',
        parent: 'TaskBatch'
      }
    ]
  },
  {
    title: '查看任务结果',
    name: 'TaskResult'
  },
  {
    title: '人像库',
    name: 'FaceGroup',
    children: [
      {
        title: '人像',
        name: 'Face',
        parent: 'FaceGroup'
      },
      {
        title: '分组',
        name: 'Group',
        parent: 'FaceGroup'
      }
    ]
  },
  {
    title: '审核模板',
    name: 'Mode',
    children: [
      {
        title: '模板列表',
        name: 'ModeList',
        parent: 'Mode'
      }
    ]
  },
  {
    title: '用户管理',
    name: 'AdminSetting',
    children: [
      {
        title: '用户列表',
        name: 'AdminList',
        parent: 'AdminSetting'
      },
      {
        title: '角色列表',
        name: 'RoleList',
        parent: 'AdminSetting'
      }
      // {
      //   title: '角色配置',
      //   name: 'RolePerm',
      //   parent: 'AdminSetting'
      // }
    ]
  },
  {
    title: '日志查询',
    name: 'Log',
    children: [
      {
        title: '日志查询',
        name: 'LogList',
        parent: 'Log'
      }
    ]
  },
  {
    title: '系统设置',
    name: 'SysSetting',
    children: [
      {
        title: '设备信息',
        name: 'SysInfo',
        parent: 'SysSetting'
      },
      {
        title: '设备重启',
        name: 'SysRestart',
        parent: 'SysSetting'
      },
      {
        title: '网络配置',
        name: 'Network',
        parent: 'SysSetting'
      },
      {
        title: '存储管理',
        name: 'Storage',
        parent: 'SysSetting'
      }
    ]
  }
]
