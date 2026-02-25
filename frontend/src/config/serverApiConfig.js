console.log(
  "process env VITE_DEV_REMOTE",
  import.meta.env.VITE_DEV_REMOTE
)

export const API_BASE_URL =
  process.env.NODE_ENV == "production" ||
  import.meta.env.VITE_DEV_REMOTE == "remote"
    ? "https://wild-puce-reindeer-sari.cyclic.app/api/"
    : import.meta.env.VITE_API_URL || "http://localhost:8000/api/"

export const ACCESS_TOKEN_NAME = "x-auth-token"
export const REFRESH_TOKEN_NAME = "refreshToken"
