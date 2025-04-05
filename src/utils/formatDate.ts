import { format, formatDistance, formatRelative, differenceInDays } from 'date-fns';
import { tr } from 'date-fns/locale';

// Standart tarih formatı
export const formatDate = (dateString: string | null): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  return format(date, 'dd MMM yyyy', { locale: tr });
};

// Şimdiki zamana göre ne kadar zaman geçtiğini gösteren format
export const formatDistanceToNow = (dateString: string): string => {
  const date = new Date(dateString);
  return formatDistance(date, new Date(), { addSuffix: false, locale: tr });
};

// Duruma göre farklı formatlar kullanır
export const formatSmartDate = (dateString: string | null): string => {
  if (!dateString) return '';
  
  const date = new Date(dateString);
  const now = new Date();
  const dayDiff = differenceInDays(now, date);
  
  // Bugün içinde ise saat göster
  if (dayDiff < 1) {
    return format(date, 'HH:mm', { locale: tr });
  }
  
  // Son 7 gün içinde ise göreceli tarih göster
  if (dayDiff < 7) {
    return formatRelative(date, now, { locale: tr });
  }
  
  // Diğer durumlarda standart tarih formatı
  return format(date, 'dd MMM yyyy', { locale: tr });
}; 