import { Switch, Route } from "react-router-dom";
import Bundle from 'common/bundle';
// // 异步引入
import PermissionModule from 'bundle-loader?lazy&name=cat-[name]!./Permission';
import UserModule from 'bundle-loader?lazy&name=cat-[name]!./User';
import RoleModule from 'bundle-loader?lazy&name=cat-[name]!./Role';

// 用户管理
const User = () => (
    <Bundle load={UserModule}>
        {(User) => <User />}
    </Bundle>
);

// 角色管理
const Role = () => (
    <Bundle load={RoleModule}>
        {(Role) => <Role />}
    </Bundle>
);

// 权限管理
const Permission = () => (
    <Bundle load={PermissionModule}>
        {(Permission) => <Permission />}
    </Bundle>
);

class SystemMain extends React.Component {
    render() {
        const { match: { url } } = this.props;
        return (
            <Switch>
                <Route path={`${url}/User`} component={User} />
                <Route path={`${url}/Role`} component={Role} />
                <Route path={`${url}/Permission`} component={Permission} />
            </Switch>
        );
    }
}

export default SystemMain;