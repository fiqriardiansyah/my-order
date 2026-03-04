import { createContext, useContext } from "react";

interface SidebarInsetSize {
  width: number;
  height: number;
}

const SidebarInsetSizeContext = createContext<SidebarInsetSize>({
  width: 0,
  height: 0,
});

export function useSidebarInsetSize() {
  return useContext(SidebarInsetSizeContext);
}

interface Props {
  children: React.ReactNode;
  size: SidebarInsetSize;
}

export function SidebarInsetSizeProvider({ children, size }: Props) {
  return (
    <SidebarInsetSizeContext.Provider value={size}>
      {children}
    </SidebarInsetSizeContext.Provider>
  );
}
