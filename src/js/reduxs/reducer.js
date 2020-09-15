// 初始化state数据
const initialState = {
    userInfo: {},
    authority: [],
    permission: [],
    currentMenu: { currentMenus: [], currentId: [], openKeys: [] }
};

/**
 * 公共reducer
 * @return
 */
const common = (state = initialState, action) => {
    switch (action.type) {
        case 'UPDATE_USER_INFO':
            return Object.assign({}, state, { userInfo: action.userInfo });
        case 'UPDATE_AUTHORITY':
            return Object.assign({}, state, { authority: action.authority });
        case 'UPDATE_PERMISSION':
            return Object.assign({}, state, { permission: action.permission });
        case 'UPDATE_CURRENT_MENU':
            const currentMenu = Object.assign({}, state.currentMenu, action.currentMenu);
            return Object.assign({}, state, { currentMenu });
        default:
            return state;
    }
}

export { common };