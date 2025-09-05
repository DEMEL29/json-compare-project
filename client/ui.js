import { parseJSON, getAllKeys, valuesEqual, deepEqualObjects } from '../business/comparer.js';

// Создание таблицы из массива данных и ключей
function createTable(data, keys) {
  const table = document.createElement('table');
  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  keys.forEach(k => {
    const th = document.createElement('th');
    th.textContent = k;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  data.forEach(row => {
    const tr = document.createElement('tr');
    keys.forEach(k => {
      const td = document.createElement('td');
      let val = (row && k in row) ? row[k] : '';
      if (val === null) val = 'null';
      else if (val === undefined) val = '';
      else if (typeof val === 'object') val = JSON.stringify(val);
      else val = val.toString();
      td.textContent = val;
      tr.appendChild(td);
    });
    tbody.appendChild(tr);
  });
  table.appendChild(tbody);
  return table;
}

// Отобразить сравнение по индексам с подсветкой различий
function renderCompareByIndex(data1, data2, allKeys, container) {
  const rowsCount = Math.max(data1.length, data2.length);

  const compTable = document.createElement('table');
  compTable.border = '1';

  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');
  trHead.appendChild(document.createElement('th'));
  allKeys.forEach(k => {
    const th1 = document.createElement('th');
    th1.textContent = k + ' (Таблица 1)';
    trHead.appendChild(th1);
    const th2 = document.createElement('th');
    th2.textContent = k + ' (Таблица 2)';
    trHead.appendChild(th2);
  });
  thead.appendChild(trHead);
  compTable.appendChild(thead);

  const tbody = document.createElement('tbody');

  data1.length = rowsCount; // расширение массива, если нужно
  data2.length = rowsCount;

  const rowStatuses = [];

  for (let i = 0; i < rowsCount; i++) {
    const tr = document.createElement('tr');
    const tdIndex = document.createElement('td');
    tdIndex.textContent = i + 1;
    tdIndex.style.fontWeight = 'bold';
    tr.appendChild(tdIndex);

    const row1 = data1[i];
    const row2 = data2[i];

    let status = '';
    if (row1 === undefined && row2 !== undefined) {
      status = 'added';
    } else if (row1 !== undefined && row2 === undefined) {
      status = 'deleted';
    } else if (row1 !== undefined && row2 !== undefined) {
      let changed = false;
      for (const key of allKeys) {
        const val1Raw = key in row1 ? row1[key] : '';
        let val1 = (val1Raw === null) ? 'null' :
                   (val1Raw === undefined) ? '' :
                   (typeof val1Raw === 'object') ? JSON.stringify(val1Raw) :
                   val1Raw.toString();

        const val2Raw = key in row2 ? row2[key] : '';
        let val2 = (val2Raw === null) ? 'null' :
                   (val2Raw === undefined) ? '' :
                   (typeof val2Raw === 'object') ? JSON.stringify(val2Raw) :
                   val2Raw.toString();

        if (!valuesEqual(val1, val2)) {
          changed = true;
          break;
        }
      }
      status = changed ? 'modified' : 'unchanged';
    }
    rowStatuses.push(status);

    allKeys.forEach(key => {
      const val1Raw = row1 && key in row1 ? row1[key] : '';
      let val1 = (val1Raw === null) ? 'null' :
                 (val1Raw === undefined) ? '' :
                 (typeof val1Raw === 'object') ? JSON.stringify(val1Raw) :
                 val1Raw.toString();

      const val2Raw = row2 && key in row2 ? row2[key] : '';
      let val2 = (val2Raw === null) ? 'null' :
                 (val2Raw === undefined) ? '' :
                 (typeof val2Raw === 'object') ? JSON.stringify(val2Raw) :
                 val2Raw.toString();

      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      td1.textContent = val1;
      td2.textContent = val2;

      if (valuesEqual(val1, val2)) {
        td1.classList.add('same-cell');
        td2.classList.add('same-cell');
      } else {
        td1.classList.add('diff-cell');
        td2.classList.add('diff-cell');
      }

      tr.appendChild(td1);
      tr.appendChild(td2);
    });

    tbody.appendChild(tr);
  }
  compTable.appendChild(tbody);

  const caption = document.createElement('caption');
  caption.textContent = 'Сравнение строк таблиц по индексам и ключам';
  compTable.prepend(caption);
  container.appendChild(compTable);

  return rowStatuses;
}

// Отобразить статусную таблицу по индексам
function renderStatusByIndex(data1, data2, allKeys, rowStatuses, container) {
  const rowsCount = rowStatuses.length;

  const statusTable = document.createElement('table');
  statusTable.border = '1';
  const statusThead = document.createElement('thead');
  const trStatusHead = document.createElement('tr');
  ['№', 'Строка в Таблице 1', 'Строка в Таблице 2', 'Статус'].forEach(text => {
    const th = document.createElement('th');
    th.textContent = text;
    trStatusHead.appendChild(th);
  });
  statusThead.appendChild(trStatusHead);
  statusTable.appendChild(statusThead);

  const statusTbody = document.createElement('tbody');

  for (let i = 0; i < rowsCount; i++) {
    const tr = document.createElement('tr');

    const tdIndex = document.createElement('td');
    tdIndex.textContent = i + 1;
    tr.appendChild(tdIndex);

    let row1 = data1[i];
    let strRow1 = '';
    if (row1 === undefined) {
      strRow1 = '—';
    } else {
      strRow1 = allKeys.map(k => {
        const val = (k in row1) ? row1[k] : '';
        if (val === null) return `${k}: null`;
        if (val === undefined) return `${k}:`;
        if (typeof val === 'object') return `${k}: ${JSON.stringify(val)}`;
        return `${k}: ${val}`;
      }).join(', ');
    }
    const tdRow1 = document.createElement('td');
    tdRow1.textContent = strRow1;
    tr.appendChild(tdRow1);

    let row2 = data2[i];
    let strRow2 = '';
    if (row2 === undefined) {
      strRow2 = '—';
    } else {
      strRow2 = allKeys.map(k => {
        const val = (k in row2) ? row2[k] : '';
        if (val === null) return `${k}: null`;
        if (val === undefined) return `${k}:`;
        if (typeof val === 'object') return `${k}: ${JSON.stringify(val)}`;
        return `${k}: ${val}`;
      }).join(', ');
    }
    const tdRow2 = document.createElement('td');
    tdRow2.textContent = strRow2;
    tr.appendChild(tdRow2);

    const tdStatus = document.createElement('td');
    let className = '';
    let statusText = '';
    switch(rowStatuses[i]) {
      case 'added':
        className = 'status-added';
        statusText = 'Добавлено';
        break;
      case 'deleted':
        className = 'status-deleted';
        statusText = 'Удалено';
        break;
      case 'modified':
        className = 'status-modified';
        statusText = 'Изменено';
        break;
      case 'unchanged':
        className = 'status-unchanged';
        statusText = 'Не изменено';
        break;
      default:
        statusText = '—';
    }
    tdStatus.textContent = statusText;
    tdStatus.classList.add(className);
    tr.appendChild(tdStatus);

    statusTbody.appendChild(tr);
  }

  statusTable.appendChild(statusTbody);

  const statusCaption = document.createElement('caption');
  statusCaption.textContent = 'Итоговый анализ строк и их статус по индексам';
  statusTable.prepend(statusCaption);
  container.appendChild(statusTable);
}

// Отобразить общую таблицу по ключу с результатом
function renderGlobalKeyCompare(data1, data2, allKeys, container) {
  const keyForJoin = allKeys[0];
  if (!keyForJoin) {
    const p = document.createElement('p');
    p.style.color = 'red';
    p.textContent = 'Невозможно построить общую таблицу, нет ключей для объединения.';
    container.appendChild(p);
    return;
  }

  const map1 = new Map();
  data1.forEach(row => {
    if (row && row[keyForJoin] !== undefined && row[keyForJoin] !== null) {
      map1.set(row[keyForJoin].toString(), row);
    }
  });
  const map2 = new Map();
  data2.forEach(row => {
    if (row && row[keyForJoin] !== undefined && row[keyForJoin] !== null) {
      map2.set(row[keyForJoin].toString(), row);
    }
  });

  const allKeysGlobalSet = new Set([...getAllKeys(data1), ...getAllKeys(data2)]);
  const allKeysGlobal = Array.from(allKeysGlobalSet);

  const unionKeys = new Set([...map1.keys(), ...map2.keys()]);

  const globTable = document.createElement('table');
  globTable.border = '1';

  const globThead = document.createElement('thead');
  const globTrHead = document.createElement('tr');

  globTrHead.appendChild(document.createElement('th'));
  allKeysGlobal.forEach(k => {
    const th1 = document.createElement('th');
    th1.textContent = k + ' (Таблица 1)';
    globTrHead.appendChild(th1);
    const th2 = document.createElement('th');
    th2.textContent = k + ' (Таблица 2)';
    globTrHead.appendChild(th2);
  });
  const thStatus = document.createElement('th');
  thStatus.textContent = 'Статус';
  globTrHead.appendChild(thStatus);

  globThead.appendChild(globTrHead);
  globTable.appendChild(globThead);

  const globTbody = document.createElement('tbody');

  unionKeys.forEach(k => {
    const tr = document.createElement('tr');

    const tdKey = document.createElement('td');
    tdKey.textContent = k;
    tdKey.style.fontWeight = 'bold';
    tr.appendChild(tdKey);

    const row1 = map1.get(k);
    const row2 = map2.get(k);

    let status = '';
    if (row1 === undefined && row2 !== undefined) {
      status = 'added';
    } else if (row1 !== undefined && row2 === undefined) {
      status = 'deleted';
    } else if (row1 !== undefined && row2 !== undefined) {
      const eq = deepEqualObjects(row1, row2, allKeysGlobal);
      status = eq ? 'unchanged' : 'modified';
    }

    allKeysGlobal.forEach(key => {
      const val1Raw = row1 && key in row1 ? row1[key] : '';
      let val1 = (val1Raw === null) ? 'null' :
                 (val1Raw === undefined) ? '' :
                 (typeof val1Raw === 'object') ? JSON.stringify(val1Raw) :
                 val1Raw.toString();

      const val2Raw = row2 && key in row2 ? row2[key] : '';
      let val2 = (val2Raw === null) ? 'null' :
                 (val2Raw === undefined) ? '' :
                 (typeof val2Raw === 'object') ? JSON.stringify(val2Raw) :
                 val2Raw.toString();

      const td1 = document.createElement('td');
      const td2 = document.createElement('td');
      td1.textContent = val1;
      td2.textContent = val2;

      if (valuesEqual(val1, val2)) {
        td1.classList.add('same-cell');
        td2.classList.add('same-cell');
      } else {
        td1.classList.add('diff-cell');
        td2.classList.add('diff-cell');
      }

      tr.appendChild(td1);
      tr.appendChild(td2);
    });

    const tdStatus = document.createElement('td');
    let className = '';
    let statusText = '';
    switch(status) {
      case 'added':
        className = 'status-added';
        statusText = 'Добавлено';
        break;
      case 'deleted':
        className = 'status-deleted';
        statusText = 'Удалено';
        break;
      case 'modified':
        className = 'status-modified';
        statusText = 'Изменено';
        break;
      case 'unchanged':
      default:
        className = 'status-unchanged';
        statusText = 'Не изменено';
    }
    tdStatus.textContent = statusText;
    tdStatus.classList.add(className);
    tr.appendChild(tdStatus);

    globTbody.appendChild(tr);
  });

  globTable.appendChild(globTbody);

  const globCaption = document.createElement('caption');
  globCaption.textContent = `Общая таблица сравнения по ключу "${keyForJoin}" с результатом`;
  globTable.prepend(globCaption);
  container.appendChild(globTable);
}

// Отобразить общую таблицу всех строк с колонкой "Таблица" и статусом
function renderAllRowsTable(data1, data2, allKeys, container) {
  const keyForJoin = allKeys[0];
  if (!keyForJoin) {
    const p = document.createElement('p');
    p.style.color = 'red';
    p.textContent = 'Невозможно построить общую таблицу, нет ключей для объединения.';
    container.appendChild(p);
    return;
  }

  const map1 = new Map();
  data1.forEach(row => {
    if (row && row[keyForJoin] !== undefined && row[keyForJoin] !== null) {
      map1.set(row[keyForJoin].toString(), row);
    }
  });
  const map2 = new Map();
  data2.forEach(row => {
    if (row && row[keyForJoin] !== undefined && row[keyForJoin] !== null) {
      map2.set(row[keyForJoin].toString(), row);
    }
  });

  const allRowsTable = document.createElement('table');
  allRowsTable.border = '1';

  const allRowsThead = document.createElement('thead');
  const trAllRowsHead = document.createElement('tr');

  const thTable = document.createElement('th');
  thTable.textContent = 'Таблица';
  trAllRowsHead.appendChild(thTable);

  allKeys.forEach(k => {
    const th = document.createElement('th');
    th.textContent = k;
    trAllRowsHead.appendChild(th);
  });

  const thStatus = document.createElement('th');
  thStatus.textContent = 'Статус';
  trAllRowsHead.appendChild(thStatus);

  allRowsThead.appendChild(trAllRowsHead);
  allRowsTable.appendChild(allRowsThead);

  const allRowsTbody = document.createElement('tbody');

  map1.forEach((row1, key) => {
    const row2 = map2.get(key);
    let status = '';
    if (row2 === undefined) {
      status = 'deleted';
    } else {
      const eq = deepEqualObjects(row1, row2, allKeys);
      status = eq ? 'unchanged' : 'modified';
    }

    const tr = document.createElement('tr');

    const tdTable = document.createElement('td');
    tdTable.textContent = '1';
    tr.appendChild(tdTable);

    allKeys.forEach(k => {
      const valRaw = k in row1 ? row1[k] : '';
      let val = (valRaw === null) ? 'null' :
                (valRaw === undefined) ? '' :
                (typeof valRaw === 'object') ? JSON.stringify(valRaw) :
                valRaw.toString();

      const td = document.createElement('td');
      td.textContent = val;

      if (row2) {
        const val2Raw = k in row2 ? row2[k] : '';
        let val2 = (val2Raw === null) ? 'null' :
                   (val2Raw === undefined) ? '' :
                   (typeof val2Raw === 'object') ? JSON.stringify(val2Raw) :
                   val2Raw.toString();
        if (!valuesEqual(val, val2)) {
          td.classList.add('diff-cell');
        } else {
          td.classList.add('same-cell');
        }
      } else {
        td.classList.add('diff-cell');
      }
      tr.appendChild(td);
    });

    const tdStatus = document.createElement('td');
    let className = '';
    let statusText = '';
    switch(status) {
      case 'deleted':
        className = 'status-deleted';
        statusText = 'Удалено';
        break;
      case 'modified':
        className = 'status-modified';
        statusText = 'Изменено';
        break;
      case 'unchanged':
        className = 'status-unchanged';
        statusText = 'Не изменено';
        break;
    }
    tdStatus.textContent = statusText;
    tdStatus.classList.add(className);
    tr.appendChild(tdStatus);

    allRowsTbody.appendChild(tr);
  });

  map2.forEach((row2, key) => {
    if (!map1.has(key)) {
      const tr = document.createElement('tr');

      const tdTable = document.createElement('td');
      tdTable.textContent = '2';
      tr.appendChild(tdTable);

      allKeys.forEach(k => {
        const valRaw = k in row2 ? row2[k] : '';
        let val = (valRaw === null) ? 'null' :
                  (valRaw === undefined) ? '' :
                  (typeof valRaw === 'object') ? JSON.stringify(valRaw) :
                  valRaw.toString();

        const td = document.createElement('td');
        td.textContent = val;
        td.classList.add('diff-cell');
        tr.appendChild(td);
      });

      const tdStatus = document.createElement('td');
      tdStatus.textContent = 'Добавлено';
      tdStatus.classList.add('status-added');
      tr.appendChild(tdStatus);

      allRowsTbody.appendChild(tr);
    }
  });

  allRowsTable.appendChild(allRowsTbody);

  const allRowsCaption = document.createElement('caption');
  allRowsCaption.textContent = 'Общая таблица со всеми строками и статусом по таблицам';
  allRowsTable.prepend(allRowsCaption);
  container.appendChild(allRowsTable);
}

// Главная функция обработки UI
function onCompare() {
  const input1 = document.getElementById('json1').value.trim();
  const input2 = document.getElementById('json2').value.trim();

  const container1 = document.getElementById('table1');
  const container2 = document.getElementById('table2');
  const compContainer = document.getElementById('comparisonResult');
  const statusContainer = document.getElementById('statusResult');
  const globalContainer = document.getElementById('globalResult');
  const allRowsContainer = document.getElementById('allRowsResult');

  container1.innerHTML = '';
  container2.innerHTML = '';
  compContainer.innerHTML = '';
  statusContainer.innerHTML = '';
  globalContainer.innerHTML = '';
  allRowsContainer.innerHTML = '';

  if (!input1 || !input2) {
    compContainer.textContent = 'Пожалуйста, вставьте JSON в оба поля.';
    return;
  }

  const parsed1 = parseJSON(input1);
  if (parsed1.error) {
    compContainer.textContent = 'Ошибка в JSON таблицы 1:\n' + parsed1.error;
    return;
  }

  const parsed2 = parseJSON(input2);
  if (parsed2.error) {
    compContainer.textContent = 'Ошибка в JSON таблицы 2:\n' + parsed2.error;
    return;
  }

  const keys1 = getAllKeys(parsed1.data);
  const keys2 = getAllKeys(parsed2.data);
  const allKeysSet = new Set([...keys1, ...keys2]);
  const allKeys = Array.from(allKeysSet);

  const tableEl1 = createTable(parsed1.data, allKeys);
  const tableEl2 = createTable(parsed2.data, allKeys);

  container1.appendChild(tableEl1);
  container2.appendChild(tableEl2);

  // Сравнение по индексам и вывод с подсветкой
  const rowStatuses = renderCompareByIndex(parsed1.data, parsed2.data, allKeys, compContainer);

  // Таблица статусов
  renderStatusByIndex(parsed1.data, parsed2.data, allKeys, rowStatuses, statusContainer);

  // Общая таблица по ключу
  renderGlobalKeyCompare(parsed1.data, parsed2.data, allKeys, globalContainer);

  // Общая таблица всех строк с признаком таблицы
  renderAllRowsTable(parsed1.data, parsed2.data, allKeys, allRowsContainer);
}

document.getElementById('compareBtn').addEventListener('click', onCompare);

export {
  createTable,
  renderCompareByIndex,
  renderStatusByIndex,
  renderGlobalKeyCompare,
  renderAllRowsTable,
  onCompare
};
