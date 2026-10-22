const plurals: Record<string, string> = {
  pc: "pcs",
  roll: "rolls",
  bar: "bars",
  bottle: "bottles",
  can: "cans",
  bag: "bags",
  box: "boxes",
  loaf: "loaves",
};

export const unitLabel = (count: number, unit: string | null) => {
  if (!unit) return "";
  if (count == 1) return unit;
  return plurals[unit] ?? unit;
};

export const perUnitText = (
  packPrice: number,
  packSize: number,
  unit: string | null,
) =>
  packSize > 0
    ? `£${(packPrice / packSize).toFixed(2)} per ${unit ?? "item"}`
    : null;
