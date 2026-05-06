import { createContext, useContext, useState, type ReactNode } from "react";

type ShoppingSessionContextType = {
  activeStore: string | null;
  setActiveStore: (store: string | null) => void;
};

const ShoppingSessionContext = createContext<ShoppingSessionContextType>({
  activeStore: null,
  setActiveStore: () => {},
});

export const ShoppingSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [activeStore, setActiveStore] = useState<string | null>(null);

  return (
    <ShoppingSessionContext.Provider value={{ activeStore, setActiveStore }}>
      {children}
    </ShoppingSessionContext.Provider>
  );
};

export const useShoppingSession = () => useContext(ShoppingSessionContext);
