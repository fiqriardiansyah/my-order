import { useRef, useState } from "react";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface UploadFieldProps {
  value?: string | null;
  onChange: (value: string | null) => void;
  error?: boolean;
}

export function UploadField({ value, onChange, error }: UploadFieldProps) {
  const [preview, setPreview] = useState<string | null>(value ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setPreview(dataUrl);
      onChange(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setPreview(null);
    onChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={cn(
          "w-full rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-8",
          "flex flex-col items-center justify-center gap-2 transition-colors",
          "hover:border-ring hover:bg-muted/50",
          error && "border-destructive"
        )}
      >
        {preview ? (
          <img
            src={preview}
            alt="Preview"
            className="h-20 w-20 rounded-md object-contain"
          />
        ) : (
          <>
            <Upload className="h-8 w-8 text-muted-foreground" />
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">Upload image</p>
              <p className="text-xs text-muted-foreground">PNG, JPG up to 5MB</p>
            </div>
          </>
        )}
      </button>

      {preview && (
        <Button
          type="button"
          variant="outline"
          size="icon-xs"
          onClick={handleClear}
          className="absolute right-2 top-2"
          aria-label="Remove file"
        >
          <X />
        </Button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
