import { App as AntdApp, ConfigProvider, theme } from 'antd';
import SysDictTypePage from './pages/sys-dict-type';
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
          <SysDictTypePage />
        </AntdApp>
      </ConfigProvider>
    </QueryClientProvider>
  );
}

export default App;
