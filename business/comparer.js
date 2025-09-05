// бизнес-логика для сравнения JSON таблиц

export function parseJSON(text) {
  try {
    const json = JSON.parse(text);
    if (!Array.isArray(json)) {
      return { error: 'JSON должен быть массивом объектов' };
    }
    return { data: json };
  } catch (e) {
    return { error: 'Ошибка парсинга JSON: ' + e.message };
  }
}

// Получить все ключи из массива объектов
export function getAllKeys(arr) {
  const keys = new Set();
  arr.forEach(obj => {
    if (obj && typeof obj === 'object') {
      Object.keys(obj).forEach(k => keys.add(k));
    }
  });
  return Array.from(keys);
}

// Проверка равенства значений с учетом типов
export function valuesEqual(a, b) {
  if (a === b) return true;
  if (typeof a === 'number' && typeof b === 'string') return a.toString() === b;
  if (typeof b === 'number' && typeof a === 'string') return b.toString() === a;
  return false;
}

// Глубокое сравнение двух объектов по ключам
export function deepEqualObjects(obj1, obj2, keys) {
  for (const key of keys) {
    const val1Raw = obj1 && key in obj1 ? obj1[key] : '';
    let val1 = (val1Raw === null) ? 'null' :
               (val1Raw === undefined) ? '' :
               (typeof val1Raw === 'object') ? JSON.stringify(val1Raw) :
               val1Raw.toString();

    const val2Raw = obj2 && key in obj2 ? obj2[key] : '';
    let val2 = (val2Raw === null) ? 'null' :
               (val2Raw === undefined) ? '' :
               (typeof val2Raw === 'object') ? JSON.stringify(val2Raw) :
               val2Raw.toString();

    if (!valuesEqual(val1, val2)) return false;
  }
  return true;
}

