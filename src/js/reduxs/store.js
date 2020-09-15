import { createStore, combineReducers, applyMiddleware } from 'redux';
import { common } from './reducer';
import thunk from 'redux-thunk'; // 中间件，有了这个就可以支持异步action
import { persistStore, persistReducer } from 'redux-persist';
import asyncSessionStorage from 'redux-persist/lib/storage/session';

const persistConfig = {
    key: 'app',
    storage: asyncSessionStorage,
    blacklist: [],//黑名单
    whitelist: ['userInfo', 'authority', 'permission', 'currentMenu'],//白名单
};

const appReduer = persistReducer(persistConfig, common);  // 包装rootReducer
export const store = createStore(appReduer, applyMiddleware(thunk));     // store树
export const persistor = persistStore(store);  // 包装store形成持久化数据
