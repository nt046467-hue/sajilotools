import {
  WifiData,
  VCardData,
  EmailData,
  SmsData,
  LocationData,
  EventData,
} from "./types";

/**
 * Serialize WiFi connection string according to QR code standard:
 * WIFI:T:WPA;S:ssid;P:password;H:true;;
 */
export function serializeWifi(data: WifiData): string {
  const ssid = escapeWifiField(data.ssid);
  const pass = escapeWifiField(data.password);
  const enc = data.encryption || "WPA";
  const hidden = data.hidden ? "true" : "false";

  if (enc === "nopass") {
    return `WIFI:T:nopass;S:${ssid};H:${hidden};;`;
  }
  return `WIFI:T:${enc};S:${ssid};P:${pass};H:${hidden};;`;
}

function escapeWifiField(str: string): string {
  return str.replace(/\\/g, "\\\\").replace(/;/g, "\\;").replace(/:/g, "\\:").replace(/,/g, "\\,");
}

/**
 * Serialize vCard 3.0 string
 */
export function serializeVCard(data: VCardData): string {
  const fullName = `${data.firstName} ${data.lastName}`.trim();
  const lines: string[] = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${data.lastName};${data.firstName};;;`,
    `FN:${fullName || "Contact"}`,
  ];

  if (data.organization) lines.push(`ORG:${data.organization}`);
  if (data.jobTitle) lines.push(`TITLE:${data.jobTitle}`);
  if (data.phone) lines.push(`TEL;TYPE=CELL:${data.phone}`);
  if (data.email) lines.push(`EMAIL;TYPE=INTERNET:${data.email}`);
  if (data.website) {
    const web = data.website.startsWith("http") ? data.website : `https://${data.website}`;
    lines.push(`URL:${web}`);
  }
  if (data.street || data.city || data.country) {
    lines.push(`ADR;TYPE=WORK:;;${data.street};${data.city};;;${data.country}`);
  }

  lines.push("END:VCARD");
  return lines.join("\n");
}

/**
 * Serialize mailto link
 */
export function serializeEmail(data: EmailData): string {
  const params: string[] = [];
  if (data.subject) params.push(`subject=${encodeURIComponent(data.subject)}`);
  if (data.body) params.push(`body=${encodeURIComponent(data.body)}`);

  const query = params.length > 0 ? `?${params.join("&")}` : "";
  return `mailto:${data.to.trim()}${query}`;
}

/**
 * Serialize SMSTO link
 */
export function serializeSms(data: SmsData): string {
  const phone = data.phone.trim();
  if (data.message) {
    return `SMSTO:${phone}:${data.message}`;
  }
  return `SMSTO:${phone}`;
}

/**
 * Serialize tel link
 */
export function serializePhone(phone: string): string {
  return `tel:${phone.trim()}`;
}

/**
 * Parse Google Maps link or coordinates into lat, lng
 */
export function parseLocationInput(input: string): { lat: string; lng: string } {
  const trimmed = input.trim();
  
  // Pattern 1: Direct lat, lng e.g. "27.7172, 85.3240" or "27.7172,85.3240"
  const directMatch = trimmed.match(/^(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)$/);
  if (directMatch) {
    return { lat: directMatch[1], lng: directMatch[3] };
  }

  // Pattern 2: Google maps URL with @lat,lng e.g. https://www.google.com/maps/@27.71724,85.32401,15z
  const gmapsAtMatch = trimmed.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (gmapsAtMatch) {
    return { lat: gmapsAtMatch[1], lng: gmapsAtMatch[2] };
  }

  // Pattern 3: Google maps query q=lat,lng or ll=lat,lng
  const gmapsQueryMatch = trimmed.match(/[?&](q|ll)=(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (gmapsQueryMatch) {
    return { lat: gmapsQueryMatch[2], lng: gmapsQueryMatch[3] };
  }

  return { lat: "", lng: "" };
}

export function serializeGeo(data: LocationData): string {
  if (data.rawInput) {
    const parsed = parseLocationInput(data.rawInput);
    if (parsed.lat && parsed.lng) {
      return `geo:${parsed.lat},${parsed.lng}`;
    }
  }
  if (data.latitude && data.longitude) {
    return `geo:${data.latitude.trim()},${data.longitude.trim()}`;
  }
  return "";
}

/**
 * Serialize iCal VEVENT string
 */
export function serializeEvent(data: EventData): string {
  const formatDateTime = (dateStr: string, timeStr: string): string => {
    if (!dateStr) return "";
    const cleanDate = dateStr.replace(/-/g, "");
    const cleanTime = (timeStr || "00:00").replace(/:/g, "") + "00";
    return `${cleanDate}T${cleanTime}`;
  };

  const dtStart = formatDateTime(data.startDate, data.startTime);
  const dtEnd = formatDateTime(data.endDate, data.endTime) || dtStart;

  const lines: string[] = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//SajiloTools//QR Code Generator//EN",
    "BEGIN:VEVENT",
    `SUMMARY:${data.title || "Event"}`,
  ];

  if (dtStart) lines.push(`DTSTART:${dtStart}`);
  if (dtEnd) lines.push(`DTEND:${dtEnd}`);
  if (data.location) lines.push(`LOCATION:${data.location}`);
  if (data.description) lines.push(`DESCRIPTION:${data.description.replace(/\n/g, "\\n")}`);

  lines.push("END:VEVENT");
  lines.push("END:VCALENDAR");

  return lines.join("\n");
}

/**
 * Luminance & Contrast helper
 */
export function calculateLuminance(hex: string): number {
  const cleanHex = hex.replace("#", "");
  if (cleanHex.length !== 6) return 128;
  const r = parseInt(cleanHex.slice(0, 2), 16);
  const g = parseInt(cleanHex.slice(2, 4), 16);
  const b = parseInt(cleanHex.slice(4, 6), 16);
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

export function checkContrast(fgHex: string, bgHex: string, isTransparent: boolean): {
  diff: number;
  isLowContrast: boolean;
  message: string;
} {
  if (isTransparent) {
    return {
      diff: 255,
      isLowContrast: false,
      message: "Transparent background enabled. Ensure final placement surface has high contrast.",
    };
  }

  const fgLum = calculateLuminance(fgHex);
  const bgLum = calculateLuminance(bgHex);
  const diff = Math.abs(fgLum - bgLum);

  const isLowContrast = diff < 100;
  let message = "Good contrast ratio for camera scanners.";
  if (diff < 60) {
    message = "Very low contrast! Most cameras will fail to scan this code.";
  } else if (diff < 100) {
    message = "Sub-optimal contrast. Test with a phone camera before printing.";
  }

  return { diff, isLowContrast, message };
}
