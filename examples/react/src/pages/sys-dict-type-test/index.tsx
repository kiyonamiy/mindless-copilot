import './index.less';

import { TableContextProvider } from '@/components/table/context';
import Table from '@/components/table/table';

import { useTableColumns } from './hooks/table-columns';
import { PageData, PageParams } from '@/types/request';
import SysDictTypeTest from '@/types/sys-dict-type-test';

export default function SysDictTypeTestPage() {
  const columns = useTableColumns();

  return (
    <div className="sys-dict-type-test-page">
      <TableContextProvider>
        <div className="table-container">
          <Table
            columns={columns}
            requestKey={['sys-dict-type-test-page']}
            request={(params: PageParams) => {
              return new Promise<PageData<SysDictTypeTest>>((resolve) => {
                setTimeout(() => {
                  resolve({
                    current: params.pageNo,
                    size: params.pageSize,
                    total: 100,
                    records: [
                      {
                        id: 1,
                        name: '测试1',
                        type: '测试1',
                        status: 1,
                      },
                    ],
                  });
                }, 1000);
              });
            }}
          />
        </div>
      </TableContextProvider>
    </div>
  );
}
