export type Profile = {
  id: string;
  full_name: string | null;
  created_at: string;
};

export type Inventory = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

export type ItemStatus = "ok" | "low" | "out";

export type Item = {
  id: string;
  inventory_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  low_stock_threshold: number;
  status: ItemStatus;
  store: string | null;
  price: number | null;
  created_at: string;
  updated_at: string;
};
