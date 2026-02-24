export const selectAuth = (state) => state.auth;
export const selectIsLoggedIn = (state) => state.auth.isLoggedIn;
export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
export const selectIsLoading = (state) => state.auth.isLoading;
export const selectCurrentAdmin = (state) => state.auth.current;
export const selectAuthError = (state) => state.auth.error;
