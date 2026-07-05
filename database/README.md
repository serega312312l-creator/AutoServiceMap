# База даних AVTOGID (Україна)

Структурована база всіх авто-локацій України з OpenStreetMap.

## Файли

| Файл | Опис |
|------|------|
| `autoservice_ukraine.db` | SQLite база (основне сховище) |
| `exports/places.json` | JSON експорт усіх записів |
| `exports/stats.json` | Статистика по категоріях та областях |
| `exports/categories.json` | Довідник категорій |
| `categories.json` | Категорії (source of truth) |
| `regions.json` | 27 областей України |
| `schema.sql` | SQL-схема |
| `cache/tiles/` | Кеш сирих відповідей OSM |

## Категорії

- `sto` — СТО / ремонт авто
- `autoshop` — автомагазини / запчастини
- `tires` — шини
- `car_dealer` — автосалони
- `car_wash` — автомийки
- `fuel` — АЗС
- `ev_charging` — зарядні станції
- `diagnostics` — діагностика / ТО
- `towing` — евакуатор
- `body_shop` — кузовний ремонт
- `motorcycle` — мото-сервіс
- `truck_service` — вантажівки
- `parking` — паркінг
- `other_auto` — інші авто-послуги

## Структура таблиці `places`

```
id, osm_type, osm_id, name, category_id, subcategory,
latitude, longitude, street, housenumber, city, district,
region_id, region_name, postal_code, full_address,
phone, email, website, opening_hours, brand, operator,
wheelchair, services_json, tags_json, source, created_at, updated_at
```

## Збірка

```bash
npm run build:db
```

Скрипт:
1. Завантажує дані по **27 областях** України (Overpass API / OSM)
2. Класифікує кожну точку в 14 категорій
3. Записує в SQLite + JSON
4. Копіює JSON у `assets/data/places.json` для мобільного застосунку

## Джерело

OpenStreetMap © contributors, ODbL 1.0
