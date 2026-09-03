declare module "nepali-date-converter" {
  export const dateConfigMap: Record<string, Record<string, number>>;
  export default class NepaliDate {
    constructor(date?: string | Date | number | NepaliDate);
    constructor(year: number, month: number, day: number);
    getYear(): number;
    getMonth(): number;
    getDate(): number;
    getDay(): number;
    toJsDate(): Date;
    format(formatStr: string, language?: "np" | "en"): string;
    static fromAD(adDate: Date): NepaliDate;
  }
}

