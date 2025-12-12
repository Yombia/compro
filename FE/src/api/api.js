// src/api/api.js
export const api = {
  // Pengajuan rencana studi
  submitRencanaStudi: async (data) => {
    const response = await fetch('http://localhost:5000/api/rencana-studi', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  },

  // Mendapatkan detail rencana studi berdasarkan ID
  getRencanaStudiDetail: async (id) => {
    const response = await fetch(`http://localhost:5000/api/rencana-studi/${id}`);
    return await response.json();
  },

  // Mengupdate status pengajuan
  updateStatusRencanaStudi: async (id, status) => {
    const response = await fetch(`http://localhost:5000/api/rencana-studi/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    return await response.json();
  },
};
