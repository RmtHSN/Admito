import { API_URL as API } from "./config";

export const getToken = () => localStorage.getItem("token");

export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("userId");
  localStorage.removeItem("isLoggedIn");
  window.dispatchEvent(new Event("auth-change"));
};

export async function apiFetch(path, options = {}) {
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
      Authorization: `Bearer ${getToken()}`,
    },
  });

  if (res.status === 401) {
    logout();
    window.location.href = "/login";
    throw new Error("Session expired. Please log in again.");
  }
  return res;
}