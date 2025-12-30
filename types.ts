
export enum AppView {
  CHAT = 'CHAT',
  PRINTER_SPECS = 'PRINTER_SPECS',
  FIRMWARE = 'FIRMWARE',
  ERROR_CODES = 'ERROR_CODES',
  DRIVERS = 'DRIVERS',
  ACADEMY = 'ACADEMY',
  HISTORY = 'HISTORY',
  ABOUT = 'ABOUT'
}

export type LiveConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error';

export interface Attachment {
  mimeType: string;
  data: string;
}

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  type: 'text' | 'image' | 'audio' | 'invoice' | 'part_lookup';
  timestamp: Date;
  metadata?: {
    imageUrl?: string;
    audioUrl?: string;
  };
  attachments?: Attachment[];
}

export interface FaultRecord {
  id: string;
  title: string;
  cause: string;
  solution: string;
  estimatedTime: string;
  partsNeeded: string;
  timestamp: Date;
  imageUrl?: string;
}

export interface PrinterDetails {
  model_name: string;
  specs_markdown: string;
  toner_cartridge: string;
  print_speed: string;
  release_date: string;
  firmware_url?: string;
}

export interface LessonContent {
  videoId: string;
  summary: string;
  timestamps: { time: string; label: string }[];
  tools: string[];
  steps: string[];
  goldenTip: string;
  partDescription: string;
  partImageUrl?: string;
}

export type DeviceSegment = 'printers' | 'copiers' | 'scanners';

export interface MaintenancePart {
  id: string;
  name: string;
  icon: string;
  color: string;
  description: string;
}

export interface SegmentConfig {
  name: string;
  icon: string;
  themeColor: 'blue' | 'emerald' | 'indigo';
  brands: string[];
  categories: Record<string, string[]>;
  suggestions: Record<string, string[]>;
  parts: MaintenancePart[];
}

export const PRINTER_BRANDS = ['HP', 'Canon', 'Ricoh', 'Brother', 'Sharp', 'Konica Minolta', 'Kyocera', 'Epson', 'Samsung', 'Toshiba', 'Lexmark', 'Xerox', 'Fujitsu', 'Kodak'];

export const SEGMENTS_CONFIG: Record<DeviceSegment, SegmentConfig> = {
  printers: {
    name: 'طابعات',
    icon: '🖨️',
    themeColor: 'blue',
    brands: ['HP', 'Canon', 'Brother', 'Epson', 'Samsung', 'Lexmark', 'Xerox'],
    categories: {
      'HP': ['LaserJet Pro', 'LaserJet Enterprise'],
      'Canon': ['i-SENSYS', 'imageCLASS']
    },
    suggestions: {
      'HP': ['M402dn', 'M605dn', 'P1102w', 'M428fdw'],
      'Canon': ['MF3010', 'LBP6030w', 'G3411']
    },
    parts: [
      { id: 'laser', name: 'وحدة الليزر (Laser Unit)', icon: 'Scan', color: 'bg-yellow-500', description: 'صيانة العدسات وتنظيف المرايا.' },
      { id: 'fuser', name: 'وحدة السخان (Fuser)', icon: 'Flame', color: 'bg-orange-500', description: 'تغيير الفيلم وفحص الرول الحراري.' },
      { id: 'pickup', name: 'منظومة السحب', icon: 'Repeat', color: 'bg-emerald-500', description: 'بكرات السحب وحل مشاكل الانحشار.' },
      { id: 'toner', name: 'المحابر والدرام', icon: 'Droplets', color: 'bg-blue-500', description: 'تعبئة الحبر وصيانة وحدة التصوير.' }
    ]
  },
  copiers: {
    name: 'ماكينات تصوير',
    icon: '📑',
    themeColor: 'emerald',
    brands: ['Ricoh', 'Sharp', 'Konica Minolta', 'Kyocera'],
    categories: {},
    suggestions: {
      'Ricoh': ['MP 201', 'MP C3003', 'IM C2000'],
      'Sharp': ['MX-M264', 'AR-6020']
    },
    parts: [
      { id: 'dev', name: 'وحدة الديفيلوبر', icon: 'Box', color: 'bg-purple-600', description: 'ضبط كثافة الحبر وتغيير الديفيلوبر.' },
      { id: 'drum_unit', name: 'وحدة الدرام (Drum)', icon: 'Circle', color: 'bg-indigo-600', description: 'تنظيف الشفرات وتغيير الدرام الأصلي.' }
    ]
  },
  scanners: {
    name: 'ماسحات ضوئية',
    icon: '🖱️',
    themeColor: 'indigo',
    brands: ['Fujitsu', 'Canon', 'Epson'],
    categories: {},
    suggestions: {
      'Fujitsu': ['fi-7160', 'fi-8170'],
      'Epson': ['DS-530']
    },
    parts: [
      { id: 'adf', name: 'وحدة التغذية (ADF)', icon: 'Navigation', color: 'bg-blue-600', description: 'صيانة بكرات السحب الآلي.' }
    ]
  }
};

export const PRINTER_SERIES_SUGGESTIONS: Record<string, string[]> = {
  'HP': ['LaserJet M402dn', 'LaserJet M605dn', 'LaserJet Pro M428fdw', 'LaserJet P1102w'],
  'Canon': ['i-SENSYS MF3010', 'imageCLASS LBP6030w', 'MAXIFY G3411'],
  'Ricoh': ['MP 201', 'MP C3003', 'IM C2000', 'MP 2501'],
  'Sharp': ['MX-M264', 'AR-6020', 'MX-M315NV'],
  'Brother': ['HL-L2350DW', 'MFC-L2710DW', 'DCP-L2540DW']
};

// Added missing exports to fix component errors
export enum AspectRatio {
  SQUARE = 'SQUARE',
  POSTER = 'POSTER',
  LANDSCAPE = 'LANDSCAPE',
  WIDE = 'WIDE'
}

export enum PrintFormat {
  POSTER = 'POSTER',
  TSHIRT = 'TSHIRT',
  MUG = 'MUG',
  BUSINESS_CARD = 'BUSINESS_CARD'
}

export enum ProductType {
  TSHIRT = 'TSHIRT',
  HOODIE = 'HOODIE',
  POSTER = 'POSTER',
  MUG = 'MUG',
  NOTEBOOK = 'NOTEBOOK'
}

export enum ModelType {
  FLASH = 'FLASH',
  FLASH_THINKING = 'FLASH_THINKING',
  PRO = 'PRO'
}

export interface InvoiceItem {
  description: string;
  partNumber?: string;
  type: 'part' | 'service';
  cost: number;
}

export interface InvoiceData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  printerModel: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
}

export interface PartLookupData {
  partName: string;
  partNumber: string;
  compatibility: string[];
  price?: string;
}

export const COMMON_PARTS = [
  'وحدة السخان (Fuser Unit)',
  'الحصيرة (Transfer Belt)',
  'بكرات السحب (Pickup Rollers)',
  'وحدة الدرام (Drum Unit)',
  'عبوة الحبر (Toner Cartridge)',
  'وحدة الليزر (Laser Scanner)',
  'لوحة الفورماتر (Formatter Board)',
  'لوحة الباور (Power Supply Board)'
];
