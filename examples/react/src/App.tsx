import { App as AntdApp, ConfigProvider, theme } from 'antd';
// import SysDictTypePage from './pages/sys-dict-type';
import SysDictTypePageTest from './pages/sys-dict-type-test';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ConfigProvider
        theme={{
          algorithm: [theme.defaultAlgorithm],
          token: {
            colorPrimary: '#1890ff',
          },
          components: {
            Layout: {
              headerPadding: 0,
              headerHeight: 48,
            },
          },
        }}
      >
        <AntdApp>
          <SysDictTypePageTest />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
