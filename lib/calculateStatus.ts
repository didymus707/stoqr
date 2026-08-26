export const calculateStatus = (
  qty: number,
  thresh: number,
): "ok" | "low" | "out" => {
  if (qty <= 0) return "out";
  if (qty <= thresh) return "low";
  return "ok";
};
