import { withRouter } from "react-router-dom";
import { connect } from "react-redux";
import {
  updateUserInfo,
  updateAuthority,
  updatePermission,
  updateCurrentMenu,
} from "reduxs/action";
import { Layout, Menu, Breadcrumb, Icon, BackTop, message } from "antd";
import { href, getUrlSearch } from "common/commonFn";
import { FourBorder } from "common/component";
import { get, post } from "common/http";
import CenterRouter from "./CenterRouter";

const { Header, Content, Sider } = Layout;
const { SubMenu } = Menu;

class Index extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      collapsed: false,
      changeOpenKey: [],
    };
    this.currentMenus = [];
    this.opParentMenu = {};
  }

  componentDidMount() {
    // 获取菜单
    get({
      url: "json/permission.json",
      success: (data) => {
        let menus = this.getMenu(data);
        this.props.updatePermission(menus);
        const { currentMenus, currentId, openKeys } = this.props.currentMenu;
        this.props.updateCurrentMenu({
          currentMenus: currentMenus.length == 0 ? [menus[0]] : currentMenus,
          currentId: currentId.length == 0 ? [menus[0].key] : currentId,
          openKeys: currentId.length == 0 ? [] : openKeys,
        });
      },
    });
    window.addEventListener("hashchange", this.routerEvent);
  }
  componentWillUnmount() {
    window.removeEventListener("hashchange", this.routerEvent);
  }

  routerEvent = (e) => {
    let urlParams = e.target.location.hash.replace("#", "");
    // 去掉#就能获取即将跳转的那个路由的url了
    if (urlParams === "/index") {
      this.setState({
        changeOpenKey: ["1"],
      });
    } else {
      this.setState({
        changeOpenKey: [getUrlSearch(urlParams, 1).key.slice(0, 1)],
      });
    }
  };

  // 根据权限和总菜单处理菜单数据
  getMenu(data) {
    let authority = this.props.authority;
    for (let i = 0; i < data.length; i++) {
      if (data[i].type == "leaf") {
        for (let j = 0; j < authority.length; j++) {
          if (data[i].id && data[i].id == authority[j].id) {
            data[i].show = true;
            break;
          }
        }
      } else if (data[i].type == "category") {
        data[i].children = this.getMenu(data[i].children);
        let flag = false;
        data[i].children.forEach((item, index) => {
          if (item.show) flag = true;
        });
        data[i].show = flag;
      } else if (data[i].type == "hide") {
        data[i].show = false;
      }
    }
    return data;
  }

  //退出
  logout = () => {
    post({
      url: "loginOut",
      success: (data) => {
        href(this, "/");
      },
      error: (data) => {
        message.error("退出失败！");
      },
    });
  };

  //显示隐藏侧边栏
  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  };

  //获取指定key
  getNodes = (nodes, key) => {
    for (let node of nodes) {
      if (node.key == key) {
        this.currentMenus.push(node);
        this.opParentMenu = node;
      } else if (node.children && node.children.length > 0) {
        this.getNodes(node.children, key);
      }
    }
  };

  //获取当前node和其所有的父类
  getAllParentNodes = (nodes, key) => {
    this.getNodes(nodes, key, true);
    if (this.opParentMenu.parentKey) {
      this.getAllParentNodes(nodes, this.opParentMenu.parentKey);
    }
  };

  //只打开一个1级菜单
  onOpenChange = (openKeys) => {
    //清空数据
    // this.opParentMenu = {};
    // this.currentMenus = [];
    // //获取当前点击的key
    // const menu = this.props.currentMenu;
    // const latestOpenKey = openKeys.find(
    //   (key) => menu.openKeys.includes(key) == false
    // );
    // let keys;
    // if (latestOpenKey) {
    //   console.log(latestOpenKey, 'latestOpenKey')
    //   this.getAllParentNodes(this.props.permission, latestOpenKey);
    //   keys = this.currentMenus.map((item) => item.key).reverse();
    // } else {
    //   console.log(openKeys, 'openKeys')
    //   keys = openKeys;
    // }
    // // 提取key数组
    // this.props.updateCurrentMenu({ openKeys: keys });

    // fixBug 返回时更新菜单展开状态
    const latestOpenKey = openKeys.find(key => this.state.changeOpenKey.indexOf(key) === -1);
    const res = this.props.permission.map(item => item.key)
    if (res.indexOf(latestOpenKey) === -1) {
      this.setState({
        changeOpenKey: []
      });
    } else {
      this.setState({
        changeOpenKey: latestOpenKey ? [latestOpenKey] : [],
      });
    }
  };

  //点击菜单
  clickMenuItem = (menu) => {
    window.scrollTo(0, 0);
    // 主页单独处理
    if (menu.key == "1") {
      this.props.updateCurrentMenu({
        currentMenus: [menu],
        currentId: [menu.key],
        openKeys: [],
      });
    } else {
      this.props.updateCurrentMenu({
        currentMenus: [...this.currentMenus.reverse(), menu],
        currentId: [menu.key],
        openKeys: this.props.currentMenu.openKeys,
      });
    }
    let params = {
      name: menu.name,
      key: menu.key,
    };
    href(this, menu.url, params);
  };
  //递归获取菜单结构
  getMenuDom = (permission) => {
    if (!permission || permission.length == 0) {
      return null;
    }
    const html = permission.map((menu) => {
      // 显示菜单 权限管理
      if (window.isShowPermission && menu.name == "权限管理") menu.show = true;
      const icon = menu.icon ? <Icon type={menu.icon} /> : "";
      if (menu.show) {
        if (menu.type == "category") {
          const title = (
            <span>
              {icon}
              <span>{menu.name}</span>
            </span>
          );
          return (
            <SubMenu key={menu.key} title={title} className="submenu">
              {this.getMenuDom(menu.children)}
            </SubMenu>
          );
        } else {
          return (
            <Menu.Item key={menu.key} onClick={() => this.clickMenuItem(menu)}>
              {icon}
              <span>{menu.name}</span>
            </Menu.Item>
          );
        }
      }
    });
    return html;
  };

  // 点击面包屑导航跳转
  goTo(menu) {
    const { currentMenus } = this.props.currentMenu;
    var i = -1;
    currentMenus.forEach((item, index) => {
      if (menu.key == item.key) i = index;
    });
    if (i > -1 && menu.url) {
      var menus = currentMenus.filter((item, index) => index <= i);
      this.props.updateCurrentMenu({
        currentMenus: menus,
      });
      if (menu.key == "1-1") {
        // 特殊处理
        this.props.history.goBack();
      } else {
        let params = {
          name: currentMenus[currentMenus.length - 2].name,
          key: currentMenus[currentMenus.length - 2].key,
        }
        href(this, menu.url, params);
      }
    }
  }

  render() {
    const { userInfo, permission, currentMenu } = this.props;
    const { currentMenus, currentId } = currentMenu;
    const { collapsed } = this.state;
    return (
      <Layout>
        {/* 侧边栏菜单 */}
        <Sider
          trigger={null}
          width="300"
          collapsible
          collapsed={collapsed}
          className="left-slider"
        >
          <div className="logo-cont">
            <i className="logo"></i>
          </div>
          <Menu
            theme="dark"
            // openKeys={getOpenKeys(currentMenu.openKeys, this.props.location)}
            selectedKeys={[getUrlSearch(this.props.location).key]}
            openKeys={this.state.changeOpenKey}
            onOpenChange={this.onOpenChange}
            mode="inline"
            className={"menu " + (collapsed ? "small-menu" : "")}
          >
            {this.getMenuDom(permission)}
          </Menu>
        </Sider>
        {/* 右侧内容 */}
        <Layout className="right-layout">
          {/* 头部 */}
          <Header className="flex">
            <div className="center-header">
              <Icon
                className="trigger"
                type={collapsed ? "menu-unfold" : "menu-fold"}
                onClick={this.toggle}
              />
              <div className="title">
                <div>运行风险管控系统</div>
                <div>orcs.csair.com</div>
              </div>
              <div className="user-info">
                <div className="user-img"></div>
                <div className="name">{userInfo.username}</div>
              </div>
            </div>
            <div className="right-header">
              <div className="out-img" onClick={this.logout}></div>
            </div>
          </Header>
          <Content>
            {/* 路标 */}
            <div className="url-router">
              <FourBorder></FourBorder>
              {/* <div className="title">
                {currentMenus.length !== 0 &&
                  currentMenus[currentMenus.length - 1].name}
              </div> */}
              <div className="title">
                {this.props.location.pathname === "/index"
                  ? "主页"
                  : decodeURIComponent(getUrlSearch(this.props.location).name)}
              </div>
              <Breadcrumb className="router">
                {currentMenus
                  .filter((item, index) => index < currentMenus.length - 1)
                  .map((item, index) => {
                    return (
                      <Breadcrumb.Item
                        className={item.url ? "breadcrumb" : ""}
                        key={item.key}
                        onClick={(e) => this.goTo(item)}
                      >
                        {item.icon && <Icon type={item.icon} />}
                        <span>{item.name}</span>
                      </Breadcrumb.Item>
                    );
                  })}
                {currentMenus
                  .filter((item, index) => index == currentMenus.length - 1)
                  .map((item, index) => {
                    return (
                      <Breadcrumb.Item key={item.key}>
                        {this.props.location.pathname === "/index"
                          ? "主页"
                          : decodeURIComponent(
                            getUrlSearch(this.props.location).name
                          )}
                      </Breadcrumb.Item>
                    );
                  })}
              </Breadcrumb>
            </div>
            {/* 主内容 */}
            <div id="rightContent" className="right-content">
              <CenterRouter />
            </div>
          </Content>
        </Layout>
        <BackTop target={() => document.getElementById("rightContent")} />
      </Layout>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    userInfo: state.userInfo,
    authority: state.authority,
    permission: state.permission,
    currentMenu: state.currentMenu,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    updatePermission: (permission) => dispatch(updatePermission(permission)),
    updateCurrentMenu: (currentMenu) =>
      dispatch(updateCurrentMenu(currentMenu)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Index));
