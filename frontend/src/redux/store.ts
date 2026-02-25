import { configureStore } from '@reduxjs/toolkit';
import authReducer from './auth/slice';
import crudReducer from './crud/slice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    crud: crudReducer,
  },
  middleware: getDefaultMiddleware =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
