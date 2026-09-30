import { createContext, useContext, useState, type ReactNode } from "react";

type ShoppingSessionContextType = {
  activeStore: string | null;
  setActiveStore: (store: string | null) => void;
  checkedLowStock: Set<string>;
  setCheckedLowStock: React.Dispatch<React.SetStateAction<Set<string>>>;
};

const ShoppingSessionContext = createContext<ShoppingSessionContextType | undefined>(undefined);

export const ShoppingSessionProvider = ({
  children,
}: {
  children: ReactNode;
}) => {
  const [activeStore, setActiveStore] = useState<string | null>(null);
  const [checkedLowStock, setCheckedLowStock] = useState<Set<string>>(
    new Set(),
  );

  return (
    <ShoppingSessionContext.Provider
      value={{
        activeStore,
        setActiveStore,
        checkedLowStock,
        setCheckedLowStock,
      }}
    >
      {children}
    </ShoppingSessionContext.Provider>
  );
};

export const useShoppingSession = () => {
  const context = useContext(ShoppingSessionContext);
  if (!context) {
    throw new Error(
      "useShoppingSession must be used within a ShoppingSessionProvider",
    );
  }
  return context
}
