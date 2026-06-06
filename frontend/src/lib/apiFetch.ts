const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const apiFetch = (path: string, options: RequestInit = {}) => {
  const token = typeof window !== "undefined" 
    ? localStorage.getItem("access_token") 
    : null;
  return fetch(`${API_URL}${path}`, {
    // ensure cookies (HttpOnly) are included for endpoints that rely on cookie auth
    credentials: (options && (options as any).credentials) || "include",
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
};