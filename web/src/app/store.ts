import { api } from "@/features/api";
import { configureStore } from "@reduxjs/toolkit";
import { setupListeners } from "@reduxjs/toolkit/query";
import AuthReducer from "@/features/auth/slice";
import NotificationsReducer from "@/features/app/topbar/slice";

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
    auth: AuthReducer,
    notifications: NotificationsReducer,
  },

  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(api.middleware),
});

setupListeners(store.dispatch);

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type: {posts: PostsState, comments: CommentsState, users: UsersState}
export type AppDispatch = typeof store.dispatch;
