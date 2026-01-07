import { ConfigProvider, theme } from 'antd';
import { Outlet } from 'react-router-dom';
import zhCN from 'antd/locale/zh_CN';
const App = () => {
  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1890FF',
          borderRadius: 8,
        },
      }}
    >
      <Outlet></Outlet>
    </ConfigProvider>
  );
};

export default App;
