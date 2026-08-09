export type ContentType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "sms"
  | "phone"
  | "location"
  | "event";

export type WifiEncryption = "WPA" | "WEP" | "nopass";

export interface WifiData {
  ssid: string;
  password: string;
  encryption: WifiEncryption;
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  jobTitle: string;
  website: string;
  street: string;
  city: string;
  country: string;
}

export interface EmailData {
  to: string;
  subject: string;
  body: string;
}

export interface SmsData {
  phone: string;
  message: string;
}

export interface LocationData {
  latitude: string;
  longitude: string;
  rawInput: string;
}

export interface EventData {
  title: string;
  location: string;
  startDate: string;
  startTime: string;
  endDate: string;
  endTime: string;
  description: string;
}

export type DotStyle =
  | "square"
  | "dots"
  | "rounded"
  | "extra-rounded"
  | "classy"
  | "classy-rounded";

export type CornerSquareStyle = "square" | "dot" | "extra-rounded";

export type CornerDotStyle = "square" | "dot";

export type ColorType = "single" | "gradient";
export type GradientType = "linear" | "radial";

export type ErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface QrStyleOptions {
  darkColor: string;
  lightColor: string;
  isTransparent: boolean;
  colorType: ColorType;
  gradientType: GradientType;
  gradientColor1: string;
  gradientColor2: string;
  gradientRotation: number;
  dotStyle: DotStyle;
  cornerSquareStyle: CornerSquareStyle;
  cornerDotStyle: CornerDotStyle;
  eyeFrameColor: string;
  eyeDotColor: string;
  useCustomEyeColors: boolean;
  errorCorrectionLevel: ErrorCorrectionLevel;
  size: number; // 256, 512, 1024, 2048
  logoSrc: string | null;
  logoSize: number; // 0.1 to 0.3
  logoMargin: number; // 0 to 10
  logoHideBackgroundDots: boolean;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  type: ContentType;
  title: string;
  payload: string;
  style: QrStyleOptions;
}

export interface PresetTemplate {
  id: string;
  name: string;
  description: string;
  type: ContentType;
  style: Partial<QrStyleOptions>;
  defaultData?: any;
}
