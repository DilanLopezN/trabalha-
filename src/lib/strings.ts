export function removeDiacritics(value: string) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizeCityName(value: string) {
  return removeDiacritics(value).trim();
}
