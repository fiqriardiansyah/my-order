export const SESSION_STATUS_CONFIG = {
  off:            { label: "OFF",      dot: "bg-gray-400" },
  free:           { label: "FREE",     dot: "bg-emerald-500" },
  open:           { label: "OCCUPIED", dot: "bg-red-500" },
  bill_requested: { label: "BILL",     dot: "bg-amber-500" },
  moved:          { label: "MOVED",    dot: "bg-yellow-500" },
} as const;

export const ORDER_STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  pending:   { label: "Pending",   className: "bg-yellow-100 text-yellow-800" },
  confirmed: { label: "Confirmed", className: "bg-blue-100 text-blue-800" },
  preparing: { label: "Preparing", className: "bg-orange-100 text-orange-800" },
  ready:     { label: "Ready",     className: "bg-green-100 text-green-800" },
  served:    { label: "Served",    className: "bg-gray-100 text-gray-600" },
  cancelled: { label: "Cancelled", className: "bg-red-100 text-red-800" },
};
