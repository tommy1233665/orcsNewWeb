import "babel-polyfill";
import { Provider } from "react-redux";
import { HashRouter, Switch, Route } from "react-router-dom";
import { PersistGate } from "redux-persist/lib/integration/react";
import { ConfigProvider } from "antd";
import zh_CN from "antd/es/locale/zh_CN";
import "css/theme.scss";
import { store, persistor } from "reduxs/store";
import { PageContainer } from "common/component";
import Index from "./pages/Index";
import Login from "./pages/Login";
import FlightRiskDetail from "./pages/FlightRiskDetail";
import QarOilAnalysis from "./pages/QarOilAnalysis";
import NewFlightRiskDetail from "./pages/NewFlightRiskDetail";
import "ant-design-pro/dist/ant-design-pro.css";
import Exception from "ant-design-pro/lib/Exception";

/**
 * 生产环境：
 *   g_url: xxxxx
 *   w_url: xxxxx
 * 测试环境：
 *   g_url: https://10.79.8.168/
 *   w_url: /orcs-web/#/
 * 开发环境：
 *   g_url: http://10.95.18.76:8080/orcs-web/
 *   w_url: /#/
 * 注意：w_url若直接部署在端口里，则为“/#/”,否则为部署在端口的文件夹名称，如："/orcs-web/#/"
 */

if (PRODUCTION) {
  // 测试环境或生产环境
  //window.g_url = "https://10.79.8.168/";
  window.g_url = "https://orcs.csair.com/";
  window.w_url = "/orcs-web/#/";
} else if (DEVELEPMENT) {
  // 开发环境
  window.g_url = "http://10.95.18.218:8080/orcs-web/";
  window.w_url = "/#/";
  // window.g_url = "http://10.79.8.168/";
  // window.w_url = "/orcs-web/#/";
}

// 权限管理菜单是否显示
window.isShowPermission = true;

class App extends React.Component {
  render() {
    return (
      // redux
      <Provider store={store}>
        {/* 数据持久化 */}
        <PersistGate loading={null} persistor={persistor}>
          {/* 国际化 */}
          <ConfigProvider locale={zh_CN}>
            {/* 静态路由 */}
            <HashRouter>
              {/* 路由跳转控制 */}
              <PageContainer>
                <div className="main">
                  <Switch>
                    <Route exact path="/" component={Login} />
                    <Route path="/index" component={Index} />
                    <Route
                      path="/FlightRiskDetail/:flightCode/:batchNum?"
                      component={FlightRiskDetail}
                    />
                    <Route
                      path="/HistoryFlightRiskDetail/:flightCode/:batchNum?"
                      component={FlightRiskDetail}
                    />
                    <Route
                      path="/NewFlightRiskDetail/:flightCode?"
                      component={NewFlightRiskDetail}
                    />
                    <Route
                      path="/QarOilAnalysis/:flightCode?"
                      component={QarOilAnalysis}
                    />
                    <Route path="*" type="404" component={Exception} />
                  </Switch>
                </div>
              </PageContainer>
            </HashRouter>
          </ConfigProvider>
        </PersistGate>
      </Provider>
    );
  }
}
ReactDOM.render(<App />, document.getElementById("index"));
