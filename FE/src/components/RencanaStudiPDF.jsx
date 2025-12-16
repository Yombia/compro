import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer';

// Register fonts (optional - untuk font yang lebih baik)
// Font.register({
//   family: 'Roboto',
//   src: 'https://fonts.gstatic.com/s/roboto/v30/KFOmCnqEu92Fr1Me5WZLCzYlKw.ttf'
// });

const styles = StyleSheet.create({
  page: {
    backgroundColor: '#FFFFFF',
    padding: 40,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    borderBottom: '2 solid #0B3C9C',
    paddingBottom: 10,
  },
  title: {
    fontSize: 16,
    fontFamily: 'Helvetica-Bold',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 13,
    fontFamily: 'Helvetica-Bold',
    color: '#0B3C9C',
    textAlign: 'center',
  },
  university: {
    fontSize: 10,
    color: '#4A5568',
    textAlign: 'center',
    marginTop: 3,
  },
  dateInfo: {
    fontSize: 9,
    color: '#4A5568',
    textAlign: 'right',
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: 'Helvetica-Bold',
    color: '#0B3C9C',
    marginTop: 15,
    marginBottom: 10,
    borderBottom: '1 solid #0B3C9C',
    paddingBottom: 4,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  infoBox: {
    width: '33.33%',
    paddingHorizontal: 4,
    paddingVertical: 0,
    marginBottom: 8,
  },
  infoBoxContent: {
    border: '1 solid #E5E7EB',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#F9FAFB',
    minHeight: 50,
  },
  infoLabel: {
    fontSize: 8,
    color: '#6B7280',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 11,
    color: '#1F2937',
    fontFamily: 'Helvetica-Bold',
  },
  preferencesSection: {
    marginBottom: 15,
  },
  prefBox: {
    marginBottom: 10,
    border: '1 solid #E5E7EB',
    borderRadius: 4,
    padding: 10,
    backgroundColor: '#F9FAFB',
  },
  prefLabel: {
    fontSize: 9,
    fontFamily: 'Helvetica-Bold',
    color: '#374151',
    marginBottom: 4,
  },
  prefValue: {
    fontSize: 10,
    color: '#1F2937',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 3,
  },
  tag: {
    backgroundColor: '#E0F2FE',
    borderRadius: 3,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginRight: 5,
    marginBottom: 5,
    border: '1 solid #0EA5E9',
  },
  tagText: {
    fontSize: 8,
    color: '#0369A1',
  },
  dominantBox: {
    backgroundColor: '#DBEAFE',
    padding: 10,
    borderRadius: 4,
    marginTop: 4,
    border: '1 solid #0B3C9C',
  },
  dominantText: {
    fontSize: 10,
    color: '#0B3C9C',
    fontFamily: 'Helvetica-Bold',
    textAlign: 'center',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F3F4F6',
    borderBottom: '1 solid #0B3C9C',
    paddingVertical: 6,
    paddingHorizontal: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #E5E7EB',
    paddingVertical: 8,
    paddingHorizontal: 5,
  },
  tableHeaderText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#1F2937',
  },
  tableCell: {
    fontSize: 9,
    color: '#374151',
  },
  colNo: { width: '5%' },
  colKode: { width: '12%' },
  colNama: { width: '30%' },
  colSKS: { width: '8%', textAlign: 'center' },
  colAlasan: { width: '35%' },
  colKecocokan: { width: '10%', textAlign: 'right' },
  kecocokanGreen: {
    color: '#16A34A',
    fontWeight: 'bold',
  },
  kecocokanYellow: {
    color: '#D97706',
    fontWeight: 'bold',
  },
  kecocokanBlue: {
    color: '#2563EB',
    fontWeight: 'bold',
  },
  totalRow: {
    flexDirection: 'row',
    backgroundColor: '#E0F2FE',
    paddingVertical: 6,
    paddingHorizontal: 5,
    marginTop: 5,
    borderTop: '1 solid #0B3C9C',
  },
  totalLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0B3C9C',
    width: '85%',
  },
  totalValue: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#0B3C9C',
    width: '15%',
    textAlign: 'center',
  },
  catatanBox: {
    backgroundColor: '#FEF3C7',
    padding: 10,
    borderRadius: 5,
    marginTop: 15,
    border: '1 solid #F59E0B',
  },
  catatanLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#92400E',
    marginBottom: 5,
  },
  catatanText: {
    fontSize: 9,
    color: '#78350F',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    borderTop: '1 solid #D1D5DB',
    paddingTop: 10,
  },
  footerText: {
    fontSize: 7,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 1.3,
  },
  reviewInfo: {
    fontSize: 8,
    color: '#4B5563',
    textAlign: 'center',
    marginBottom: 5,
  },
});

const RencanaStudiPDF = ({ data }) => {
  if (!data) return null;

  const fokusMap = {
    s2: 'Melanjutkan S2 / Riset',
    industri: 'Bekerja di Industri',
    startup: 'Membangun Start Up Teknologi',
  };

  const belajarMap = {
    konsep: 'Konsep & Analisis',
    project: 'Proyek dan Implementasi',
    campuran: 'Campuran',
  };

  const mahasiswa = data.mahasiswa || {};
  const mataKuliah = data.mata_kuliah || [];
  const interests = mahasiswa.interests || [];
  const totalSks = mataKuliah.reduce((sum, mk) => sum + (mk.sks || 0), 0);

  const getKecocokanStyle = (nilai) => {
    if (nilai >= 80) return styles.kecocokanGreen;
    if (nilai >= 60) return styles.kecocokanYellow;
    return styles.kecocokanBlue;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  return (
    <Document>
      {/* Halaman 1 - Informasi Mahasiswa */}
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Smart Academic Planner</Text>
          <Text style={styles.subtitle}>RENCANA STUDI MAHASISWA</Text>
          <Text style={styles.university}>Fakultas Teknik Elektro - Telkom University</Text>
          <Text style={styles.dateInfo}>{formatDate(data.created_at)}</Text>
        </View>

        {/* Informasi Mahasiswa */}
        <Text style={styles.sectionTitle}>Informasi Mahasiswa</Text>
        <View style={styles.infoGrid}>
          <View style={styles.infoBox}>
            <View style={styles.infoBoxContent}>
              <Text style={styles.infoLabel}>Nama Mahasiswa</Text>
              <Text style={styles.infoValue}>{mahasiswa.nama || '-'}</Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoBoxContent}>
              <Text style={styles.infoLabel}>NIM</Text>
              <Text style={styles.infoValue}>{mahasiswa.nim || '-'}</Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoBoxContent}>
              <Text style={styles.infoLabel}>Program Studi</Text>
              <Text style={styles.infoValue}>{mahasiswa.prodi || 'S1 TEKNIK ELEKTRO'}</Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoBoxContent}>
              <Text style={styles.infoLabel}>IPK</Text>
              <Text style={styles.infoValue}>{parseFloat(mahasiswa.ipk || 0).toFixed(2)}</Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoBoxContent}>
              <Text style={styles.infoLabel}>SKS Diambil</Text>
              <Text style={styles.infoValue}>{totalSks}</Text>
            </View>
          </View>
          <View style={styles.infoBox}>
            <View style={styles.infoBoxContent}>
              <Text style={styles.infoLabel}>Total SKS</Text>
              <Text style={styles.infoValue}>{mahasiswa.total_sks || '-'}</Text>
            </View>
          </View>
        </View>

        {/* Bidang Minat & Preferensi */}
        <Text style={styles.sectionTitle}>Bidang Minat & Preferensi</Text>
        <View style={styles.preferencesSection}>
          <View style={styles.prefBox}>
            <Text style={styles.prefLabel}>Bidang Diminati:</Text>
            <View style={styles.tagsContainer}>
              {interests.length > 0 ? (
                interests.map((interest, idx) => (
                  <View key={idx} style={styles.tag}>
                    <Text style={styles.tagText}>{interest}</Text>
                  </View>
                ))
              ) : (
                <Text style={styles.prefValue}>-</Text>
              )}
            </View>
          </View>

          <View style={styles.prefBox}>
            <Text style={styles.prefLabel}>Fokus Setelah Lulus</Text>
            <Text style={styles.prefValue}>{fokusMap[mahasiswa.future_focus] || '-'}</Text>
          </View>

          <View style={styles.prefBox}>
            <Text style={styles.prefLabel}>Pendekatan Belajar</Text>
            <Text style={styles.prefValue}>{belajarMap[mahasiswa.learning_preference] || '-'}</Text>
          </View>

          <View style={styles.prefBox}>
            <Text style={styles.prefLabel}>Bidang Dominan</Text>
            <View style={styles.dominantBox}>
              <Text style={styles.dominantText}>
                {interests.length > 0 ? interests.join(' dan ') : '-'}
              </Text>
            </View>
          </View>
        </View>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dokumen ini dihasilkan oleh Smart Academic Planner{'\n'}
            Fakultas Teknik Elektro - Telkom University{'\n'}
            Page 1 of 2
          </Text>
        </View>
      </Page>

      {/* Halaman 2 - Rekomendasi Mata Kuliah */}
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>Smart Academic Planner</Text>
          <Text style={styles.subtitle}>RENCANA STUDI MAHASISWA</Text>
        </View>

        <Text style={styles.sectionTitle}>Rekomendasi Mata Kuliah</Text>

        {/* Tabel Mata Kuliah */}
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, styles.colNo]}>No</Text>
            <Text style={[styles.tableHeaderText, styles.colKode]}>Kode</Text>
            <Text style={[styles.tableHeaderText, styles.colNama]}>Mata Kuliah</Text>
            <Text style={[styles.tableHeaderText, styles.colSKS]}>SKS</Text>
            <Text style={[styles.tableHeaderText, styles.colAlasan]}>Alasan Rekomendasi</Text>
            <Text style={[styles.tableHeaderText, styles.colKecocokan]}>Kecocokan</Text>
          </View>

          {mataKuliah.map((mk, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={[styles.tableCell, styles.colNo]}>{index + 1}</Text>
              <Text style={[styles.tableCell, styles.colKode]}>{mk.kode_mk || '-'}</Text>
              <Text style={[styles.tableCell, styles.colNama]}>{mk.nama_mata_kuliah || '-'}</Text>
              <Text style={[styles.tableCell, styles.colSKS]}>{mk.sks || 0}</Text>
              <Text style={[styles.tableCell, styles.colAlasan]}>{mk.alasan || '-'}</Text>
              <Text style={[styles.tableCell, styles.colKecocokan, getKecocokanStyle(mk.tingkat_kecocokan)]}>
                {mk.tingkat_kecocokan ? `${mk.tingkat_kecocokan}%` : '-'}
              </Text>
            </View>
          ))}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total SKS Rekomendasi</Text>
            <Text style={styles.totalValue}>{totalSks}</Text>
          </View>
        </View>

        {/* Catatan Dosen */}
        {data.catatan && (
          <View style={styles.catatanBox}>
            <Text style={styles.catatanLabel}>Catatan dari Dosen:</Text>
            <Text style={styles.catatanText}>{data.catatan}</Text>
          </View>
        )}

        {/* Review Info */}
        {data.tanggal_pengajuan && data.dosen && (
          <View style={{ marginTop: 20 }}>
            <Text style={styles.reviewInfo}>
              Tanggal Review: {formatDate(data.tanggal_pengajuan)} | Dosen: {data.dosen.nama || 'John Doe'}
            </Text>
          </View>
        )}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Dokumen ini dihasilkan oleh Smart Academic Planner{'\n'}
            Fakultas Teknik Elektro - Telkom University{'\n'}
            Page 2 of 2
          </Text>
        </View>
      </Page>
    </Document>
  );
};

export default RencanaStudiPDF;
