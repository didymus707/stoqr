export const getUnitLabel = (quantity: number, unit: string): string => {
  if (quantity === 1) return unit;

  const plurals: Record<string, string> = {
    box: "boxes",
    loaf: "loaves",
    pc: "pcs",
    litre: "litres",
  };

  // Metric abbreviations (kg, g, ml) don't typically change
  const staysSingular = ["kg", "g", "ml"];

  if (staysSingular.includes(unit)) return unit;

  return plurals[unit] || `${unit}s`;
};

export const passwordRegex =
  /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;

export const passwordRequirementMessage =
  "Weak Password. \nYour password must have 8+ characters, uppercase, lowercase, number, and special character";
