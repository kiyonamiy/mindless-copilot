import { TableColumnsType } from 'antd';
import { useMemo } from 'react';
import SysDictTypeTest from '@/types/sys-dict-type-test';

// import ActionGroup from '@/components/action-group';
// import { UserStatusEnum } from '@/constants/user';

export const useTableColumns = () => {
  const columns: TableColumnsType<SysDictTypeTest> = useMemo(
    () => [
      {
        title: '主键',
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
        title: '状态（启用 1、禁用 2）',
        dataIndex: 'status',
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
