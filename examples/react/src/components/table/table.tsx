import { useQuery } from '@tanstack/react-query';
import { Table as AntdTable, TableProps as AntdTableProps } from 'antd';
import { AnyObject } from 'antd/es/_util/type';
import { ColumnsType } from 'antd/es/table';
import { useState } from 'react';

import { PageData } from '@/types/request';

import { useTableContext } from './context';

const DEFAULT_PAGE_NO = 1;
const DEFAULT_PAGE_SIZE = 10;

interface TableProps<RecordType>
  extends Omit<
    AntdTableProps<RecordType>,
    'pagination' | 'dataSource' | 'loading' | 'scroll' | 'columns'
  > {
  columns: ColumnsType<RecordType>;
  requestKey: string[];
  request: (params: {
    pageNo: number;
    pageSize: number;
  }) => Promise<PageData<RecordType>>;
}

function Table<RecordType extends AnyObject & { id: number | bigint }>(
  props: TableProps<RecordType>,
) {
  const { columns, requestKey, request, ...restProps } = props;

  const { params } = useTableContext();

  const [pageNo, setPageNo] = useState(DEFAULT_PAGE_NO);
  const [pageSize, setPageSize] = useState(DEFAULT_PAGE_SIZE);
  // 请求获取结果
  const { data, status } = useQuery({
    queryKey: [...requestKey, pageNo, pageSize, params],
    queryFn: async () =>
      request({ pageNo, pageSize, ...params })
        .then((res) => ({
          ...res,
          records: res.records,
        }))
        .then((res) => {
          // 防止删除第二页的仅有的一条数据时，刷新显示错误
          if (res.records.length === 0 && pageNo > 1) {
            setPageNo(pageNo - 1);
          }
          return res;
        }),
  });

  return (
    <AntdTable
      rowKey="id"
      columns={columns}
      dataSource={data?.records}
      pagination={{
        current: data?.current,
        pageSize: data?.size,
        total: data?.total,
        showSizeChanger: true,
        showTotal: (total) => `共 ${total} 条记录`,
        onChange: (pageNo, pageSize) => {
          setPageNo(pageNo);
          setPageSize(pageSize);
        },
      }}
      loading={status === 'pending'}
      scroll={{ x: 'max-content' }}
      style={{ width: '100%' }}
      {...restProps}
    />
  );
}

export default Table;
