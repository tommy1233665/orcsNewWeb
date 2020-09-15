/**
 * 公共 action
 */
export const UPDATE_USER_INFO = 'UPDATE_USER_INFO';//增加登录用户基本信息
export const UPDATE_AUTHORITY = 'UPDATE_AUTHORITY';//登录登录用户权限
export const UPDATE_PERMISSION = 'UPDATE_PERMISSION';//增加用户权限
export const UPDATE_CURRENT_MENU = 'UPDATE_CURRENT_MENU';//增加当前访问菜单名称

/**
 * 存储更新登录用户基本信息
 */
const updateUserInfo = (userInfo) => {
    return {
        type: UPDATE_USER_INFO,
        userInfo
    }
}

/**
 * 存储更新登录用户权限
 */
const updateAuthority = (authority) => {
    return {
        type: UPDATE_AUTHORITY,
        authority
    }
}

/**
 * 存储更新用户权限
 */
const updatePermission = (permission) => {
    return {
        type: UPDATE_PERMISSION,
        permission
    }
}

/**
 * 存储更新当前访问菜单名称
 */
const updateCurrentMenu = (currentMenu) => {
    return {
        type: UPDATE_CURRENT_MENU,
        currentMenu
    }
}

export { updateUserInfo, updateAuthority, updatePermission, updateCurrentMenu };