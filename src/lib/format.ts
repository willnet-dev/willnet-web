// Números con el formato de cada idioma (1.3 en inglés, 1,3 en español). Lo usan las páginas (valor final)
// y site.ts mientras las cifras cuentan, con los mismos decimales que el valor final (data-count).
export const decimalsOf = (value: number | string) => (String(value).split(".")[1] ?? "").length;

export const formatNumber = (value: number, lang: string, decimals = decimalsOf(value)) =>
  value.toLocaleString(lang, { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
