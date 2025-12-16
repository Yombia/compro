// src/api/api.js

const sanitizeBaseUrl = (baseUrl) => {
  if (!baseUrl) {
    return '';
  }

  return baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
};

const envBaseUrl = typeof import.meta !== 'undefined' ? import.meta.env?.VITE_API_BASE_URL : undefined;
const API_BASE_URL = sanitizeBaseUrl(envBaseUrl ?? 'http://localhost:8000/api');

const buildUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
};

const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

const CACHE_TTL_MS = 2 * 60 * 1000;
let dosenProfileCache = null;
let dosenProfileTimestamp = 0;
let dosenProfilePromise = null;
let dosenMahasiswaCache = null;
let dosenMahasiswaTimestamp = 0;
let dosenMahasiswaPromise = null;

const shouldUseCache = (timestamp) => {
  if (!timestamp) {
    return false;
  }

  return Date.now() - timestamp < CACHE_TTL_MS;
};

const clearDosenCache = () => {
  dosenProfileCache = null;
  dosenProfileTimestamp = 0;
  dosenProfilePromise = null;
  dosenMahasiswaCache = null;
  dosenMahasiswaTimestamp = 0;
  dosenMahasiswaPromise = null;
};

export const clearApiCache = () => {
  clearDosenCache();
};

const request = async (path, { method = 'GET', body, headers = {}, auth = true } = {}) => {
  const finalHeaders = {
    Accept: 'application/json',
    ...headers,
  };

  let formattedBody = body;

  if (body && !(body instanceof FormData)) {
    finalHeaders['Content-Type'] = 'application/json';
    formattedBody = JSON.stringify(body);
  }

  if (auth) {
    const token = getAuthToken();

    if (!token) {
      throw new Error('Token tidak ditemukan, silakan login ulang');
    }

    finalHeaders.Authorization = `Bearer ${token}`;
  }

  let response;

  try {
    response = await fetch(buildUrl(path), {
      method,
      headers: finalHeaders,
      body: formattedBody,
    });
  } catch (error) {
    throw new Error('Gagal terhubung ke server');
  }

  if (!response.ok) {
    let errorMessage = 'Permintaan gagal';

    try {
      const errorPayload = await response.json();
      errorMessage = errorPayload.message ?? errorMessage;

      if (errorPayload.errors) {
        const firstError = Object.values(errorPayload.errors)[0];

        if (Array.isArray(firstError) && firstError.length > 0) {
          errorMessage = firstError[0];
        }
      }
    } catch (parseError) {
      // Abaikan jika respons gagal di-parse
    }

    throw new Error(errorMessage);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
};

export const api = {
  login: async (email, password) => {
    const data = await request('/login', {
      method: 'POST',
      body: { email, password },
      auth: false,
    });

    if (data.token) {
      setAuthToken(data.token);
      clearDosenCache();
    }

    return data;
  },

  logout: async () => {
    try {
      return await request('/logout', {
        method: 'POST',
      });
    } finally {
      clearDosenCache();
      removeAuthToken();
    }
  },

  me: async () => {
    return request('/me');
  },

  mahasiswa: {
    getProfile: async () => {
      return request('/mahasiswa/profile');
    },

    submitRencanaStudi: async (payload) => {
      return request('/mahasiswa/recommendation/submit', {
        method: 'POST',
        body: payload,
      });
    },

    getRiwayat: async () => {
      return request('/mahasiswa/riwayat');
    },
  },

  getRencanaStudiDetail: async (id) => {
    return request(`/rencana-studi/${id}`);
  },

  updateStatusRencanaStudi: async (id, status) => {
    return request(`/rencana-studi/${id}`, {
      method: 'PUT',
      body: { status },
    });
  },

  dosen: {
    getProfile: async ({ force = false } = {}) => {
      if (!force && dosenProfileCache && shouldUseCache(dosenProfileTimestamp)) {
        return dosenProfileCache;
      }

      if (!force && dosenProfilePromise) {
        return dosenProfilePromise;
      }

      const loadProfile = (async () => {
        const data = await request('/dosen/profile');
        dosenProfileCache = data;
        dosenProfileTimestamp = Date.now();
        return data;
      })();

      dosenProfilePromise = loadProfile;

      try {
        return await loadProfile;
      } finally {
        dosenProfilePromise = null;
      }
    },

    getDashboard: async () => {
      return request('/dosen/dashboard');
    },

    getMahasiswa: async ({ force = false } = {}) => {
      if (!force && dosenMahasiswaCache && shouldUseCache(dosenMahasiswaTimestamp)) {
        return dosenMahasiswaCache;
      }

      if (!force && dosenMahasiswaPromise) {
        return dosenMahasiswaPromise;
      }

      const loadMahasiswa = (async () => {
        const data = await request('/dosen/mahasiswa');
        dosenMahasiswaCache = data;
        dosenMahasiswaTimestamp = Date.now();
        return data;
      })();

      dosenMahasiswaPromise = loadMahasiswa;

      try {
        return await loadMahasiswa;
      } finally {
        dosenMahasiswaPromise = null;
      }
    },

    getDetailRencanaStudi: async (id) => {
      return request(`/dosen/rencana-studi/${id}`);
    },

    setujuiRencanaStudi: async (id, catatan = null) => {
      return request(`/dosen/rencana-studi/${id}/setujui`, {
        method: 'POST',
        body: { catatan },
      });
    },

    tolakRencanaStudi: async (id, catatan = null) => {
      return request(`/dosen/rencana-studi/${id}/tolak`, {
        method: 'POST',
        body: { catatan },
      });
    },

    cancelRencanaStudi: async (id) => {
      return request(`/dosen/rencana-studi/${id}/tolak`, {
        method: 'POST',
        body: { catatan: 'Dibatalkan oleh dosen' },
      });
    },

    getRiwayat: async () => {
      return request('/dosen/riwayat');
    },

    generateRekomendasi: async (rencanaStudiId) => {
      return request(`/dosen/rencana-studi/${rencanaStudiId}/generate`, {
        method: 'POST',
      });
    },

    getRecommendationStatus: async (sessionId) => {
      return request(`/dosen/recommendation/status/${sessionId}`);
    },

    getAllMataKuliah: async () => {
      return request('/dosen/mata-kuliah');
    },

    updateMataKuliah: async (rencanaStudiId, mataKuliah, catatan = null) => {
      return request(`/dosen/rencana-studi/${rencanaStudiId}/update-mata-kuliah`, {
        method: 'PUT',
        body: {
          mata_kuliah: mataKuliah,
          catatan,
        },
      });
    },
  },
};

