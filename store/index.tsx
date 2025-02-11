import { combineReducers, configureStore } from '@reduxjs/toolkit';
import configSlice from './configSlice';

const rootReducer = combineReducers({
    config: configSlice,
});

export default configureStore({
    reducer: rootReducer,
});

export type IRootState = ReturnType<typeof rootReducer>;
