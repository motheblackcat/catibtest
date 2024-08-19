import { CURRENCIES } from "../enums/currencies.enum";

export interface Conversion {
    rate: number,
    fixedRate: number,
    amount: number,
    selectedCurrency: CURRENCIES,
    convertedAmount: number,
    convertedCurrency: CURRENCIES
  }