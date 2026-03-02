import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const COUNTRY_OPTIONS = [
  { code: "ID", name: "Indonesia", dialCode: "+62", flag: "🇮🇩" },
  { code: "SG", name: "Singapore", dialCode: "+65", flag: "🇸🇬" },
  { code: "MY", name: "Malaysia", dialCode: "+60", flag: "🇲🇾" },
  { code: "TH", name: "Thailand", dialCode: "+66", flag: "🇹🇭" },
  { code: "PH", name: "Philippines", dialCode: "+63", flag: "🇵🇭" },
  { code: "VN", name: "Vietnam", dialCode: "+84", flag: "🇻🇳" },
  { code: "JP", name: "Japan", dialCode: "+81", flag: "🇯🇵" },
  { code: "KR", name: "South Korea", dialCode: "+82", flag: "🇰🇷" },
  { code: "AU", name: "Australia", dialCode: "+61", flag: "🇦🇺" },
  { code: "US", name: "United States", dialCode: "+1", flag: "🇺🇸" },
  { code: "GB", name: "United Kingdom", dialCode: "+44", flag: "🇬🇧" },
] as const;

function countryCodeToFlag(code: string): string {
  return code
    .toUpperCase()
    .split("")
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}

interface PhoneFieldProps {
  countryCode: string;
  phone: string;
  onCountryChange: (code: string) => void;
  onPhoneChange: (phone: string) => void;
  error?: string;
}

export function PhoneField({
  countryCode,
  phone,
  onCountryChange,
  onPhoneChange,
  error,
}: PhoneFieldProps) {
  const current = COUNTRY_OPTIONS.find((c) => c.code === countryCode) ?? COUNTRY_OPTIONS[0];

  return (
    <div className="space-y-1.5">
      <div className="flex">
        {/* Country selector trigger (styled div + hidden native select overlay) */}
        <div className="relative shrink-0">
          <div
            className={cn(
              "flex h-9 items-center gap-1 rounded-l-md border border-r-0 border-input bg-muted px-2.5 text-sm",
              error && "border-destructive"
            )}
          >
            <span role="img" aria-label={current.name}>
              {countryCodeToFlag(current.code)}
            </span>
            <span className="font-medium">{current.dialCode}</span>
            <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
          </div>
          <select
            value={countryCode}
            onChange={(e) => onCountryChange(e.target.value)}
            className="absolute inset-0 cursor-pointer opacity-0"
            aria-label="Country code"
          >
            {COUNTRY_OPTIONS.map((c) => (
              <option key={c.code} value={c.code}>
                {countryCodeToFlag(c.code)} {c.dialCode} — {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Phone number input */}
        <input
          type="tel"
          value={phone}
          onChange={(e) => onPhoneChange(e.target.value)}
          placeholder="812-3456-789"
          aria-invalid={!!error}
          className={cn(
            "border-input h-9 min-w-0 flex-1 rounded-l-none rounded-r-md border bg-transparent px-3 py-1 text-sm shadow-xs outline-none transition-[color,box-shadow]",
            "placeholder:text-muted-foreground",
            "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
            "aria-invalid:border-destructive aria-invalid:ring-destructive/20",
            error && "border-destructive"
          )}
        />
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
