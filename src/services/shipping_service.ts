export type ShippingMode = "fixed" | "region";

const FIXED_SHIPPING_VALUE = 15;

type RegionRule = {
  min: number;
  max: number;
  region: string;
  shipping: number;
};

const REGION_RULES: RegionRule[] = [
  { min: 0, max: 1, region: "Sudeste", shipping: 12 },
  { min: 2, max: 3, region: "Sul", shipping: 18 },
  { min: 4, max: 5, region: "Nordeste", shipping: 25 },
  { min: 6, max: 6, region: "Centro-Oeste", shipping: 22 },
  { min: 7, max: 9, region: "Norte", shipping: 30 },
];

function normalizeCep(cep: string) {
  return cep.replace(/\D/g, "").slice(0, 8);
}

export const shippingService = {
  getFixedShippingValue() {
    return FIXED_SHIPPING_VALUE;
  },

  calculateByCep(cep: string) {
    const cleanCep = normalizeCep(cep);

    if (cleanCep.length < 8) {
      return {
        cep: cleanCep,
        region: "Não identificada",
        shipping: FIXED_SHIPPING_VALUE,
      };
    }

    const firstDigit = Number(cleanCep[0]);
    const rule = REGION_RULES.find((item) => firstDigit >= item.min && firstDigit <= item.max);

    if (!rule) {
      return {
        cep: cleanCep,
        region: "Não identificada",
        shipping: FIXED_SHIPPING_VALUE,
      };
    }

    return {
      cep: cleanCep,
      region: rule.region,
      shipping: rule.shipping,
    };
  },
};
