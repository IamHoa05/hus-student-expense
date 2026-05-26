// Central category -> material symbol mapping
const ICON_MAP: Record<string, string> = {
  "Ăn uống": "restaurant",
  "Di chuyển": "directions_car",
  "Học tập": "school",
  "Lương": "payments",
  "Thưởng": "paid",
  "Tiền tiêu vặt": "savings",
  "Khác": "category",
};

export function getCategoryIcon(categoryName?: string) {
  if (!categoryName) return "category";
  return ICON_MAP[categoryName] || "category";
}

export default ICON_MAP;
