import { setChildren, el } from 'redom';
import { getKeitaroApi, getCrossgifGgSheet, getFbGgSheet } from '../utils/api';
import reduceObjects from '../utils/reduceObjects';
import createSelectForm from '../utils/createSelectForm';
import preloader from '../utils/preloader';
import '../css/buyerspage.css';

export default async function buyersPage() {
  const wrapper = el('div.buyers-page-wrapper.wrapper');
  const form = createSelectForm('buyers-form').form;
  const loader = preloader();

  let mainData = await concateData('today');

  function createBuyersTable(arr, cellCount) {
    const table = el('table.buyers__table.buyers-table.table');
    const thead = el('thead.buyers-table__head');
    const tbody = el('tbody.buyers-table__tbody');
    const nums = [];
    const headCells = [];
    const bodyCells = [];

    for (let i = 0; i < cellCount; ++i) {
      nums.push(i);
    }

    if (arr.length) {
      for (let j = 0; j < Object.keys(arr[0]).length; ++j) {
        const theadCell = el('th.buyers-table__th.table__th', `${Object.keys(arr[0])[nums[0]]}`);
        headCells.push(theadCell);
        nums.shift();
      }
      const tableRow = el('tr.buyers-table__row');
      for (const cell of headCells) {
        tableRow.appendChild(cell);
      }
      for (let i = 0; i < cellCount; ++i) {
        nums.push(i);
      }
      thead.append(tableRow);
      headCells.length = 0;

      firstLoop: for (let i = 0; i < arr.length; ++i) {
        for (let j = 0; j < Object.keys(arr[i]).length; ++j) {
          const tbodyCell = el('td.buyers-table__cell.table__cell', `${typeof Object.values(arr[i])[nums[0]] === 'number' ?
            Object.values(arr[i])[nums[0]] + ' $' :
            Object.values(arr[i])[nums[0]]
            }`);
          tbodyCell.textContent.includes('-') ? tbodyCell.style.color = 'red' : '';
          bodyCells.push(tbodyCell);
          nums.shift();
        }
        const tableRow = el('tr.buyers-table__row.table__row');
        for (const cell of bodyCells) {
          tableRow.appendChild(cell);
        }
        for (let i = 0; i < cellCount; ++i) {
          nums.push(i);
        }
        tbody.appendChild(tableRow);
        bodyCells.length = 0;
      }
    }
    table.innerHTML = '';
    setChildren(table, [thead, tbody]);

    return table;
  }

  setChildren(wrapper, [
    el('h1.buyres__title.page-title', 'Баеры'),
    form,
    createBuyersTable(mainData, Object.keys(mainData[0]).length),
  ]);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const block = el('div.table-wrapper');
    const rect = document.querySelector('.buyers__table').getBoundingClientRect();

    block.style.width = rect.width;
    block.style.height = rect.height;
    loader.style.position = 'absolute';
    block.prepend(loader);
    document.querySelector('.buyers__table').prepend(block);

    [...form.elements].forEach(async elem => {
      if (elem.value) {
        switch (elem.value) {
          case 'today':
            mainData = await concateData(elem.value);
            document.querySelector('.buyers__table').replaceWith(
              createBuyersTable(mainData, Object.keys(mainData[0]).length)
            );
            break;
          case '7_days_ago':
            mainData = await concateData(elem.value);
            document.querySelector('.buyers__table').replaceWith(
              createBuyersTable(mainData, Object.keys(mainData[0]).length)
            );
            break;
          case '1_month_ago':
            mainData = await concateData(elem.value);
            document.querySelector('.buyers__table').replaceWith(
              createBuyersTable(mainData, Object.keys(mainData[0]).length)
            );
            break;
        }
      }
    });
  });

  return wrapper;
}

export async function concateData(period) {
  const crossgifSheet = await getCrossgifGgSheet();
  const fbSheet = await getFbGgSheet();
  const dataFromCgGgSheet = crossgifSheet.cgObjectsArr;
  const dataFromFbGgSheet = fbSheet.fbObjectsArr;
  const dataFromKeitaro = await getKeitaroApi(period);
  const concatedSheets = dataFromCgGgSheet.concat(dataFromFbGgSheet);
  const reducedSheets = reduceObjects(concatedSheets);
  const totalArr = [];

  dataFromKeitaro.rows.forEach(function (object) {
    reducedSheets.forEach(function (obj) {
      if (obj.campaign_group === object.campaign_group) {
        const newObj = Object.assign(object, obj);

        switch (period) {
          case 'today':
            delete newObj.weekSpend;
            delete newObj.monthSpend;

            renameObjKey(newObj, 'spend', 'daySpend');
            break;
          case '7_days_ago':
            delete newObj.daySpend;
            delete newObj.monthSpend;

            renameObjKey(newObj, 'spend', 'weekSpend');
            break;
          case '1_month_ago':
            delete newObj.daySpend;
            delete newObj.weekSpend;

            renameObjKey(newObj, 'spend', 'monthSpend');
            break;
        }
        newObj.profit = newObj.revenue - newObj.spend;
        newObj.profit = Number(Math.fround(parseFloat(newObj.profit)).toFixed(2));
        newObj.uepc = Number(Math.fround(newObj.uepc).toFixed(2));
        newObj.roi = calculateRoi(newObj.revenue, newObj.spend);
        totalArr.push(newObj);
      }
    });
  });

  return totalArr;
}

function renameObjKey(obj, newKey, oldKey) {
  Object.defineProperty(
    obj,
    `${newKey}`,
    Object.getOwnPropertyDescriptor(obj, `${oldKey}`)
  );
  delete obj[`${oldKey}`];
}

function calculateRoi(rev, spd) {
  let roi;
  rev = Math.round(rev);
  spd = Math.round(spd);

  if (spd === 0) {
    roi = 0;
  } else {
    roi = (rev - spd) / spd * 100
  }

  return `${Math.round(roi)} %`;
}

