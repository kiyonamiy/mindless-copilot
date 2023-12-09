import { TableColumnsType } from 'antd';
import { useMemo } from 'react';
import { SysDictType } from '../types';

// import ActionGroup from '@/components/action-group';
// import { UserStatusEnum } from '@/constants/user';

export const useTableColumns = () => {
  const columns: TableColumnsType<SysDictType> = useMemo(
    () => [
      {
        title: '字典编号',
        dataIndex: 'id',
      },
      {
        title: '字典名称',
        dataIndex: 'name',
      },
      {
        title: '字典类型',
        dataIndex: 'type',
      },
      {
        title: '状态',
        dataIndex: 'status',
      },
      {
        title: '创建时间',
        dataIndex: 'createTime',
      },
      {
        title: '备注',
        dataIndex: 'remark',
      },
      {
        title: '操作',
        fixed: 'right',
      },
    ],
    [],
  );

  return columns;
};
