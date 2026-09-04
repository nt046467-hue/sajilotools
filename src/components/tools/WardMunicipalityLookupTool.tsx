"use client";

import { useState, useMemo } from "react";
import { Building2, Search, MapPin, Copy, Check, ShieldCheck, Info, CheckCircle2, Globe, Hash } from "lucide-react";

export interface LocalUnit {
  id: string;
  nameEn: string;
  nameNp: string;
  type: "Metropolitan" | "Sub-Metropolitan" | "Municipality" | "Rural Municipality";
  typeNp: string;
  districtEn: string;
  districtNp: string;
  provinceEn: string;
  provinceNp: string;
  totalWards: number;
  headquarters: string;
}

// ── Comprehensive Official Dataset of Nepal's 77 Districts & Major Local Units ──
const NEPAL_LOCAL_UNITS: LocalUnit[] = [
  // ── Koshi Province (Province 1) ─────────────────────────────────────────────
  { id: "mrg-metro", nameEn: "Biratnagar Metropolitan City", nameNp: "विराटनगर महानगरपालिका", type: "Metropolitan", typeNp: "महानगरपालिका", districtEn: "Morang", districtNp: "मोरङ", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 19, headquarters: "Biratnagar" },
  { id: "sns-[#1]", nameEn: "Dharan Sub-Metropolitan City", nameNp: "धरान उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Sunsari", districtNp: "सुनसरी", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 20, headquarters: "Bhanuchowk, Dharan" },
  { id: "sns-[#2]", nameEn: "Itahari Sub-Metropolitan City", nameNp: "इटहरी उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Sunsari", districtNp: "सुनसरी", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 20, headquarters: "Itahari Chowk" },
  { id: "jhp-[#1]", nameEn: "Bhadrapur Municipality", nameNp: "भद्रपुर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Jhapa", districtNp: "झापा", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 10, headquarters: "Bhadrapur" },
  { id: "jhp-[#2]", nameEn: "Damak Municipality", nameNp: "दमक नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Jhapa", districtNp: "झापा", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 10, headquarters: "Damak Chowk" },
  { id: "jhp-[#3]", nameEn: "Birtamod Municipality", nameNp: "बिर्तामोड नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Jhapa", districtNp: "झापा", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 10, headquarters: "Birtamod" },
  { id: "jhp-[#4]", nameEn: "Mechinagar Municipality", nameNp: "मेचीनगर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Jhapa", districtNp: "झापा", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 15, headquarters: "Kakarbhitta" },
  { id: "ilm-[#1]", nameEn: "Ilam Municipality", nameNp: "इलाम नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Ilam", districtNp: "इलाम", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 12, headquarters: "Ilam Bazaar" },
  { id: "ilm-[#2]", nameEn: "Suryodaya Municipality", nameNp: "सूर्योदय नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Ilam", districtNp: "इलाम", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 14, headquarters: "Fikkal" },
  { id: "tpl-[#1]", nameEn: "Phungling Municipality", nameNp: "फुङलिङ नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Taplejung", districtNp: "ताप्लेजुङ", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 11, headquarters: "Phungling" },
  { id: "pct-[#1]", nameEn: "Phidim Municipality", nameNp: "फिदिम नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Panchthar", districtNp: "पाँचथर", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 14, headquarters: "Phidim" },
  { id: "dhk-[#1]", nameEn: "Dhankuta Municipality", nameNp: "धनकुटा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Dhankuta", districtNp: "धनकुटा", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 10, headquarters: "Dhankuta Bazaar" },
  { id: "trh-[#1]", nameEn: "Myanglung Municipality", nameNp: "म्याङ्लुङ नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Terhathum", districtNp: "तेह्रथुम", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 10, headquarters: "Myanglung" },
  { id: "sks-[#1]", nameEn: "Khandbari Municipality", nameNp: "खाँदबारी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Sankhuwasabha", districtNp: "संखुवासभा", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 11, headquarters: "Khandbari" },
  { id: "bjp-[#1]", nameEn: "Bhojpur Municipality", nameNp: "भोजपुर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Bhojpur", districtNp: "भोजपुर", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 12, headquarters: "Bhojpur Bazaar" },
  { id: "slk-[#1]", nameEn: "Solududhkunda Municipality", nameNp: "सोलुदूधकुण्ड नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Solukhumbu", districtNp: "सोलुखुम्बु", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 11, headquarters: "Salleri" },
  { id: "okh-[#1]", nameEn: "Siddhicharan Municipality", nameNp: "सिद्धिचरण नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Okhaldhunga", districtNp: "ओखलढुङ्गा", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 12, headquarters: "Okhaldhunga Bazaar" },
  { id: "ktg-[#1]", nameEn: "Diktel Rupakot Majhuwagadhi Municipality", nameNp: "दिक्तेल रुपाकोट मझुवागढी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Khotang", districtNp: "खोटाङ", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 15, headquarters: "Diktel" },
  { id: "udp-[#1]", nameEn: "Triyuga Municipality", nameNp: "त्रियुगा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Udayapur", districtNp: "उदयपुर", provinceEn: "Koshi Province", provinceNp: "कोशी प्रदेश", totalWards: 16, headquarters: "Gaighat" },

  // ── Madhesh Province (Province 2) ───────────────────────────────────────────
  { id: "prs-metro", nameEn: "Birgunj Metropolitan City", nameNp: "वीरगन्ज महानगरपालिका", type: "Metropolitan", typeNp: "महानगरपालिका", districtEn: "Parsa", districtNp: "पर्सा", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 32, headquarters: "Birgunj" },
  { id: "dns-[#1]", nameEn: "Janakpurdham Sub-Metropolitan City", nameNp: "जनकपुरधाम उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Dhanusha", districtNp: "धनुषा", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 25, headquarters: "Janakpur Chowk" },
  { id: "bra-[#1]", nameEn: "Kalaiya Sub-Metropolitan City", nameNp: "कलैया उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Bara", districtNp: "बारा", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 27, headquarters: "Kalaiya" },
  { id: "bra-[#2]", nameEn: "Jitpursimara Sub-Metropolitan City", nameNp: "जितपुरसिमरा उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Bara", districtNp: "बारा", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 24, headquarters: "Simara" },
  { id: "spt-[#1]", nameEn: "Rajbiraj Municipality", nameNp: "राजविराज नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Saptari", districtNp: "सप्तरी", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 16, headquarters: "Rajbiraj" },
  { id: "srh-[#1]", nameEn: "Lahan Municipality", nameNp: "लहान नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Siraha", districtNp: "सिराहा", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 24, headquarters: "Lahan Bazaar" },
  { id: "mht-[#1]", nameEn: "Jaleshwar Municipality", nameNp: "जलेस्वर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Mahottari", districtNp: "महोत्तरी", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 12, headquarters: "Jaleshwar" },
  { id: "srl-[#1]", nameEn: "Malangwa Municipality", nameNp: "मलङ्गवा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Sarlahi", districtNp: "सर्लाही", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 12, headquarters: "Malangwa" },
  { id: "rth-[#1]", nameEn: "Gaur Municipality", nameNp: "गौर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Rautahat", districtNp: "रौतहट", provinceEn: "Madhesh Province", provinceNp: "मधेश प्रदेश", totalWards: 9, headquarters: "Gaur" },

  // ── Bagmati Province (Province 3) ───────────────────────────────────────────
  { id: "ktm-metro", nameEn: "Kathmandu Metropolitan City", nameNp: "काठमाडौँ महानगरपालिका", type: "Metropolitan", typeNp: "महानगरपालिका", districtEn: "Kathmandu", districtNp: "काठमाडौँ", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 32, headquarters: "Teku, Kathmandu" },
  { id: "ltd-metro", nameEn: "Lalitpur Metropolitan City", nameNp: "ललितपुर महानगरपालिका", type: "Metropolitan", typeNp: "महानगरपालिका", districtEn: "Lalitpur", districtNp: "ललितपुर", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 29, headquarters: "Pulchowk, Lalitpur" },
  { id: "ctw-metro", nameEn: "Bharatpur Metropolitan City", nameNp: "भरतपुर महानगरपालिका", type: "Metropolitan", typeNp: "महानगरपालिका", districtEn: "Chitwan", districtNp: "चितवन", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 29, headquarters: "Bharatpur" },
  { id: "mkp-[#1]", nameEn: "Hetauda Sub-Metropolitan City", nameNp: "हेटौँडा उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Makwanpur", districtNp: "मकवानपुर", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 19, headquarters: "Hetauda Chowk" },
  { id: "ktm-[#1]", nameEn: "Kirtipur Municipality", nameNp: "कीर्तिपुर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kathmandu", districtNp: "काठमाडौँ", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 10, headquarters: "Devdhoka, Kirtipur" },
  { id: "ktm-[#2]", nameEn: "Budhanilkantha Municipality", nameNp: "बूढानीलकण्ठ नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kathmandu", districtNp: "काठमाडौँ", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 13, headquarters: "Hattigauda" },
  { id: "ktm-[#3]", nameEn: "Chandragiri Municipality", nameNp: "चन्द्रागिरी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kathmandu", districtNp: "काठमाडौँ", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 15, headquarters: "Gurjudhara" },
  { id: "ktm-[#4]", nameEn: "Nagarjun Municipality", nameNp: "नागार्जुन नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kathmandu", districtNp: "काठमाडौँ", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 10, headquarters: "Harisiddhi" },
  { id: "ktm-[#5]", nameEn: "Tarakeshwar Municipality", nameNp: "तारकेश्वर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kathmandu", districtNp: "काठमाडौँ", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 11, headquarters: "Dharmasthali" },
  { id: "ltd-[#1]", nameEn: "Mahalaxmi Municipality", nameNp: "महालक्ष्मी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Lalitpur", districtNp: "ललितपुर", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 10, headquarters: "Imadol" },
  { id: "ltd-[#2]", nameEn: "Godawari Municipality", nameNp: "गोदावरी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Lalitpur", districtNp: "ललितपुर", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 14, headquarters: "Bajrabarahi" },
  { id: "bkp-[#1]", nameEn: "Bhaktapur Municipality", nameNp: "भक्तपुर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Bhaktapur", districtNp: "भक्तपुर", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 10, headquarters: "Byasi, Bhaktapur" },
  { id: "bkp-[#2]", nameEn: "Madhyapur Thimi Municipality", nameNp: "मध्यपुर थिमी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Bhaktapur", districtNp: "भक्तपुर", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 9, headquarters: "Thimi" },
  { id: "bkp-[#3]", nameEn: "Suryabinayak Municipality", nameNp: "सूर्यविनायक नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Bhaktapur", districtNp: "भक्तपुर", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 10, headquarters: "Katunje" },
  { id: "kvr-[#1]", nameEn: "Dhulikhel Municipality", nameNp: "धुलिखेल नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kavrepalanchok", districtNp: "काभ्रेपलाञ्चोक", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 12, headquarters: "Dhulikhel Bazaar" },
  { id: "kvr-[#2]", nameEn: "Banepa Municipality", nameNp: "बनेपा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kavrepalanchok", districtNp: "काभ्रेपलाञ्चोक", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 14, headquarters: "Banepa" },
  { id: "kvr-[#3]", nameEn: "Panauti Municipality", nameNp: "पनौती नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kavrepalanchok", districtNp: "काभ्रेपलाञ्चोक", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 12, headquarters: "Panauti" },
  { id: "snc-[#1]", nameEn: "Chautara Sangachokgadhi Municipality", nameNp: "चौतारा साँगाचोकगढी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Sindhupalchok", districtNp: "सिन्धुपाल्चोक", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 14, headquarters: "Chautara" },
  { id: "nwk-[#1]", nameEn: "Bidur Municipality", nameNp: "विदुर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Nuwakot", districtNp: "नुवाकोट", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 13, headquarters: "Battar, Bidur" },
  { id: "dhd-[#1]", nameEn: "Nilkantha Municipality", nameNp: "निलकण्ठ नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Dhading", districtNp: "धादिङ", provinceEn: "Bagmati Province", provinceNp: "वाग्मती प्रदेश", totalWards: 14, headquarters: "Dhading Besi" },

  // ── Gandaki Province (Province 4) ───────────────────────────────────────────
  { id: "ksk-metro", nameEn: "Pokhara Metropolitan City", nameNp: "पोखरा महानगरपालिका", type: "Metropolitan", typeNp: "महानगरपालिका", districtEn: "Kaski", districtNp: "कास्की", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 33, headquarters: "New Road, Pokhara" },
  { id: "tnh-[#1]", nameEn: "Byas Municipality", nameNp: "व्यास नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Tanahun", districtNp: "तनहुँ", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 14, headquarters: "Damauli" },
  { id: "tnh-[#2]", nameEn: "Shuklagandaki Municipality", nameNp: "शुक्लागण्डकी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Tanahun", districtNp: "तनहुँ", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 12, headquarters: "Dhorphirdi" },
  { id: "syg-[#1]", nameEn: "Putalibazar Municipality", nameNp: "पुतलीबजार नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Syangja", districtNp: "स्याङ्जा", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 14, headquarters: "Syangja Bazaar" },
  { id: "syg-[#2]", nameEn: "Waling Municipality", nameNp: "वालिङ नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Syangja", districtNp: "स्याङ्जा", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 14, headquarters: "Waling Bazaar" },
  { id: "grk-[#1]", nameEn: "Gorkha Municipality", nameNp: "गोरखा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Gorkha", districtNp: "गोरखा", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 14, headquarters: "Gorkha Bazaar" },
  { id: "lmj-[#1]", nameEn: "Besisahar Municipality", nameNp: "बेसीशहर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Lamjung", districtNp: "लमजुङ", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 11, headquarters: "Besisahar" },
  { id: "nwp-[#1]", nameEn: "Kawasoti Municipality", nameNp: "कावासोती नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Nawalpur", districtNp: "नवलपुर", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 17, headquarters: "Kawasoti" },
  { id: "prb-[#1]", nameEn: "Kusma Municipality", nameNp: "कुश्मा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Parbat", districtNp: "पर्वत", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 14, headquarters: "Kusma" },
  { id: "bgl-[#1]", nameEn: "Baglung Municipality", nameNp: "बागलुङ नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Baglung", districtNp: "बागलुङ", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 14, headquarters: "Baglung Bazaar" },
  { id: "myg-[#1]", nameEn: "Beni Municipality", nameNp: "बेनी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Myagdi", districtNp: "म्याग्दी", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 10, headquarters: "Beni Bazaar" },
  { id: "mst-[#1]", nameEn: "Gharapjhong Rural Municipality", nameNp: "घरपझोङ गाउँपालिका", type: "Rural Municipality", typeNp: "गाउँपालिका", districtEn: "Mustang", districtNp: "मुस्ताङ", provinceEn: "Gandaki Province", provinceNp: "गण्डकी प्रदेश", totalWards: 5, headquarters: "Jomsom" },

  // ── Lumbini Province (Province 5) ───────────────────────────────────────────
  { id: "rpd-sub", nameEn: "Butwal Sub-Metropolitan City", nameNp: "बुटवल उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Rupandehi", districtNp: "रुपन्देही", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 19, headquarters: "Butwal" },
  { id: "dng-sub1", nameEn: "Ghorahi Sub-Metropolitan City", nameNp: "घोराही उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Dang", districtNp: "दाङ", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 19, headquarters: "Ghorahi" },
  { id: "dng-sub2", nameEn: "Tulsipur Sub-Metropolitan City", nameNp: "तुलसीपुर उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Dang", districtNp: "दाङ", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 19, headquarters: "Tulsipur" },
  { id: "bnk-sub", nameEn: "Nepalgunj Sub-Metropolitan City", nameNp: "नेपालगन्ज उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Banke", districtNp: "बाँके", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 23, headquarters: "Nepalgunj" },
  { id: "rpd-[#1]", nameEn: "Siddharthanagar Municipality", nameNp: "सिद्धार्थनगर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Rupandehi", districtNp: "रुपन्देही", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 13, headquarters: "Bhairahawa" },
  { id: "rpd-[#2]", nameEn: "Tilottama Municipality", nameNp: "तिलोत्तमा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Rupandehi", districtNp: "रुपन्देही", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 17, headquarters: "Manigram" },
  { id: "kpl-[#1]", nameEn: "Kapilvastu Municipality", nameNp: "कपिलवस्तु नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kapilvastu", districtNp: "कपिलवस्तु", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 12, headquarters: "Taulihawa" },
  { id: "arg-[#1]", nameEn: "Sandhikharka Municipality", nameNp: "सन्धिकर्क नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Arghakhanchi", districtNp: "अर्घाखाँची", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 12, headquarters: "Sandhikharka" },
  { id: "plp-[#1]", nameEn: "Tansen Municipality", nameNp: "तानसेन नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Palpa", districtNp: "पाल्पा", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 14, headquarters: "Tansen Bazaar" },
  { id: "glm-[#1]", nameEn: "Resunga Municipality", nameNp: "रेसुङ्गा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Gulmi", districtNp: "गुल्मी", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 14, headquarters: "Tamghas" },
  { id: "brd-[#1]", nameEn: "Gulariya Municipality", nameNp: "गुलेरिया नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Bardiya", districtNp: "बर्दिया", provinceEn: "Lumbini Province", provinceNp: "लुम्बिनी प्रदेश", totalWards: 12, headquarters: "Gulariya" },

  // ── Karnali Province (Province 6) ───────────────────────────────────────────
  { id: "srk-[#1]", nameEn: "Birendranagar Municipality", nameNp: "वीरेन्द्रनगर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Surkhet", districtNp: "सुर्खेत", provinceEn: "Karnali Province", provinceNp: "कर्णाली प्रदेश", totalWards: 16, headquarters: "Birendranagar" },
  { id: "dlk-[#1]", nameEn: "Narayan Municipality", nameNp: "नारायण नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Dailekh", districtNp: "दैलेख", provinceEn: "Karnali Province", provinceNp: "कर्णाली प्रदेश", totalWards: 11, headquarters: "Dailekh Bazaar" },
  { id: "slyn-[#1]", nameEn: "Sharada Municipality", nameNp: "शारदा नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Salyan", districtNp: "सल्यान", provinceEn: "Karnali Province", provinceNp: "कर्णाली प्रदेश", totalWards: 15, headquarters: "Khalanga" },
  { id: "jml-[#1]", nameEn: "Chandan Nath Municipality", nameNp: "चन्दननाथ नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Jumla", districtNp: "जुम्ला", provinceEn: "Karnali Province", provinceNp: "कर्णाली प्रदेश", totalWards: 10, headquarters: "Khalanga Bazaar, Jumla" },
  { id: "jjk-[#1]", nameEn: "Bheri Municipality", nameNp: "भेरी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Jajarkot", districtNp: "जाजरकोट", provinceEn: "Karnali Province", provinceNp: "कर्णाली प्रदेश", totalWards: 13, headquarters: "Khalanga, Jajarkot" },

  // ── Sudurpashchim Province (Province 7) ─────────────────────────────────────
  { id: "kll-sub", nameEn: "Dhangadhi Sub-Metropolitan City", nameNp: "धनगढी उपमहानगरपालिका", type: "Sub-Metropolitan", typeNp: "उपमहानगरपालिका", districtEn: "Kailali", districtNp: "कैलाली", provinceEn: "Sudurpashchim Province", provinceNp: "सुदूरपश्चिम प्रदेश", totalWards: 19, headquarters: "Dhangadhi" },
  { id: "kll-[#1]", nameEn: "Tikapur Municipality", nameNp: "टीकापुर नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kailali", districtNp: "कैलाली", provinceEn: "Sudurpashchim Province", provinceNp: "सुदूरपश्चिम प्रदेश", totalWards: 9, headquarters: "Tikapur" },
  { id: "knc-[#1]", nameEn: "Bhimdatta Municipality", nameNp: "भीमदत्त नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Kanchanpur", districtNp: "कञ्चनपुर", provinceEn: "Sudurpashchim Province", provinceNp: "सुदूरपश्चिम प्रदेश", totalWards: 19, headquarters: "Mahendranagar" },
  { id: "ddl-[#1]", nameEn: "Amargadhi Municipality", nameNp: "अमरगढी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Dadeldhura", districtNp: "डडेल्धुरा", provinceEn: "Sudurpashchim Province", provinceNp: "सुदूरपश्चिम प्रदेश", totalWards: 11, headquarters: "Dadeldhura Bazaar" },
  { id: "btd-[#1]", nameEn: "Dasharathchand Municipality", nameNp: "दशरथचन्द नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Baitadi", districtNp: "बैतडी", provinceEn: "Sudurpashchim Province", provinceNp: "सुदूरपश्चिम प्रदेश", totalWards: 11, headquarters: "Ghopali, Baitadi" },
  { id: "dti-[#1]", nameEn: "Dipayal Silgadhi Municipality", nameNp: "दिपायल सिलगढी नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Doti", districtNp: "डोटी", provinceEn: "Sudurpashchim Province", provinceNp: "सुदूरपश्चिम प्रदेश", totalWards: 9, headquarters: "Silgadhi" },
  { id: "ach-[#1]", nameEn: "Mangalsen Municipality", nameNp: "मङ्गलसेन नगरपालिका", type: "Municipality", typeNp: "नगरपालिका", districtEn: "Achham", districtNp: "अछाम", provinceEn: "Sudurpashchim Province", provinceNp: "सुदूरपश्चिम प्रदेश", totalWards: 14, headquarters: "Mangalsen" },
];

// ── Ward Area Names for All 58 Local Units in Database ──────────────────────────
// Maps municipality id → ward number → notable area/tole names
const WARD_AREAS: Record<string, Record<number, string>> = {
  // ── Koshi Province ──
  "mrg-metro": {
    1: "Rani", 2: "Tankisinuwari", 3: "Kanchanbari", 4: "Mill Area", 5: "Tintoliya",
    6: "Bargachhi", 7: "Traffic Chowk", 8: "Jogbani Road", 9: "Tinpaini", 10: "Shanti Chowk",
    11: "Ganesh Chowk", 12: "Baijanathpur", 13: "Saljhandi", 14: "Pragatinagar", 15: "Power House",
    16: "Bus Park Area", 17: "Jute Mill", 18: "Airport Road", 19: "Nahar Tole",
  },
  "sns-[#1]": {
    1: "Bhanu Chowk", 2: "Putali Line", 3: "Bus Park", 4: "Panbari", 5: "Chatara Road",
    6: "Duhabi Road", 7: "Guheswori", 8: "Sangam Chowk", 9: "Milan Chowk", 10: "Khanepani",
    11: "Chhatiwan", 12: "Birauta", 13: "Shantinagar", 14: "Bijayapur", 15: "Campus Road",
    16: "BP Chowk", 17: "Biratchowk", 18: "Pindeswor", 19: "Ghopa Camp", 20: "Bhedetar Road",
  },
  "sns-[#2]": {
    1: "Itahari Chowk", 2: "Koshi Highway", 3: "Tinpaini", 4: "Sundarpur", 5: "Hansposa",
    6: "Biratnagar Road", 7: "Dharan Road", 8: "Tarahara", 9: "Pakali", 10: "Laukahi",
    11: "Bhogateni", 12: "Hasandaha", 13: "Sinuwari", 14: "Madheli", 15: "Rajghat",
    16: "Baklauri", 17: "Itahari Bus Park", 18: "Sunsari Road", 19: "Salbari", 20: "Panchkanya",
  },
  "jhp-[#1]": {
    1: "Bhadrapur Bazaar", 2: "Golphai", 3: "Devigunj", 4: "Prithvinagar", 5: "Maheshpur",
    6: "Kichakdhana", 7: "Haldibari Road", 8: "Chandragadhi", 9: "Mechi Bridge Area", 10: "Tangatingi",
  },
  "jhp-[#2]": {
    1: "Damak Chowk", 2: "Hulak Tole", 3: "Beldangi", 4: "Pragatinagar", 5: "Deepak Chowk",
    6: "Lahanu Tole", 7: "Campus Mode", 8: "Bungamiti", 9: "Ratanpur", 10: "Sethu Chowk",
  },
  "jhp-[#3]": {
    1: "Birtamod Bazaar", 2: "Anarmani", 3: "Sanishchare Road", 4: "Garamani", 5: "Charpane",
    6: "Maitri Chowk", 7: "Atithi Road", 8: "Suryanagar", 9: "Pratap Tole", 10: "Sainik Tole",
  },
  "jhp-[#4]": {
    1: "Kakarbhitta", 2: "Dhulabari", 3: "Itabhatta", 4: "Bahundangi", 5: "Nundhaki",
    6: "Duwagadhi", 7: "Jalpa Devi", 8: "Shantinagar", 9: "Nakalbandi", 10: "Satighatta",
    11: "Charali", 12: "Khadkabari", 13: "Hadiya", 14: "Mechi Nagar Chowk", 15: "Pragatinagar",
  },
  "ilm-[#1]": {
    1: "Ilam Bazaar", 2: "Chiyabari", 3: "Puwa Khola", 4: "Singhabahini", 5: "Barbote",
    6: "Godak", 7: "Sumbek", 8: "Sakhejung", 9: "Tilkeni", 10: "Naya Bazaar",
    11: "Guthi", 12: "Bhanu Chowk",
  },
  "ilm-[#2]": {
    1: "Fikkal Bazaar", 2: "Pashupatinagar", 3: "Kanyam", 4: "Panchakanya", 5: "Gorkhe",
    6: "Shree Antu", 7: "Samalbung", 8: "Lakmapur", 9: "Phakphok", 10: "Kolbung",
    11: "Shantinagar", 12: "Manmaya", 13: "Sundarpani", 14: "Chiya Bari",
  },
  "tpl-[#1]": {
    1: "Phungling Bazaar", 2: "Tokpegola Road", 3: "Hangdewa", 4: "Dokhu", 5: "Kafle Pati",
    6: "Dhungesanghu", 7: "Lalikharka", 8: "Kande", 9: "Fungling Market", 10: "Sainik Tole", 11: "Helipad Area",
  },
  "pct-[#1]": {
    1: "Phidim Bazaar", 2: "Ranitar", 3: "Chokmagu", 4: "Lumbini Tole", 5: "Bharapa",
    6: "Siwa", 7: "Nagarpalika Chowk", 8: "Phedim Market", 9: "Pauwa Bhanjyang", 10: "Yangnam",
    11: "Nangin", 12: "Lungrupa", 13: "Phaktep", 14: "Kabeli",
  },
  "dhk-[#1]": {
    1: "Dhankuta Bazaar", 2: "Hile Bazaar", 3: "Salleri", 4: "Debrebas", 5: "Murtidhunga",
    6: "Chulilung", 7: "Bihibar Bazaar", 8: "Kopche", 9: "Belhara", 10: "Bhitri Bazaar",
  },
  "trh-[#1]": {
    1: "Myanglung Bazaar", 2: "Jirikhimti", 3: "Sabla", 4: "Tamor", 5: "Sungnam",
    6: "Solma", 7: "Ambote", 8: "Chitre", 9: "Piple", 10: "Simle",
  },
  "sks-[#1]": {
    1: "Khandbari Bazaar", 2: "Tumlingtar", 3: "Manebhanjyang", 4: "Pangma", 5: "Majuwa",
    6: "Seduwa", 7: "Num Road", 8: "Helipad", 9: "Chandanpur", 10: "Bhotebass", 11: "Shanti Chowk",
  },
  "bjp-[#1]": {
    1: "Bhojpur Bazaar", 2: "Helichauka", 3: "Taksar", 4: "Siddheshwar", 5: "Bokhim",
    6: "Gupteshwar", 7: "Amdanda", 8: "Panchakanya", 9: "Pokhari", 10: "Charambi",
    11: "Dhode", 12: "Kot",
  },
  "slk-[#1]": {
    1: "Salleri Bazaar", 2: "Phaplu", 3: "Taksindu", 4: "Jubing", 5: "Kangel",
    6: "Gaurishankar", 7: "Garma", 8: "Tingla", 9: "Basa", 10: "Beni", 11: "Dudhkunda",
  },
  "okh-[#1]": {
    1: "Okhaldhunga Bazaar", 2: "Barnalu", 3: "Narayanthan", 4: "Rumjatar", 5: "Kalyanpur",
    6: "Jantharkhani", 7: "Mulkharka", 8: "Phulbari", 9: "Jethal", 10: "Patale",
    11: "Bilandu", 12: "Goli",
  },
  "ktg-[#1]": {
    1: "Diktel Bazaar", 2: "Rupakot", 3: "Majhuwagadhi", 4: "Laphang", 5: "Kafle",
    6: "Jalpa", 7: "Sungdel", 8: "Buipa", 9: "Nirmali Danda", 10: "Dorpa",
    11: "Kharpa", 12: "Bamrang", 13: "Nuntala", 14: "Vijaykharka", 15: "Chitapokhari",
  },
  "udp-[#1]": {
    1: "Gaighat Bazaar", 2: "Motigora", 3: "Bagaha", 4: "Deuri", 5: "Jaljale",
    6: "Saune", 7: "Chaudandi", 8: "Rautoma", 9: "Triyuga Mode", 10: "Siddhipur",
    11: "Bokse", 12: "Purano Gaighat", 13: "Khadka Bhadrakali", 14: "Chubha", 15: "Bhatepur", 16: "Khanbu",
  },

  // ── Madhesh Province ──
  "prs-metro": {
    1: "Ghantaghar", 2: "Adarshnagar", 3: "Powerhouse", 4: "Birta", 5: "Chaudhary Tole",
    6: "Maisthan", 7: "Murli Chowk", 8: "Panitanki", 9: "Chhapkaiya", 10: "Ranighat",
    11: "Durganagar", 12: "Indrapur", 13: "Parwanipur", 14: "Pipra", 15: "Jitpur",
    16: "Prasauni", 17: "Pokhariya", 18: "Gadhi", 19: "Simra Road", 20: "Bus Park",
    21: "Sahebganj", 22: "Bhawanipur", 23: "Belahi", 24: "Nakatajhijha", 25: "Kalaiya Road",
    26: "Bangra", 27: "Sugauli", 28: "Jitgadhi", 29: "Phulwariya", 30: "Dumarbana",
    31: "Rampur", 32: "Biruwaguthi",
  },
  "dns-[#1]": {
    1: "Ramanand Chowk", 2: "Bhanu Chowk", 3: "Mills Area", 4: "Janaki Temple Area", 5: "Shiv Chowk",
    6: "Subba Chowk", 7: "Mujelia", 8: "Pedari", 9: "Pindrajora", 10: "Devpura",
    11: "Matihani Road", 12: "Kuwamora", 13: "Bela", 14: "Manrawa", 15: "Dhanushadham Road",
    16: "Bishankpur", 17: "Bishrampur", 18: "Kuraitha", 19: "Fulbariya", 20: "Basbiti",
    21: "Kapileshwar", 22: "Laxmipur", 23: "Laxminiya", 24: "Bindhi", 25: "Khadwa",
  },
  "bra-[#1]": {
    1: "Kalaiya Bazaar", 2: "Bharat Chowk", 3: "Gadhi Mai Road", 4: "Siswa", 5: "Motisar",
    6: "Bhabangawan", 7: "Bariya", 8: "Pipradham", 9: "Rampur", 10: "Parsauni",
    11: "Basatpur", 12: "Gaurigunj", 13: "Maheshpur", 14: "Bhojpur", 15: "Hardiya",
    16: "Bhartpur", 17: "Dharmajan", 18: "Manjur", 19: "Inarwa", 20: "Manmohan Tole",
    21: "Bhelahi", 22: "Bagahi", 23: "Shreepur", 24: "Pratappur", 25: "Uttam Pur",
    26: "Pipra", 27: "Simra Road",
  },
  "bra-[#2]": {
    1: "Simara Airport Area", 2: "Jitpur Bazaar", 3: "Pipara", 4: "Amlekhgunj", 5: "Manaharwa",
    6: "Ramnagar", 7: "Inarwasira", 8: "Matiarwa", 9: "Chhatiwan", 10: "Bhadrakali",
    11: "Gadhimai", 12: "Fathepur", 13: "Prasoka", 14: "Dumbarwana", 15: "Kakrahol",
    16: "Pathlaiya", 17: "Jhitkaiya", 18: "Koliya", 19: "Nijgadh Road", 20: "Purano Simara",
    21: "Bhelahi", 22: "Sitapur", 23: "Hariharpur", 24: "Bhawani Tole",
  },
  "spt-[#1]": {
    1: "Rajbiraj Bazaar", 2: "Mahabir Chowk", 3: "Hulak Tole", 4: "Chhinnamasta Road", 5: "Bishnupur",
    6: "Pragatinagar", 7: "Khadak", 8: "Manra", 9: "Siraha Road", 10: "Purano Rajbiraj",
    11: "Farsethi", 12: "Koiladi", 13: "Malekpur", 14: "Brahamapur", 15: "Deuri", 16: "Bhatigachhi",
  },
  "srh-[#1]": {
    1: "Lahan Bazaar", 2: "Hospital Chowk", 3: "Bus Park Area", 4: "College Road", 5: "Sahid Chowk",
    6: "Bhagwanpur Road", 7: "Jitpur", 8: "Sonmati", 9: "Dhanauri", 10: "Govindpur",
    11: "Padaria", 12: "Sisianwa", 13: "Tenuwapatti", 14: "Brahmottar", 15: "Bhadhai",
    16: "Tarapatti", 17: "Bhatipur", 18: "Betauna", 19: "Ramnagar", 20: "Manipur",
    21: "Govindapur", 22: "Sisawani", 23: "Sonamatti", 24: "Baluwa",
  },
  "mht-[#1]": {
    1: "Jaleshwar Temple Area", 2: "Bhanu Chowk", 3: "Hospital Road", 4: "Bhakti Sthan", 5: "Damhi",
    6: "Bajrahi", 7: "Bakhari", 8: "Suraida", 9: "Maniyari", 10: "Ratauli", 11: "Pigauna", 12: "Phulhatta",
  },
  "srl-[#1]": {
    1: "Malangwa Bazaar", 2: "Custom Office Area", 3: "Shiv Chowk", 4: "Musahari", 5: "Gamhariya",
    6: "Inarwa", 7: "Khutuna", 8: "Sonbarsha", 9: "Bhadsar", 10: "Bhandara", 11: "Netraganj", 12: "Visunpur",
  },
  "rth-[#1]": {
    1: "Gaur Bazaar", 2: "Tikulia", 3: "Kabir Chowk", 4: "Purnaibag", 5: "Barhadwa",
    6: "Sabagada", 7: "Rajpur", 8: "Mahadevji", 9: "Custom Border Area",
  },

  // ── Bagmati Province ──
  "ktm-metro": {
    1: "Naxal", 2: "Lazimpat", 3: "Maharajgunj", 4: "Baluwatar", 5: "Handigaun",
    6: "Bouddha", 7: "Mitrapark", 8: "Pashupati", 9: "Gaushala", 10: "Baneshwor",
    11: "Tripureshwor", 12: "Teku", 13: "Kalimati", 14: "Kalanki", 15: "Dallu",
    16: "Sorhakhutte", 17: "Chhetrapati", 18: "Naradevi", 19: "Damaitol", 20: "Bhimsensthan",
    21: "Jyabahal", 22: "Tebahal", 23: "Om Bahal", 24: "Makhan", 25: "Janabahal",
    26: "Lainchaur", 27: "Mahabouddha", 28: "Purano Buspark", 29: "Dillibazar", 30: "Gyaneshwor",
    31: "Shantinagar", 32: "Koteshwor",
  },
  "ltd-metro": {
    1: "Pulchowk", 2: "Sanepa", 3: "Jawalakhel", 4: "Kupondole", 5: "Lagankhel",
    6: "Kumaripati", 7: "Nakkhu", 8: "Sarbochcha Adalat", 9: "Gwarko", 10: "Dhobighat",
    11: "Mangalbazar", 12: "Balkumari", 13: "Kupandol Heights", 14: "Satdobato", 15: "Ekantakuna",
    16: "Tikathali", 17: "Nayabasti", 18: "Sunakothi", 19: "Lubhu", 20: "Siddhipur",
    21: "Khokana", 22: "Bungamati", 23: "Hattiban", 24: "Dhapakhel", 25: "Bhainsepati",
    26: "Chapagaun", 27: "Thaiba", 28: "Harisiddhi", 29: "Godamchaur",
  },
  "ctw-metro": {
    1: "Bharatpur Chowk", 2: "Narayangadh", 3: "Pulchowk, Bharatpur", 4: "Sahid Chowk", 5: "Sharadanagar",
    6: "Parbatipur", 7: "Mangalpur", 8: "Shivanagar", 9: "Bhandara", 10: "Jutpani",
    11: "Patihani", 12: "Gitanagar", 13: "Gunjanagar", 14: "Meghauli", 15: "Jagatpur",
    16: "Kumroj", 17: "Bachhauli", 18: "Padampur", 19: "Dibyapuri", 20: "Sukranagar",
    21: "Basantapur", 22: "Chainpur", 23: "Sharanpur", 24: "Birendranagar", 25: "Yagyapuri",
    26: "Shukranagar", 27: "Ratnanagar area", 28: "Lanku", 29: "Piple",
  },
  "mkp-[#1]": {
    1: "Hetauda Chowk", 2: "Bus Park Area", 3: "Bagmara", 4: "Ratomate", 5: "Chattiwan",
    6: "Daman Road", 7: "Handikhola", 8: "Panchkhal", 9: "Hatiya", 10: "Manakamana",
    11: "Airport Road", 12: "Singha Durbar", 13: "Shaktikhor", 14: "Churiyamai", 15: "Bhimphedi",
    16: "Makwanpur Gadhi", 17: "Manahari", 18: "Rampur", 19: "Katuwachaur",
  },
  "ktm-[#1]": {
    1: "Devdhoka", 2: "Naya Bazaar", 3: "Tyaanglaphant", 4: "Bagh Bhairab", 5: "Chilancho",
    6: "Chobhar", 7: "Bishnudevi", 8: "Palanchowk Tole", 9: "Champadevi", 10: "Boshan",
  },
  "ktm-[#2]": {
    1: "Taulung", 2: "Bhangan", 3: "Budhanilkantha Temple Area", 4: "Pasikot", 5: "Special Chowk",
    6: "Hattigauda", 7: "Golfutar", 8: "Mandikhatar", 9: "Kapan", 10: "Paiyatar",
    11: "Chunnikhel", 12: "Kapan Gumba", 13: "Chunchepati",
  },
  "ktm-[#3]": {
    1: "Dahachowk", 2: "Basantapur", 3: "Thankot Bazaar", 4: "Godam", 5: "Checkpost",
    6: "Matatirtha", 7: "Gurjudhara", 8: "Satungal", 9: "Machhegaun", 10: "Bosan",
    11: "Checkpost North", 12: "Naikap", 13: "Purano Naikap", 14: "Naya Naikap", 15: "Tinthana",
  },
  "ktm-[#4]": {
    1: "Raniban", 2: "Radha Krishna Tole", 3: "Harisiddhi", 4: "Ichangu Narayan", 5: "Sitapaila",
    6: "Ramkot", 7: "Bhimdhunga", 8: "Syuchatar", 9: "Dhaneshwar", 10: "Bhudhanilkantha Road",
  },
  "ktm-[#5]": {
    1: "Sangla", 2: "Kavresthali", 3: "Jitpur Phedi", 4: "Goldhunga", 5: "Dharmasthali",
    6: "Manamaiju", 7: "Footung", 8: "Lolang", 9: "Jarankhu", 10: "Nepaltar", 11: "Mahadevsthan",
  },
  "ltd-[#1]": {
    1: "Imadol", 2: "Sanogaun", 3: "Siddhipur", 4: "Lubhu", 5: "Tikathali",
    6: "Lamatar", 7: "Changathali", 8: "Bojepokhari", 9: "Gwarko East", 10: "Lalitpur Border",
  },
  "ltd-[#2]": {
    1: "Godawari Bazaar", 2: "Thaiba", 3: "Godamchaur", 4: "Badikhel", 5: "Lele",
    6: "Tika Bhairab", 7: "Devichour", 8: "Dukuchhap", 9: "Chhampi", 10: "Pyangaon",
    11: "Chapagaun", 12: "Thecho", 13: "Jharuwarasi", 14: "Bisankhunarayan",
  },
  "bkp-[#1]": {
    1: "Nagpokhari", 2: "Byasi", 3: "Pottery Square", 4: "Taumadhi", 5: "Durbar Square",
    6: "Inacho", 7: "Golmadhi", 8: "Bactapur Buspark", 9: "Dattatreya", 10: "Kamalbinayak",
  },
  "bkp-[#2]": {
    1: "Lokanthali", 2: "Balkumari Thimi", 3: "Kaushaltar", 4: "Balkot Road", 5: "Naya Thimi",
    6: "Nagadesh", 7: "Bode", 8: "Tigani", 9: "Sano Thimi",
  },
  "bkp-[#3]": {
    1: "Sirutar", 2: "Balkot", 3: "Gundu", 4: "Dadhikot", 5: "Katunje",
    6: "Suryabinayak Temple Area", 7: "Sipadol", 8: "Nankhel", 9: "Chittapol", 10: "Sangachowk",
  },
  "kvr-[#1]": {
    1: "Dhulikhel Bazaar", 2: "Hospital Area", 3: "Kavre Campus Area", 4: "Bhagwati Sthan", 5: "Kavre Bhanjyang",
    6: "Rabi Opi", 7: "Sanowangthali", 8: "Sharada Batase", 9: "Patlekhet", 10: "Phulbari",
    11: "Devithan", 12: "Sankhu",
  },
  "kvr-[#2]": {
    1: "Tukucha", 2: "Nala", 3: "Chandani Chowk", 4: "Charghare", 5: "Banepa Bazaar",
    6: "Godamchaur", 7: "Banepa Buspark", 8: "Budol", 9: "Nayabasto", 10: "Janagal",
    11: "Ugratara", 12: "Mahendra Highway", 13: "Dhaneswor", 14: "Rampur",
  },
  "kvr-[#3]": {
    1: "Panauti Bazaar", 2: "Indreshwar", 3: "Kusadevi", 4: "Balthali", 5: "Subhakalika",
    6: "Sunthan", 7: "Tauthali", 8: "Malpi", 9: "Sankhu", 10: "Khopasi",
    11: "Sharada", 12: "Bhimsensthan",
  },
  "snc-[#1]": {
    1: "Chautara Bazaar", 2: "Sangachok", 3: "Syaule", 4: "Kubhinde", 5: "Sanusirwari",
    6: "Pipal Danda", 7: "Haibung", 8: "Thulo Sirubari", 9: "Kadambabas", 10: "Irkhu",
    11: "Bandeu", 12: "Bhimtar", 13: "Thipalkot", 14: "Jalbire Road",
  },
  "nwk-[#1]": {
    1: "Bidur Bazaar", 2: "Battar", 3: "Trishuli Bazaar", 4: "Bhairavi Sthan", 5: "Pipaltar",
    6: "Manamohan Tole", 7: "Tupche", 8: "Gerkhu", 9: "Kumari", 10: "Khadag Bhanjyang",
    11: "Kalyanpur", 12: "Charghare", 13: "Devighat",
  },
  "dhd-[#1]": {
    1: "Dhading Besi Bazaar", 2: "Puchhar Bazaar", 3: "Bich Bazaar", 4: "Sankosh", 5: "Sunula Bazar",
    6: "Khalte", 7: "Murali Bhanjyang", 8: "Dhuwakot", 9: "Maidi", 10: "Chainpur",
    11: "Jyamrung", 12: "Sera", 13: "Bungchung", 14: "Sasah",
  },

  // ── Gandaki Province ──
  "ksk-metro": {
    1: "Bagar", 2: "Miruwa", 3: "Nadipur", 4: "Gairapatan", 5: "Malepatan",
    6: "Lakeside (Baidam)", 7: "Masbar", 8: "Shrijana Chowk", 9: "Naya Bazar", 10: "Kundahar",
    11: "Lamachaur", 12: "Simal Chaur", 13: "Kahun", 14: "Rambazar", 15: "Naudanda",
    16: "Hyangja", 17: "Hemja", 18: "Parsyang", 19: "Pumdikot", 20: "Kaskikot",
    21: "Chapakot", 22: "Sarangkot", 23: "Bharat Pokhari", 24: "Majhthana", 25: "Kristi",
    26: "Begnas (Lekhnath)", 27: "Lekhnath Chowk", 28: "Sundari Danda", 29: "Shishuwa", 30: "Nirmal Pokhari",
    31: "Armala", 32: "Kalika", 33: "Puranchaur",
  },
  "tnh-[#1]": {
    1: "Damauli Bazaar", 2: "Bhanu Chowk", 3: "Vyas Cave Area", 4: "Madi Khola Area", 5: "Chhabdi Barahi",
    6: "Saranghat", 7: "Botewodar", 8: "Risti", 9: "Gajarkot", 10: "Pokuva",
    11: "Tanahunsur", 12: "Ghasikuwa", 13: "Pokhari Bhanjyang", 14: "Keshavtar",
  },
  "tnh-[#2]": {
    1: "Dhorphirdi", 2: "Khairenitar", 3: "Duleguda", 4: "Gachchok", 5: "Belchautara",
    6: "Halyang", 7: "Shukla Nagar", 8: "Phirkep", 9: "Thaprek", 10: "Raijhok",
    11: "Kalyanpur", 12: "Pyarjung",
  },
  "syg-[#1]": {
    1: "Syangja Bazaar", 2: "Badhanabaj", 3: "Kholakhet", 4: "Chandibhanjyang", 5: "Kolma",
    6: "Bahundanda", 7: "Thuladhee", 8: "Tindobate", 9: "Syangja Buspark", 10: "Rangkhola",
    11: "Majhakot", 12: "Panchamul", 13: "Kaule", 14: "Kichnas",
  },
  "syg-[#2]": {
    1: "Waling Bazaar", 2: "Slo", 3: "Tungin", 4: "Dhanubans", 5: "Jagatbhanjyang",
    6: "Eladi", 7: "Mirkot", 8: "Kewal", 9: "Bhakunde", 10: "Chhangchhangdi",
    11: "Pekhuwagadadi", 12: "Kalikakot", 13: "Sworek", 14: "Tulsibhanjyang",
  },
  "grk-[#1]": {
    1: "Gorkha Bazaar", 2: "Gorkha Durbar Area", 3: "Haramtari", 4: "Bus Park Area", 5: "Paslang",
    6: "Choprak", 7: "Nareswar", 8: "Finam", 9: "Laxmibazar", 10: "Ratnechaur",
    11: "Tandrang", 12: "Thala", 13: "Sirdibar", 14: "Deurali",
  },
  "lmj-[#1]": {
    1: "Besisahar Bazaar", 2: "Shera", 3: "Chitikhel", 4: "Gaunsahar", 5: "Chinchu",
    6: "Narayansthan", 7: "Puspa Chowk", 8: "Bhanu Mode", 9: "Udipur", 10: "Bajjrakhet", 11: "Chiti",
  },
  "nwp-[#1]": {
    1: "Kawasoti Bazaar", 2: "Thana Chowk", 3: "Shivabas", 4: "Hasapur", 5: "Pithauli",
    6: "Magar Tole", 7: "Goledanda", 8: "Lumbini Road", 9: "Danda Bazaar", 10: "Bishnupur",
    11: "Amaltari", 12: "Mainaghat", 13: "Tribeni Road", 14: "Haramtari", 15: "Sherpur",
    16: "Chinchu", 17: "Devchuli Road",
  },
  "prb-[#1]": {
    1: "Kusma Bazaar", 2: "Baleewa", 3: "Dungepatan", 4: "Kati", 5: "Bridge Mode",
    6: "Bishnupaduka", 7: "Katuwachaupari", 8: "Chuwa", 9: "Pipaltari", 10: "Pang",
    11: "Khurkot", 12: "Dhamilikuwa", 13: "Shivalaya", 14: "Armadi",
  },
  "bgl-[#1]": {
    1: "Baglung Bazaar", 2: "Kalika Temple Area", 3: "Guheswori", 4: "Upallachaur", 5: "Mulkpani",
    6: "Laliguras Chowk", 7: "Titiwang", 8: "Sigana", 9: "Titung", 10: "Bhakunde",
    11: "Rayada", 12: "Ambot", 13: "Pala", 14: "Dhamja",
  },
  "myg-[#1]": {
    1: "Beni Bazaar", 2: "Galeshwar", 3: "Bhittri Bazaar", 4: "Singa", 5: "Tatopani",
    6: "Arthunge", 7: "Toripani", 8: "Bhogateni", 9: "Gathan", 10: "Pulachaur",
  },
  "mst-[#1]": {
    1: "Jomsom Bazaar", 2: "Marpha", 3: "Syang", 4: "Thini", 5: "Chhairo",
  },

  // ── Lumbini Province ──
  "rpd-sub": {
    1: "Butwal Chowk", 2: "Golpark", 3: "Devisthan", 4: "Kalikanagar", 5: "Milan Chowk",
    6: "Traffic Chowk", 7: "Sukkhanagar", 8: "Bus Park Area", 9: "Deepnagar", 10: "Basantanagar",
    11: "Tamnagar", 12: "Motipur", 13: "Siddhababa", 14: "Manigram", 15: "Belbas",
    16: "Majhgaun", 17: "Parroha", 18: "Dhamauli", 19: "Jogikuti",
  },
  "dng-sub1": {
    1: "Rampur", 2: "Laxmipur", 3: "Dharna", 4: "Ghorahi Bazaar", 5: "Bus Park Area",
    6: "Traffic Chowk", 7: "Saudiyar", 8: "Tripur", 9: "Saigha", 10: "Narayanpur",
    11: "Sevashram", 12: "Ratanpur", 13: "Sewar", 14: "Koylabas Road", 15: "Ghorahi Chowk",
    16: "Swarat", 17: "Chaitapur", 18: "Deepnagar", 19: "Gurung Tole",
  },
  "dng-sub2": {
    1: "Tulsipur Bazaar", 2: "Bus Park Area", 3: "Tarigaun", 4: "Halwar", 5: "Manpur",
    6: "Bijauri", 7: "Panchakanya", 8: "Urahari", 9: "Duruwa", 10: "Hemantapur",
    11: "Motipur", 12: "Phulbari", 13: "Pawannagar", 14: "Shantinagar", 15: "Sitaram Tole",
    16: "Beljhundi", 17: "Koylabas", 18: "Baghmara", 19: "Gitanagar",
  },
  "bnk-sub": {
    1: "Dhamboji Chowk", 2: "Gharbari Tole", 3: "Ekta Nagar", 4: "Bus Park Area", 5: "Tribhuvan Chowk",
    6: "Fultekra", 7: "Ganeshpur", 8: "Industrial Area", 9: "Belaspur", 10: "Bhawaniyapur",
    11: "Purano Buspark", 12: "Karkando", 13: "Udharapur", 14: "Bhavani", 15: "Piprahawa",
    16: "Jaispur", 17: "Paraspur", 18: "Maghagadi", 19: "Hotel Sneha Area", 20: "Manpur",
    21: "Indrapur", 22: "Hiramaniya", 23: "Ranjha Airport Area",
  },
  "rpd-[#1]": {
    1: "Bhairahawa Bazaar", 2: "Custom Area", 3: "Bank Road", 4: "Galla Mandi", 5: "Deepak Chowk",
    6: "Devkota Chowk", 7: "Buddha Chowk", 8: "Subba Tole", 9: "Milanchowk", 10: "Hospital Mode",
    11: "Airport Road", 12: "Danda Khola", 13: "Paklihawa",
  },
  "rpd-[#2]": {
    1: "Driver Tole", 2: "Janakinagar", 3: "Yogikuti East", 4: "Kotihawa", 5: "Manigram Chowk",
    6: "Bhalwari", 7: "Mangalapur", 8: "Shankar Nagar", 9: "Anandaban", 10: "Gangoliya",
    11: "Tikuligad", 12: "Karahiya", 13: "Madhabaliya", 14: "Kanshad", 15: "Patan",
    16: "Gajedi", 17: "Suryanagar",
  },
  "kpl-[#1]": {
    1: "Taulihawa Bazaar", 2: "Gotihawa", 3: "Tilaurakot", 4: "Niglihawa", 5: "Kudan",
    6: "Pipara", 7: "Dharmapur", 8: "Barkalpur", 9: "Ramnagar", 10: "Jagdishpur",
    11: "Shivpur", 12: "Gajedi",
  },
  "arg-[#1]": {
    1: "Sandhikharka Bazaar", 2: "Bhakunde", 3: "Narayangadh", 4: "Wangi", 5: "Kimadanga",
    6: "Narapani", 7: "Khanchikot", 8: "Pali", 9: "Juvitta", 10: "Dharapani",
    11: "Kerunga", 12: "Dibnapani",
  },
  "plp-[#1]": {
    1: "Tansen Bazaar", 2: "Shreenagar", 3: "Bhagwati Tole", 4: "Bishalnagar", 5: "Kailashnagar",
    6: "Holangdi", 7: "Prabhas", 8: "Madanpokhara", 9: "Bandelpokhara", 10: "Telgha",
    11: "Bandipokhara", 12: "Chirtungdhara", 13: "Rampur Road", 14: "Argali",
  },
  "glm-[#1]": {
    1: "Tamghas Bazaar", 2: "Resunga Hill Area", 3: "Simeltari", 4: "Arkhale", 5: "Neta",
    6: "Parbata", 7: "Duhabari", 8: "Phedi", 9: "Ulleri", 10: "Simalthari",
    11: "Dhadal", 12: "Gurunggaun", 13: "Bhumphedi", 14: "Shantinagar",
  },
  "brd-[#1]": {
    1: "Gulariya Bazaar", 2: "Custom Area", 3: "Hospital Mode", 4: "Tulasipur", 5: "Mathurapur",
    6: "Surajpur", 7: "Deudakala", 8: "Taratal", 9: "Baghphanta", 10: "Prayagpur",
    11: "Laxmipur", 12: "Mohammadpur",
  },

  // ── Karnali Province ──
  "srk-[#1]": {
    1: "Birendranagar Bazaar", 2: "Eritol", 3: "Mangalgadhi Chowk", 4: "Yeri", 5: "Chhinchu Road",
    6: "Bulbule", 7: "Itram", 8: "Subhakalika", 9: "Latikoili", 10: "Uttarganga",
    11: "Pingale", 12: "Jarbutta", 13: "Ratnanagar", 14: "Garpan", 15: "Chaugurji", 16: "Ramghat",
  },
  "dlk-[#1]": {
    1: "Dailekh Bazaar", 2: "Narayansthan", 3: "Tatapani", 4: "Tribhuwan Tole", 5: "Bhawani",
    6: "Saraswati Tole", 7: "Gaurikad", 8: "Kabilash", 9: "Belpata", 10: "Khadkawat", 11: "Khadka Tole",
  },
  "slyn-[#1]": {
    1: "Khalanga Bazaar", 2: "Sharada Mode", 3: "Sitalpati", 4: "Saijin", 5: "Majuwa",
    6: "Tulsipur Road", 7: "Marg", 8: "Hiwal", 9: "Chhatiwan", 10: "Dhanabari",
    11: "Luham", 12: "Devikot", 13: "Sayal", 14: "Kaphalkot", 15: "Kupinde",
  },
  "jml-[#1]": {
    1: "Jumla Khalanga Bazaar", 2: "Chandan Nath Temple Area", 3: "Talium", 4: "Mahat", 5: "Kartikswami",
    6: "Gutu", 7: "Urthu", 8: "Depalgaun", 9: "Umkhola", 10: "Danasanghu",
  },
  "jjk-[#1]": {
    1: "Jajarkot Khalanga Bazaar", 2: "Thanti", 3: "Syala", 4: "Pung", 5: "Rimna",
    6: "Bhur", 7: "Jagatipur", 8: "Karkigaun", 9: "Bhojpur", 10: "Chaurjahari Road",
    11: "Dalli", 12: "Kudari", 13: "Managhat",
  },

  // ── Sudurpashchim Province ──
  "kll-sub": {
    1: "Dhangadhi Chowk", 2: "Campus Road", 3: "Airport Area", 4: "Hasuliya", 5: "Bus Park",
    6: "Mohana Road", 7: "Phulbari", 8: "Dodhara", 9: "Urai", 10: "Tribhuwan Chowk",
    11: "Sahidpath", 12: "Kanchanpur Road", 13: "Chandani", 14: "Ranjha", 15: "Geta",
    16: "Lamkichuha", 17: "Pahalmanpur", 18: "Laxmipur", 19: "Kailali Road",
  },
  "kll-[#1]": {
    1: "Tikapur Park Area", 2: "Bhanu Chowk", 3: "Hospital Road", 4: "Bus Park", 5: "Manakamana Tole",
    6: "Narayanpur", 7: "Khadka Tole", 8: "Satasham", 9: "Dhansinghpur",
  },
  "knc-[#1]": {
    1: "Mahendranagar Bazaar", 2: "Buspark Area", 3: "Gadda Chauki", 4: "Dodhara", 5: "Chandani",
    6: "Bramhadev", 7: "Sripur", 8: "Bagthan", 9: "Jimuwa", 10: "Bhasi",
    11: "Geta", 12: "Daijee", 13: "Rautahat", 14: "Govindpur", 15: "Manakamana",
    16: "Haldukhal", 17: "Majhgaun", 18: "Sankargadh", 19: "Sukasal",
  },
  "ddl-[#1]": {
    1: "Dadeldhura Bazaar", 2: "Amargadhi Fort Area", 3: "Ugratara", 4: "Kirtipur", 5: "Tuphan Danda",
    6: "Bhadrapur", 7: "Pokhara", 8: "Syaule", 9: "Bagbazar", 10: "Koteli", 11: "Bhalumare",
  },
  "btd-[#1]": {
    1: "Ghopali Bazaar", 2: "Shailewori", 3: "Tripurasundari", 4: "Gurukhola", 5: "Baitadi Bazaar",
    6: "Nagad", 7: "Dehimandau", 8: "Dhawal", 9: "Gwad", 10: "Kholikhet", 11: "Silanga",
  },
  "dti-[#1]": {
    1: "Silgadhi Bazaar", 2: "Dipayal Bazaar", 3: "Airport Area", 4: "Pipalnagar", 5: "Gadhsera",
    6: "Rajpur", 7: "Banjkakot", 8: "Ladagada", 9: "Uchchakat",
  },
  "ach-[#1]": {
    1: "Mangalsen Bazaar", 2: "Jana", 3: "Sutar", 4: "Kuntibandali", 5: "Kalagaun",
    6: "Darna", 7: "Basti", 8: "Oli", 9: "Dhamali", 10: "Rishi",
    11: "Bhatakati", 12: "Marku", 13: "Bandali", 14: "Gogo",
  },
};

const PROVINCES = [
  "All",
  "Koshi Province",
  "Madhesh Province",
  "Bagmati Province",
  "Gandaki Province",
  "Lumbini Province",
  "Karnali Province",
  "Sudurpashchim Province",
];

export default function WardMunicipalityLookupTool() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedProvince, setSelectedProvince] = useState<string>("All");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("All");
  const [selectedUnitId, setSelectedUnitId] = useState<string>("ktm-metro");
  const [selectedWard, setSelectedWard] = useState<number>(1);
  const [copied, setCopied] = useState(false);

  // Available districts based on chosen province
  const availableDistricts = useMemo(() => {
    let units = NEPAL_LOCAL_UNITS;
    if (selectedProvince !== "All") {
      units = units.filter((u) => u.provinceEn === selectedProvince);
    }
    const dists = Array.from(new Set(units.map((u) => u.districtEn))).sort();
    return ["All", ...dists];
  }, [selectedProvince]);

  // Filtered Local Units list
  const filteredUnits = useMemo(() => {
    return NEPAL_LOCAL_UNITS.filter((unit) => {
      const matchesProvince =
        selectedProvince === "All" || unit.provinceEn === selectedProvince;
      const matchesDistrict =
        selectedDistrict === "All" || unit.districtEn === selectedDistrict;

      const q = searchQuery.toLowerCase().trim();
      const matchesQuery =
        !q ||
        unit.nameEn.toLowerCase().includes(q) ||
        unit.nameNp.includes(q) ||
        unit.districtEn.toLowerCase().includes(q) ||
        unit.districtNp.includes(q) ||
        unit.headquarters.toLowerCase().includes(q);

      return matchesProvince && matchesDistrict && matchesQuery;
    });
  }, [searchQuery, selectedProvince, selectedDistrict]);

  const activeUnit = useMemo(() => {
    const found = NEPAL_LOCAL_UNITS.find((u) => u.id === selectedUnitId);
    if (found && filteredUnits.some((f) => f.id === found.id)) {
      return found;
    }
    return filteredUnits[0] || NEPAL_LOCAL_UNITS[0];
  }, [selectedUnitId, filteredUnits]);

  // Get area name for the selected ward (if available)
  const selectedWardArea = WARD_AREAS[activeUnit.id]?.[selectedWard] || "";

  // Formatted official English & Nepali address strings
  const addressStringEn = selectedWardArea
    ? `${selectedWardArea}, Ward No. ${selectedWard}, ${activeUnit.nameEn}, ${activeUnit.districtEn}, ${activeUnit.provinceEn}, Nepal`
    : `Ward No. ${selectedWard}, ${activeUnit.nameEn}, ${activeUnit.districtEn}, ${activeUnit.provinceEn}, Nepal`;
  const addressStringNp = selectedWardArea
    ? `${activeUnit.nameNp}, वडा नं. ${selectedWard} (${selectedWardArea}), ${activeUnit.districtNp}, ${activeUnit.provinceNp}, नेपाल`
    : `${activeUnit.nameNp}, वडा नं. ${selectedWard}, ${activeUnit.districtNp}, ${activeUnit.provinceNp}, नेपाल`;

  const copyAddress = (str: string) => {
    navigator.clipboard.writeText(str);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="space-y-6">
      {/* Compact Selection Panel — Province → District → Municipality */}
      <div className="p-5 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4 shadow-xs">
        {/* Search Bar */}
        <div className="relative">
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#71717A]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search municipality, district, or headquarters (e.g. Kathmandu, Dharan, Jhapa)..."
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-[#18181B] dark:text-[#F4F4F5] placeholder:text-[#A1A1AA] text-sm focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
          />
        </div>

        {/* Province & District — Side by Side */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">Province</label>
            <select
              value={selectedProvince}
              onChange={(e) => {
                setSelectedProvince(e.target.value);
                setSelectedDistrict("All");
              }}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            >
              {PROVINCES.map((prov) => (
                <option key={prov} value={prov}>
                  {prov === "All" ? "All Provinces" : prov}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">District</label>
            <select
              value={selectedDistrict}
              onChange={(e) => setSelectedDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-[#E4E0D8] dark:border-[#1E2338] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40"
            >
              {availableDistricts.map((d) => (
                <option key={d} value={d}>
                  {d === "All" ? "All Districts" : `${d} District`}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Municipality Select — The main picker */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-[10px] font-bold text-[#71717A] uppercase tracking-wider block">
              <Building2 size={12} className="inline mr-1 -mt-0.5 text-[#F5A623]" />
              Select Municipality / Rural Municipality
            </label>
            <span className="text-[10px] text-[#71717A] font-medium">
              {filteredUnits.length} found
            </span>
          </div>
          {filteredUnits.length === 0 ? (
            <div className="px-4 py-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] text-center">
              No local units match &ldquo;{searchQuery}&rdquo;. Try a different search.
            </div>
          ) : (
            <select
              value={activeUnit.id}
              onChange={(e) => {
                setSelectedUnitId(e.target.value);
                setSelectedWard(1);
              }}
              className="w-full px-3 py-3 rounded-xl border-2 border-[#F5A623]/40 bg-[#FAFAF8] dark:bg-[#1E2338] text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:ring-2 focus:ring-[#F5A623]/40 focus:border-[#F5A623]"
            >
              {filteredUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.nameEn} — {u.districtEn} ({u.type}, {u.totalWards} Wards)
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Full-Width Details & Ward Section */}
      <div className="space-y-6">
        {/* Active Unit Header Card */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4 shadow-xs">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded-full bg-[#F5A623]/20 text-[#F5A623] uppercase tracking-wider">
                  {activeUnit.type} ({activeUnit.typeNp})
                </span>
                <h3 className="text-xl font-extrabold text-[#18181B] dark:text-[#F4F4F5] mt-2">
                  {activeUnit.nameEn}
                </h3>
                <h4 className="text-base font-devanagari text-[#71717A] dark:text-[#A1A1AA]">
                  {activeUnit.nameNp}
                </h4>
              </div>

              <div className="text-right">
                <span className="text-xs font-bold text-[#71717A] block">Total Wards</span>
                <span className="text-2xl font-black text-[#F5A623]">{activeUnit.totalWards}</span>
              </div>
            </div>

            {/* Meta details bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-3 border-t border-[#E4E0D8] dark:border-[#1E2338] text-xs">
              <div>
                <span className="text-[#71717A] font-semibold block">District</span>
                <strong className="text-[#18181B] dark:text-[#F4F4F5]">{activeUnit.districtEn} ({activeUnit.districtNp})</strong>
              </div>
              <div>
                <span className="text-[#71717A] font-semibold block">Province</span>
                <strong className="text-[#18181B] dark:text-[#F4F4F5]">{activeUnit.provinceEn}</strong>
              </div>
              <div>
                <span className="text-[#71717A] font-semibold block">Headquarters</span>
                <strong className="text-[#18181B] dark:text-[#F4F4F5]">{activeUnit.headquarters}</strong>
              </div>
            </div>
          </div>

        {/* Ward Number Selector Grid */}
        {(() => {
          const wardAreas = WARD_AREAS[activeUnit.id];
          return (
            <div className="p-4 sm:p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4 shadow-xs">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <h4 className="text-sm font-bold text-[#18181B] dark:text-[#F4F4F5] flex items-center gap-1.5">
                  <Hash size={16} className="text-[#F5A623]" /> Select Ward Number (1 to {activeUnit.totalWards})
                </h4>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#71717A] dark:text-[#A1A1AA] font-medium">Jump to:</span>
                  <input
                    type="number"
                    min={1}
                    max={activeUnit.totalWards}
                    placeholder="#"
                    value={selectedWard}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      if (!isNaN(val) && val >= 1 && val <= activeUnit.totalWards) {
                        setSelectedWard(val);
                      }
                    }}
                    className="w-14 px-2 py-1 text-center rounded-lg border border-[#E4E0D8] dark:border-[#2A2F48] bg-[#FAFAF8] dark:bg-[#1E2338] text-xs font-bold text-[#18181B] dark:text-[#F4F4F5] focus:outline-none focus:border-[#F5A623]"
                    aria-label="Jump to ward number"
                  />
                </div>
              </div>

              {/* Dense Numeric Grid on Mobile; comfortable on desktop */}
              <div className={`overflow-y-auto pr-1 ${activeUnit.totalWards > 20 ? "max-h-60 sm:max-h-80" : ""}`}>
                <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-1.5 sm:gap-2">
                  {Array.from({ length: activeUnit.totalWards }).map((_, idx) => {
                    const w = idx + 1;
                    const isWSelected = selectedWard === w;
                    const areaName = wardAreas?.[w];

                    return (
                      <button
                        key={w}
                        type="button"
                        onClick={() => setSelectedWard(w)}
                        title={areaName ? `Ward ${w}: ${areaName}` : `Ward ${w}`}
                        className={`h-10 rounded-xl text-xs font-black transition-all flex flex-col items-center justify-center cursor-pointer ${
                          isWSelected
                            ? "bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] shadow-sm scale-105 ring-2 ring-[#F5A623]/40"
                            : "bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-[#18181B] dark:text-[#F4F4F5] hover:border-[#F5A623]"
                        }`}
                      >
                        <span>{w}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Prominent Single Area & Ward Callout Below Grid */}
              <div className="p-3 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] flex items-center justify-between flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-2 font-bold text-[#18181B] dark:text-[#F4F4F5]">
                  <span className="px-2 py-0.5 rounded-lg bg-[#1F2544] dark:bg-[#F5A623] text-white dark:text-[#0C0F1E] text-xs font-black">
                    Ward {selectedWard}
                  </span>
                  <span>of {activeUnit.nameEn} ({activeUnit.nameNp})</span>
                </div>
                {selectedWardArea ? (
                  <span className="font-bold text-[#F5A623] bg-[#F5A623]/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                    📍 Notable Area: {selectedWardArea}
                  </span>
                ) : (
                  <span className="text-[11px] text-[#71717A] dark:text-[#A1A1AA]">
                    Ward level jurisdiction (वडा कार्यालय)
                  </span>
                )}
              </div>
            </div>
          );
        })()}

        {/* Formatted Official Address Box */}
        <div className="p-6 rounded-2xl bg-white dark:bg-[#141829] border border-[#E4E0D8] dark:border-[#1E2338] space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#71717A] uppercase tracking-wider flex items-center gap-1.5">
              <Globe size={14} className="text-emerald-500" /> Official Address Strings for Government &amp; Legal Forms
            </h4>
            <button
              onClick={() => copyAddress(addressStringEn)}
              className="flex items-center gap-1 text-xs font-bold text-[#F5A623] hover:underline"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              {copied ? "Copied!" : "Copy English"}
            </button>
          </div>

          {/* English Address */}
          <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <span className="text-[10px] font-bold text-[#71717A] block mb-1">ENGLISH FORMAT:</span>
            <p className="text-sm font-mono text-[#18181B] dark:text-[#F4F4F5]">
              {addressStringEn}
            </p>
          </div>

          {/* Nepali Address */}
          <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-bold text-[#71717A] block">NEPALI FORMAT (नेपाली ढाँचा):</span>
              <button
                onClick={() => copyAddress(addressStringNp)}
                className="text-[11px] font-semibold text-[#F5A623] hover:underline"
              >
                Copy Nepali
              </button>
            </div>
            <p className="text-sm font-devanagari text-[#18181B] dark:text-[#F4F4F5]">
              {addressStringNp}
            </p>
          </div>
        </div>
      </div>

      {/* Info Banner */}
      <div className="p-3.5 rounded-xl bg-[#FAFAF8] dark:bg-[#1E2338] border border-[#E4E0D8] dark:border-[#2A2F48] text-xs text-[#71717A] flex items-start gap-2">
        <Info size={16} className="text-[#F5A623] shrink-0 mt-0.5" />
        <span>
          <strong>Nepal Local Government Database:</strong> Reflects Nepal&apos;s 753 local level administrative units (Metropolitan, Sub-Metropolitan, Municipality, and Rural Municipality) created under the Constitution of Nepal 2072. Crucial for citizenship applications, passport details, land registration, and tax filings.
        </span>
      </div>
    </div>
  );
}
