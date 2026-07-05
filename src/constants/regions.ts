export interface UkraineRegion {
  id: string;
  name: string;
  center: { latitude: number; longitude: number };
}

export const UKRAINE_REGIONS: UkraineRegion[] = [
  { id: "kyiv", name: "Київська", center: { latitude: 50.45, longitude: 30.52 } },
  { id: "lviv", name: "Львівська", center: { latitude: 49.84, longitude: 24.03 } },
  { id: "odesa", name: "Одеська", center: { latitude: 46.48, longitude: 30.73 } },
  { id: "kharkiv", name: "Харківська", center: { latitude: 49.99, longitude: 36.23 } },
  { id: "dnipro", name: "Дніпропетровська", center: { latitude: 48.46, longitude: 35.05 } },
  { id: "zaporizhzhia", name: "Запорізька", center: { latitude: 47.84, longitude: 35.14 } },
  { id: "vinnytsia", name: "Вінницька", center: { latitude: 49.23, longitude: 28.47 } },
  { id: "poltava", name: "Полтавська", center: { latitude: 49.59, longitude: 34.55 } },
  { id: "chernihiv", name: "Чернігівська", center: { latitude: 51.5, longitude: 31.29 } },
  { id: "sumy", name: "Сумська", center: { latitude: 50.91, longitude: 34.8 } },
  { id: "zhytomyr", name: "Житомирська", center: { latitude: 50.25, longitude: 28.66 } },
  { id: "rivne", name: "Рівненська", center: { latitude: 50.62, longitude: 26.25 } },
  { id: "ternopil", name: "Тернопільська", center: { latitude: 49.55, longitude: 25.59 } },
  { id: "ivano-frankivsk", name: "Івано-Франківська", center: { latitude: 48.92, longitude: 24.71 } },
  { id: "chernivtsi", name: "Чернівецька", center: { latitude: 48.29, longitude: 25.94 } },
  { id: "khmelnytskyi", name: "Хмельницька", center: { latitude: 49.42, longitude: 27.0 } },
  { id: "volyn", name: "Волинська", center: { latitude: 50.75, longitude: 25.34 } },
  { id: "mykolaiv", name: "Миколаївська", center: { latitude: 46.97, longitude: 32.0 } },
  { id: "kherson", name: "Херсонська", center: { latitude: 46.64, longitude: 32.62 } },
  { id: "cherkasy", name: "Черкаська", center: { latitude: 49.44, longitude: 32.06 } },
  { id: "kropyvnytskyi", name: "Кіровоградська", center: { latitude: 48.51, longitude: 32.26 } },
  { id: "donetsk", name: "Донецька", center: { latitude: 48.0, longitude: 37.8 } },
  { id: "luhansk", name: "Луганська", center: { latitude: 48.57, longitude: 39.32 } },
];
