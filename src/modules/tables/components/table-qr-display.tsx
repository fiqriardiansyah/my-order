import { forwardRef } from "react";
import QRCode from "react-qr-code";
import { QrCode } from "lucide-react";

type Props = {
  qrUrl: string | null;
  size?: number;
};

const TableQRDisplay = forwardRef<HTMLDivElement, Props>(
  ({ qrUrl, size = 180 }, ref) => {
    return (
      <div
        ref={ref}
        className="flex items-center justify-center rounded-lg border bg-white p-4"
      >
        {qrUrl ? (
          <QRCode value={qrUrl} size={size} />
        ) : (
          <QrCode
            className="text-muted-foreground/30"
            style={{ width: size, height: size }}
          />
        )}
      </div>
    );
  },
);

TableQRDisplay.displayName = "TableQRDisplay";

export { TableQRDisplay };
