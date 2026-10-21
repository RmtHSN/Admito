const BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5173/api";

function getToken() {
  return localStorage.getItem("admito_token");
}

async function request(path, { method = "GET", body } = {}) {
  const headers = { "Content-Type": "application/json" };
  const token = getToken();

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(data.message || `Request failed (${res.status})`);
  }

  return data;
}

// Same as request(), but for multipart uploads (the browser sets the Content-Type)
async function formRequest(path, { method = "POST", form } = {}) {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    body: form,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

export const adminApi = {
  login: (email, password) =>
    request("/users/login", {
      method: "POST",
      body: { email, password },
    }),

  // Circulars
  getCirculars: () => request("/circulars"),

  createCircular: (payload) =>
    request("/circulars", {
      method: "POST",
      body: payload,
    }),

  updateCircular: (id, payload) =>
    request(`/circulars/${id}`, {
      method: "PUT",
      body: payload,
    }),

  deleteCircular: (id) =>
    request(`/circulars/${id}`, {
      method: "DELETE",
    }),

  // Important Dates
  getImportantDates: () => request("/important-dates"),

  createImportantDate: (payload) =>
    request("/important-dates", {
      method: "POST",
      body: payload,
    }),

  updateImportantDate: (id, payload) =>
    request(`/important-dates/${id}`, {
      method: "PUT",
      body: payload,
    }),

  deleteImportantDate: (id) =>
    request(`/important-dates/${id}`, {
      method: "DELETE",
    }),

  // Home page carousel banners
  getBanners: () => request("/banners/admin/all"),
  createBanner: (form) => formRequest("/banners", { method: "POST", form }),
  updateBanner: (id, form) => formRequest(`/banners/${id}`, { method: "PUT", form }),
  deleteBanner: (id) => request(`/banners/${id}`, { method: "DELETE" }),

  // Assessments
  getAssessments: () => request("/assessments"),

  createAssessment: (payload) =>
    request("/assessments", {
      method: "POST",
      body: payload,
    }),

  updateAssessment: (id, payload) =>
    request(`/assessments/${id}`, {
      method: "PUT",
      body: payload,
    }),

  deleteAssessment: (id) =>
    request(`/assessments/${id}`, {
      method: "DELETE",
    }),
};

export { getToken };
