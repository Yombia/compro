import { createContext, useContext, useState, useEffect } from 'react';

// 1. Buat Context
const ThemeContext = createContext();

// 2. Buat Provider (Komponen Pembungkus)
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // Cek tema dari localStorage atau preferensi sistem
    if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      return 'dark';
    }
    return 'light';
  });

  // 3. Effect untuk mengubah class di <html> dan simpan ke localStorage
  useEffect(() => {
    const root = window.document.documentElement; // Ini adalah tag <html>
    
    // Hapus class lama, tambahkan class baru (theme)
    root.classList.remove('light', 'dark');
    root.classList.add(theme);

    // Simpan pilihan user
    localStorage.setItem('theme', theme);
  }, [theme]); // Dijalankan setiap 'theme' berubah

  // 4. Fungsi untuk ganti tema
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

// 5. Hook kustom agar gampang dipakai di komponen lain
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};