export const INSURANCE_CHECKLIST = [
  { id: "safe", label: "Переконайтесь у безпеці — аварійка, знак", done: false },
  { id: "112", label: "За потреби викличте 102 / 103 / 112", done: false },
  { id: "photos", label: "Зробіть фото місця, пошкоджень, номерів", done: false },
  { id: "witnesses", label: "Запишіть свідків та їх контакти", done: false },
  { id: "police", label: "Викличте поліцію (якщо є постраждалі або спір)", done: false },
  { id: "insurance", label: "Повідомте страхову компанію", done: false },
  { id: "location", label: "Зафіксуйте координати (AVTOGID зробить це)", done: false },
  { id: "tow", label: "Замовте евакуатор за потреби", done: false },
] as const;
