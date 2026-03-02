export const CURRENCY_OPTIONS = [
  { value: "IDR", label: "IDR (Rp)" },
  { value: "USD", label: "USD ($)" },
  { value: "SGD", label: "SGD (S$)" },
  { value: "MYR", label: "MYR (RM)" },
  { value: "THB", label: "THB (฿)" },
  { value: "PHP", label: "PHP (₱)" },
  { value: "VND", label: "VND (₫)" },
  { value: "AUD", label: "AUD (A$)" },
  { value: "EUR", label: "EUR (€)" },
  { value: "GBP", label: "GBP (£)" },
] as const;

export const TIMEZONE_OPTIONS = [
  { value: "Asia/Jakarta", label: "(GMT+07:00) Jakarta, Bangkok" },
  { value: "Asia/Singapore", label: "(GMT+08:00) Singapore, KL" },
  { value: "Asia/Tokyo", label: "(GMT+09:00) Tokyo, Seoul" },
  { value: "Asia/Ho_Chi_Minh", label: "(GMT+07:00) Ho Chi Minh" },
  { value: "Asia/Manila", label: "(GMT+08:00) Manila" },
  { value: "Australia/Sydney", label: "(GMT+10:00) Sydney" },
  { value: "America/New_York", label: "(GMT-05:00) New York" },
  { value: "America/Los_Angeles", label: "(GMT-08:00) Los Angeles" },
  { value: "Europe/London", label: "(GMT+00:00) London" },
  { value: "Europe/Paris", label: "(GMT+01:00) Paris" },
] as const;
