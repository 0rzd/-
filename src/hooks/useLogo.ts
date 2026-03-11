import { useState, useEffect } from 'react';

const LOGO_STORAGE_KEY = 'takatuf_logo';
const DEFAULT_LOGO = 'https://ui-avatars.com/api/?name=تكاتف&background=4f46e5&color=fff';

export function useLogo() {
  const [logo, setLogo] = useState<string>(DEFAULT_LOGO);

  useEffect(() => {
    const storedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
    if (storedLogo) {
      setLogo(storedLogo);
    }
    
    // Listen for changes from other tabs/components
    const handleStorageChange = () => {
      const updatedLogo = localStorage.getItem(LOGO_STORAGE_KEY);
      if (updatedLogo) {
        setLogo(updatedLogo);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    // Custom event for same-tab updates
    window.addEventListener('logo-updated', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logo-updated', handleStorageChange);
    };
  }, []);

  const updateLogo = (newLogoBase64: string) => {
    try {
      localStorage.setItem(LOGO_STORAGE_KEY, newLogoBase64);
      setLogo(newLogoBase64);
      window.dispatchEvent(new Event('logo-updated'));
    } catch (e) {
      console.error('Failed to save logo to localStorage (might be too large)', e);
      alert('حجم الصورة كبير جداً، يرجى اختيار صورة بحجم أصغر.');
    }
  };

  return { logo, updateLogo };
}
