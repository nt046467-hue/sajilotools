"use client";

import React, { useEffect, useState } from "react";
import {
  Link2,
  FileText,
  Wifi,
  User,
  Mail,
  MessageSquare,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import {
  ContentType,
  WifiData,
  VCardData,
  EmailData,
  SmsData,
  LocationData,
  EventData,
} from "./types";
import {
  serializeWifi,
  serializeVCard,
  serializeEmail,
  serializeSms,
  serializePhone,
  serializeGeo,
  serializeEvent,
  parseLocationInput,
} from "./qr-serializers";

interface QrPayloadFormProps {
  activeType: ContentType;
  onTypeChange: (type: ContentType) => void;
  onPayloadChange: (payload: string, isFormValid: boolean) => void;
  initialData?: any;
}

export default function QrPayloadForm({
  activeType,
  onTypeChange,
  onPayloadChange,
  initialData,
}: QrPayloadFormProps) {
  // Field state per content type
  const [url, setUrl] = useState(initialData?.url || "");
  const [text, setText] = useState(initialData?.text || "");

  const [wifi, setWifi] = useState<WifiData>({
    ssid: initialData?.ssid || "",
    password: initialData?.password || "",
    encryption: initialData?.encryption || "WPA",
    hidden: initialData?.hidden || false,
  });

  const [vcard, setVcard] = useState<VCardData>({
    firstName: initialData?.firstName || "",
    lastName: initialData?.lastName || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    organization: initialData?.organization || "",
    jobTitle: initialData?.jobTitle || "",
    website: initialData?.website || "",
    street: initialData?.street || "",
    city: initialData?.city || "",
    country: initialData?.country || "",
  });

  const [email, setEmail] = useState<EmailData>({
    to: initialData?.to || "",
    subject: initialData?.subject || "",
    body: initialData?.body || "",
  });

  const [sms, setSms] = useState<SmsData>({
    phone: initialData?.phone || "",
    message: initialData?.message || "",
  });

  const [phone, setPhone] = useState(initialData?.phone || "");

  const [location, setLocation] = useState<LocationData>({
    latitude: initialData?.latitude || "",
    longitude: initialData?.longitude || "",
    rawInput: initialData?.rawInput || "",
  });

  const [event, setEvent] = useState<EventData>({
    title: initialData?.title || "",
    location: initialData?.location || "",
    startDate: initialData?.startDate || "",
    startTime: initialData?.startTime || "10:00",
    endDate: initialData?.endDate || "",
    endTime: initialData?.endTime || "11:00",
    description: initialData?.description || "",
  });

  // Re-sync initialData if provided from presets or history restore
  useEffect(() => {
    if (initialData) {
      if (initialData.url !== undefined) setUrl(initialData.url);
      if (initialData.text !== undefined) setText(initialData.text);
      if (initialData.phone !== undefined) setPhone(initialData.phone);
      if (initialData.ssid !== undefined) setWifi((prev) => ({ ...prev, ...initialData }));
      if (
        initialData.firstName !== undefined ||
        initialData.lastName !== undefined ||
        initialData.email !== undefined ||
        initialData.organization !== undefined
      ) {
        setVcard((prev) => ({ ...prev, ...initialData }));
      }
      if (initialData.to !== undefined || initialData.subject !== undefined) {
        setEmail((prev) => ({ ...prev, ...initialData }));
      }
      if (initialData.message !== undefined || (initialData.phone !== undefined && activeType === "sms")) {
        setSms((prev) => ({ ...prev, ...initialData }));
      }
      if (initialData.latitude !== undefined || initialData.rawInput !== undefined) {
        setLocation((prev) => ({ ...prev, ...initialData }));
      }
      if (initialData.title !== undefined || initialData.startDate !== undefined) {
        setEvent((prev) => ({ ...prev, ...initialData }));
      }
    }
  }, [initialData, activeType]);

  // Compute current payload & validity
  useEffect(() => {
    let payload = "";
    let isValid = false;

    switch (activeType) {
      case "url": {
        const trimmed = url.trim();
        isValid = trimmed.length > 0;
        payload = trimmed;
        break;
      }
      case "text": {
        const trimmed = text.trim();
        isValid = trimmed.length > 0;
        payload = trimmed;
        break;
      }
      case "wifi": {
        isValid = wifi.ssid.trim().length > 0;
        payload = isValid ? serializeWifi(wifi) : "";
        break;
      }
      case "vcard": {
        const nameValid = vcard.firstName.trim().length > 0 || vcard.lastName.trim().length > 0;
        isValid = nameValid || vcard.phone.trim().length > 0 || vcard.organization.trim().length > 0;
        payload = isValid ? serializeVCard(vcard) : "";
        break;
      }
      case "email": {
        isValid = email.to.trim().length > 0;
        payload = isValid ? serializeEmail(email) : "";
        break;
      }
      case "sms": {
        isValid = sms.phone.trim().length > 0;
        payload = isValid ? serializeSms(sms) : "";
        break;
      }
      case "phone": {
        isValid = phone.trim().length > 0;
        payload = isValid ? serializePhone(phone) : "";
        break;
      }
      case "location": {
        const geoStr = serializeGeo(location);
        isValid = geoStr.length > 4; // e.g. "geo:x,y"
        payload = isValid ? geoStr : "";
        break;
      }
      case "event": {
        isValid = event.title.trim().length > 0 && event.startDate.length > 0;
        payload = isValid ? serializeEvent(event) : "";
        break;
      }
    }

    onPayloadChange(payload, isValid);
  }, [activeType, url, text, wifi, vcard, email, sms, phone, location, event, onPayloadChange]);

  const tabs: { type: ContentType; label: string; icon: React.ElementType }[] = [
    { type: "url", label: "URL", icon: Link2 },
    { type: "text", label: "Text", icon: FileText },
    { type: "wifi", label: "WiFi", icon: Wifi },
    { type: "vcard", label: "vCard", icon: User },
    { type: "email", label: "Email", icon: Mail },
    { type: "sms", label: "SMS", icon: MessageSquare },
    { type: "phone", label: "Phone", icon: Phone },
    { type: "location", label: "Location", icon: MapPin },
    { type: "event", label: "Event", icon: Calendar },
  ];

  return (
    <div className="space-y-4">
      {/* Type Selector Tabs */}
      <div>
        <label className="block text-xs font-bold text-[#71717A] dark:text-[#A1A1AA] uppercase tracking-wider mb-2">
          Select Content Type
        </label>
        <div className="flex flex-wrap gap-1.5 p-1.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeType === tab.type;
            return (
              <button
                key={tab.type}
                onClick={() => onTypeChange(tab.type)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? "bg-[#1F2544] text-white dark:bg-[#F5A623] dark:text-[#0C0F1E] shadow-sm"
                    : "text-[#71717A] dark:text-[#A1A1AA] hover:text-[#18181B] dark:hover:text-[#F4F4F5] hover:bg-black/5 dark:hover:bg-white/5"
                }`}
              >
                <Icon size={14} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Form Fields */}
      <div className="p-4 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-white dark:bg-[#141829] space-y-4">
        {/* URL Form */}
        {activeType === "url" && (
          <div>
            <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
              Website URL <span className="text-red-500">*</span>
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            />
          </div>
        )}

        {/* Text Form */}
        {activeType === "text" && (
          <div>
            <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
              Freeform Text <span className="text-red-500">*</span>
            </label>
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Enter text payload..."
              rows={4}
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 resize-none"
            />
          </div>
        )}

        {/* WiFi Form */}
        {activeType === "wifi" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
                Network SSID <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={wifi.ssid}
                onChange={(e) => setWifi({ ...wifi, ssid: e.target.value })}
                placeholder="e.g. Home_WiFi_5G"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
                Password
              </label>
              <input
                type="text"
                value={wifi.password}
                onChange={(e) => setWifi({ ...wifi, password: e.target.value })}
                placeholder="Network password"
                disabled={wifi.encryption === "nopass"}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 disabled:opacity-50"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
                Encryption Type
              </label>
              <select
                value={wifi.encryption}
                onChange={(e) =>
                  setWifi({ ...wifi, encryption: e.target.value as any })
                }
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP</option>
                <option value="nopass">None (Open Network)</option>
              </select>
            </div>
            <div className="sm:col-span-2 flex items-center gap-2">
              <input
                type="checkbox"
                id="hidden-wifi"
                checked={wifi.hidden}
                onChange={(e) => setWifi({ ...wifi, hidden: e.target.checked })}
                className="rounded border-[#E4E0D8] dark:border-[#2A2F48] text-[#F5A623] focus:ring-[#F5A623]/40 cursor-pointer"
              />
              <label htmlFor="hidden-wifi" className="text-xs text-[#18181B] dark:text-[#F4F4F5] cursor-pointer">
                Hidden SSID Network
              </label>
            </div>
          </div>
        )}

        {/* vCard Form */}
        {activeType === "vcard" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={vcard.firstName}
                onChange={(e) => setVcard({ ...vcard, firstName: e.target.value })}
                placeholder="First Name"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Last Name
              </label>
              <input
                type="text"
                value={vcard.lastName}
                onChange={(e) => setVcard({ ...vcard, lastName: e.target.value })}
                placeholder="Last Name"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={vcard.phone}
                onChange={(e) => setVcard({ ...vcard, phone: e.target.value })}
                placeholder="+977 9800000000"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={vcard.email}
                onChange={(e) => setVcard({ ...vcard, email: e.target.value })}
                placeholder="contact@company.com"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Organization / Company
              </label>
              <input
                type="text"
                value={vcard.organization}
                onChange={(e) => setVcard({ ...vcard, organization: e.target.value })}
                placeholder="Company Name"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Job Title
              </label>
              <input
                type="text"
                value={vcard.jobTitle}
                onChange={(e) => setVcard({ ...vcard, jobTitle: e.target.value })}
                placeholder="e.g. Founder & Engineer"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Website
              </label>
              <input
                type="url"
                value={vcard.website}
                onChange={(e) => setVcard({ ...vcard, website: e.target.value })}
                placeholder="https://example.com"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
          </div>
        )}

        {/* Email Form */}
        {activeType === "email" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
                Recipient Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={email.to}
                onChange={(e) => setEmail({ ...email, to: e.target.value })}
                placeholder="user@example.com"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
                Subject Line
              </label>
              <input
                type="text"
                value={email.subject}
                onChange={(e) => setEmail({ ...email, subject: e.target.value })}
                placeholder="Inquiry from QR Code"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
                Message Body
              </label>
              <textarea
                value={email.body}
                onChange={(e) => setEmail({ ...email, body: e.target.value })}
                placeholder="Prefilled message content..."
                rows={3}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] resize-none"
              />
            </div>
          </div>
        )}

        {/* SMS Form */}
        {activeType === "sms" && (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
                Recipient Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={sms.phone}
                onChange={(e) => setSms({ ...sms, phone: e.target.value })}
                placeholder="+977 9800000000"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
                Prefilled SMS Text
              </label>
              <textarea
                value={sms.message}
                onChange={(e) => setSms({ ...sms, message: e.target.value })}
                placeholder="SMS message text..."
                rows={3}
                className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5] resize-none"
              />
            </div>
          </div>
        )}

        {/* Phone Call Form */}
        {activeType === "phone" && (
          <div>
            <label className="block text-xs font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1.5">
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+977 9800000000"
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-sm text-[#18181B] dark:text-[#F4F4F5]"
            />
          </div>
        )}

        {/* Location Form */}
        {activeType === "location" && (
          <div className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1 flex items-center justify-between">
                <span>Paste Google Maps Link or Coords</span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-normal">Auto-parses @lat,lng</span>
              </label>
              <input
                type="text"
                value={location.rawInput}
                onChange={(e) => {
                  const val = e.target.value;
                  const parsed = parseLocationInput(val);
                  setLocation({
                    rawInput: val,
                    latitude: parsed.lat || location.latitude,
                    longitude: parsed.lng || location.longitude,
                  });
                }}
                placeholder="https://maps.google.com/?q=27.7172,85.3240 or 27.7172, 85.3240"
                className="w-full px-3.5 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                  Latitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location.latitude}
                  onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                  placeholder="27.7172"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
                />
              </div>
              <div>
                <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                  Longitude <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={location.longitude}
                  onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                  placeholder="85.3240"
                  className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
                />
              </div>
            </div>
          </div>
        )}

        {/* Event Form */}
        {activeType === "event" && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Event Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={event.title}
                onChange={(e) => setEvent({ ...event, title: e.target.value })}
                placeholder="Product Launch / Tech Meetup"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Start Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={event.startDate}
                onChange={(e) => setEvent({ ...event, startDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Start Time
              </label>
              <input
                type="time"
                value={event.startTime}
                onChange={(e) => setEvent({ ...event, startTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                End Date
              </label>
              <input
                type="date"
                value={event.endDate}
                onChange={(e) => setEvent({ ...event, endDate: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div>
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                End Time
              </label>
              <input
                type="time"
                value={event.endTime}
                onChange={(e) => setEvent({ ...event, endTime: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block font-semibold text-[#18181B] dark:text-[#F4F4F5] mb-1">
                Location / Venue
              </label>
              <input
                type="text"
                value={event.location}
                onChange={(e) => setEvent({ ...event, location: e.target.value })}
                placeholder="Hall 2, City Center, Kathmandu"
                className="w-full px-3 py-2 rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs text-[#18181B] dark:text-[#F4F4F5]"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
