export const routes = [
  {
    title: '频道配置',
    name: 'Channel',
    children: [
      {
        title: '频道列表',
        name: 'ChannelList',
        parent: 'Channel'
      }
    ]
  },
  {
    title: '结果查看',
    name: 'TaskBatch',
    children: [
      {
        title: '结果列表',
        name: 'Task',
        parent: 'TaskBatch'
      }
    ]
  },
  {
    title: '查看结果详情',
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
        title: '标签',
        name: 'Group',
        parent: 'FaceGroup'
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
      },
      {
        title: '设备备份',
        name: 'Backup',
        parent: 'SysSetting'
      }
    ]
  }
]
