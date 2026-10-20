export type Profile = {
  id: string;
  full_name: string | null;
  created_at: string;
  postcode: string | null;
  preferred_stores: string[];
  onboarded_At: string | null;
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
  pack_size: number;
  created_at: string;
  updated_at: string;
  status: ItemStatus;
  unit: string | null;
  price: number | null;
  store: string | null;
  pack_price: number | null;
  low_stock_threshold: number;
};
