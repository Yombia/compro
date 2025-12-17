// src/api/api.js

const API_BASE_URL = 'http://localhost:8000/api';

// Helper untuk mengambil token dari localStorage
const getAuthToken = () => {
  return localStorage.getItem('auth_token');
};

// Helper untuk menyimpan token ke localStorage
const setAuthToken = (token) => {
  localStorage.setItem('auth_token', token);
};

// Helper untuk menghapus token dari localStorage
const removeAuthToken = () => {
  localStorage.removeItem('auth_token');
};

export const clearApiCache = () => {
  try {
    const cacheKeys = [
      'api_cache',
      'mahasiswa_cache',
      'riwayat_cache',
      'dashboard_cache',
    ];

    cacheKeys.forEach((key) => localStorage.removeItem(key));
  } catch (error) {
    console.error('Gagal membersihkan cache API:', error);
  }
};

export const api = {
  // Auth endpoints
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Login gagal');
    }

    const data = await response.json();
    
    // Simpan token ke localStorage
    if (data.token) {
      setAuthToken(data.token);
    }
    
    return data;
  },

  logout: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/logout`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    // Hapus token dari localStorage
    removeAuthToken();
    
    return await response.json();
  },

  me: async () => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/me`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error('Gagal mengambil data user');
    }

    return await response.json();
  },

  // Pengajuan rencana studi mahasiswa
  mahasiswa: {
    // Get profile mahasiswa
    getProfile: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/mahasiswa/profile`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data profil');
      }

      return await response.json();
    },

    submitRencanaStudi: async (data) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/mahasiswa/recommendation/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal submit rencana studi');
      }

      return await response.json();
    },

    // Get riwayat mahasiswa
    getRiwayat: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/mahasiswa/riwayat`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil riwayat');
      }

      return await response.json();
    },
  },

  // Mendapatkan detail rencana studi berdasarkan ID
  getRencanaStudiDetail: async (id) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/rencana-studi/${id}`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
    });
    return await response.json();
  },

  // Mengupdate status pengajuan
  updateStatusRencanaStudi: async (id, status) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}/rencana-studi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return await response.json();
  },

  // Dosen endpoints
  dosen: {
    // Get profile dosen
    getProfile: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/profile`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data profil');
      }

      return await response.json();
    },

    // Get dashboard data
    getDashboard: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/dashboard`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data dashboard');
      }

      return await response.json();
    },

    // Get list mahasiswa
    getMahasiswa: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/mahasiswa`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data mahasiswa');
      }

      return await response.json();
    },

    // Get detail rencana studi
    getDetailRencanaStudi: async (id) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/rencana-studi/${id}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil detail rencana studi');
      }

      return await response.json();
    },

    // Setujui rencana studi
    setujuiRencanaStudi: async (id, catatan = null) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/rencana-studi/${id}/setujui`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ catatan }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyetujui rencana studi');
      }

      return await response.json();
    },

    // Tolak rencana studi
    tolakRencanaStudi: async (id, catatan = null) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/rencana-studi/${id}/tolak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ catatan }),
      });

      if (!response.ok) {
        throw new Error('Gagal menolak rencana studi');
      }

      return await response.json();
    },

    // Cancel rencana studi
    cancelRencanaStudi: async (id) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/rencana-studi/${id}/tolak`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ catatan: 'Dibatalkan oleh dosen' }),
      });

      if (!response.ok) {
        throw new Error('Gagal membatalkan rencana studi');
      }

      return await response.json();
    },

    // Get riwayat
    getRiwayat: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/riwayat`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil riwayat');
      }

      return await response.json();
    },

    // Generate AI recommendation
    generateRekomendasi: async (rencanaStudiId) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/rencana-studi/${rencanaStudiId}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Gagal generate rekomendasi');
      }

      return await response.json();
    },

    // Get recommendation status (polling)
    getRecommendationStatus: async (sessionId) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/recommendation/status/${sessionId}`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil status');
      }

      return await response.json();
    },

    // Get all mata kuliah
    getAllMataKuliah: async () => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/mata-kuliah`, {
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Gagal mengambil data mata kuliah');
      }

      return await response.json();
    },

    // Update mata kuliah hasil rekomendasi
    updateMataKuliah: async (rencanaStudiId, mataKuliah, catatan = null) => {
      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/dosen/rencana-studi/${rencanaStudiId}/update-mata-kuliah`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          mata_kuliah: mataKuliah,
          catatan: catatan 
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal update mata kuliah');
      }

      return await response.json();
    },
  },
};

