/**
 * Tarihleri formatlamak ve işlemek için yardımcı fonksiyonlar
 */

/**
 * ISO tarih formatını (YYYY-MM-DD) veya ISO datetime formatını (YYYY-MM-DDTHH:MM:SS.sssZ)
 * kullanıcı dostu bir formata dönüştürür
 */
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  
  // Geçersiz tarih kontrolü
  if (isNaN(date.getTime())) {
    return 'Geçersiz tarih';
  }
  
  // Bugün, dün ve yarın için özel mesajlar
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);
  
  // Tarih kısmını kontrol et
  if (dateOnly.getTime() === today.getTime()) {
    // Bugün
    return `Bugün${formatTime(date)}`;
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    // Yarın
    return `Yarın${formatTime(date)}`;
  } else if (dateOnly.getTime() === yesterday.getTime()) {
    // Dün
    return `Dün${formatTime(date)}`;
  }
  
  // Bu hafta içinde mi?
  const dayDiff = Math.floor((dateOnly.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (dayDiff > -7 && dayDiff < 7) {
    const dayNames = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];
    return `${dayNames[date.getDay()]}${formatTime(date)}`;
  }
  
  // Diğer tarihler için standart format
  return `${date.getDate()} ${getMonthName(date.getMonth())} ${date.getFullYear()}${formatTime(date)}`;
};

/**
 * Saat bilgisini formatlayarak döndürür, sadece saat bilgisi varsa
 */
const formatTime = (date: Date): string => {
  // Eğer saat, dakika ve saniye hepsi 0 ise, bu muhtemelen sadece tarih verisidir
  if (date.getHours() === 0 && date.getMinutes() === 0 && date.getSeconds() === 0) {
    return '';
  }
  
  // Saat bilgisi varsa formatla
  return `, ${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
};

/**
 * Ay numarasından Türkçe ay adını döndürür
 */
const getMonthName = (monthIndex: number): string => {
  const monthNames = [
    'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran',
    'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
  ];
  return monthNames[monthIndex];
};

/**
 * İki tarih arasındaki farkı gün cinsinden hesaplar
 */
export const getDaysDifference = (date1: string, date2: string): number => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  
  // Tarih kısmını al, saat bilgisini sıfırla
  d1.setHours(0, 0, 0, 0);
  d2.setHours(0, 0, 0, 0);
  
  // Milisaniye farkını gün cinsine çevir
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
};

/**
 * Verilen tarihten bugüne kadar geçen gün sayısını hesaplar
 */
export const getDaysFromToday = (dateString: string): number => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return getDaysDifference(today.toISOString(), dateString);
};

/**
 * Verilen tarih bugünden geçmişte mi kontrol eder
 */
export const isDatePast = (dateString: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  
  return date < today;
};

/**
 * Bugünün tarihini YYYY-MM-DD formatında döndürür
 */
export const getTodayFormatted = (): string => {
  const today = new Date();
  return `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
}; 