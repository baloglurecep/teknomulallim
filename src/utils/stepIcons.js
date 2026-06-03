export const DEFAULT_STEP_ICON = '⚙️';

export const STEP_ICONS = [
  { id: 'gear', emoji: '⚙️', label: 'Dişli' },
  { id: 'chip', emoji: '🔌', label: 'Elektronik' },
  { id: 'cpu', emoji: '💻', label: 'Yazılım' },
  { id: 'wifi', emoji: '📡', label: 'IoT / Kablosuz' },
  { id: 'robot', emoji: '🤖', label: 'Robotik' },
  { id: 'bulb', emoji: '💡', label: 'Fikir' },
  { id: 'rocket', emoji: '🚀', label: 'Lansman' },
  { id: 'chart', emoji: '📊', label: 'Analiz' },
  { id: 'book', emoji: '📚', label: 'Eğitim' },
  { id: 'teacher', emoji: '👨‍🏫', label: 'Öğretmen' },
  { id: 'student', emoji: '🎓', label: 'Öğrenci' },
  { id: 'phone', emoji: '📱', label: 'Mobil Uygulama' },
  { id: 'cloud', emoji: '☁️', label: 'Bulut' },
  { id: 'lock', emoji: '🔒', label: 'Güvenlik' },
  { id: 'check', emoji: '✅', label: 'Tamamlandı' },
  { id: 'tool', emoji: '🔧', label: 'Montaj' },
  { id: 'circuit', emoji: '⚡', label: 'Güç / Enerji' },
  { id: 'lab', emoji: '🧪', label: 'Ar-Ge' },
  { id: 'target', emoji: '🎯', label: 'Hedef' },
  { id: 'pin', emoji: '📍', label: 'Konum' },
  { id: 'calendar', emoji: '📅', label: 'Takvim' },
  { id: 'bell', emoji: '🔔', label: 'Bildirim' },
  { id: 'camera', emoji: '📷', label: 'Görüntü' },
  { id: 'code', emoji: '👨‍💻', label: 'Kodlama' },
];

export function isKnownStepIcon(icon) {
  return STEP_ICONS.some((item) => item.emoji === icon);
}
