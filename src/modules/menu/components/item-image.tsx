export function ItemImage({ url, name }: { url: string | null; name: string }) {
  if (url) {
    return (
      <img
        src={url}
        alt={name}
        className="size-10 shrink-0 rounded-md object-cover"
      />
    );
  }
  return (
    <div className="bg-muted text-muted-foreground flex size-10 shrink-0 items-center justify-center rounded-md text-xs font-semibold uppercase">
      {name.slice(0, 2)}
    </div>
  );
}
