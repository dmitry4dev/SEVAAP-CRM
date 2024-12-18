import Chart from 'chart.js/auto';
import { setChildren, el } from 'redom';
import { getKeitaroApi, getCrossgifGgSheet, getFbGgSheet } from '../utils/api';
import createSelectForm from '../utils/createSelectForm';
import reduceObjects from '../utils/reduceObjects';
import { concateData } from './buyersPage';
import { mergeObjects } from '../utils/mergeObjects';
import dataJson from '../db/data.json';
import '../css/dashboardpage.css';

export default async function dashboardPage() {
  const wrapper = el('div.dashboard-page-wrapper.wrapper');
  const inner = el('div.inner-container');
  const canvas = el('canvas.dashboard__canvas', { id: 'profit-canvas' });
  const graphForm = createSelectForm('dashboard-form').form;
  const costForm = createSelectForm('dashboard-form').form;
  const spendForm = createSelectForm('dashboard-form').form;
  const bestBuyersData = await concateData('1_month_ago');
  const crossgifSheet = await getCrossgifGgSheet();
  const fbSheet = await getFbGgSheet();
  const costsForGraph = mergeObjects(fbSheet.fbObjectSpends, crossgifSheet.cgObjectSpends);
  const costsTableArr = [fbSheet.fbObjectSpends, crossgifSheet.cgObjectSpends];

  const observer = new MutationObserver(async () => {
    if (document.location.pathname === '/dashboard') {
      profitGraph(canvas, costsForGraph, 'today');
      observer.disconnect();
    }
  });

  observer.observe(document.body, { subtree: true, childList: true });

  setChildren(inner, [
    el('div.inner-wrapper', [
      el('h3.dashboard__subtitle', 'Доход/Расход'),
      canvas,
      graphForm
    ]),
    el('div.inner-wrapper', [
      el('h3.dashboard__subtitle', 'Лучшие покупатели:'),
      createBestBuyersTable(bestBuyersData),
    ]),
    el('div.inner-wrapper', [
      el('h3.dashboard__subtitle', 'Затраты'),
      createCostsTable(costsTableArr, 'today'),
      costForm
    ]),
    el('div.inner-wrapper', [
      el('h3.dashboard__subtitle', 'Расходы'),
      createTable(dataJson.spend.spend_agent_cost, 4, 'spend-table'),
      spendForm
    ])
  ]);

  setChildren(wrapper, [
    el('h1.dashboard__title.page-title', 'Главная'),
    inner,
    el('div.outer-wrapper', [
      el('h3.dashboard__subtitle', 'Ожидаемая прибыль'),
      createTable(dataJson.awaiting_data.whithdraws, 3, 'withdrawl-table')
    ])
  ]);

  graphForm.addEventListener('submit', (e) => {
    e.preventDefault();

    [...graphForm.elements].forEach(elem => {
      if (elem.value) {
        switch (elem.value) {
          case 'today':
            profitGraph(canvas, costsForGraph, elem.value);
            break;
          case '7_days_ago':
            profitGraph(canvas, costsForGraph, elem.value);
            break;
          case '1_month_ago':
            profitGraph(canvas, costsForGraph, elem.value);
            break;
        }
      }
    });
  });

  costForm.addEventListener('submit', (e) => {
    e.preventDefault();

    [...costForm.elements].forEach(elem => {
      if (elem.value) {
        switch (elem.value) {
          case 'today':
            console.log('coso', costsTableArr, elem.value)
            document.querySelector('.cost-table').replaceWith(
              createCostsTable(costsTableArr, elem.value)
            );
            break;
          case '7_days_ago':
            console.log('coso', costsTableArr, elem.value)
            document.querySelector('.cost-table').replaceWith(
              createCostsTable(costsTableArr, elem.value)
            );
            break;
          case '1_month_ago':
            console.log('coso', costsTableArr, elem.value)
            document.querySelector('.cost-table').replaceWith(
              createCostsTable(costsTableArr, elem.value)
            );
            break;
        }
      }
    });
  });

  return wrapper;
}

function createCostsTable(dataArr, period) {
  const table = el(`table.cost-table.table`);

  for (let i = 0; i < dataArr.length; ++i) {
    const tableRow = el('tr.table__row', el('td.table__cell', `${dataArr[i].agent}`));
    const tableCell = el('td.table__cell');
    let minus = '';

    switch (period) {
      case 'today':
        reduceArr(dataArr[i].daySpends) > 0 ? minus = '-' : '';
        tableCell.textContent = `${minus} ${Number(Math.round(reduceArr(dataArr[i].daySpends)))} $`;
        break;
      case '7_days_ago':
        reduceArr(dataArr[i].weekSpends) > 0 ? minus = '-' : '';
        tableCell.textContent = `${minus} ${Number(Math.round(reduceArr(dataArr[i].weekSpends)))} $`;
        break;
      case '1_month_ago':
        reduceArr(dataArr[i].monthSpends) > 0 ? minus = '-' : '';
        tableCell.textContent = `${minus} ${Number(Math.round(reduceArr(dataArr[i].monthSpends)))} $`;
        break;
    }
    tableRow.appendChild(tableCell);
    table.appendChild(tableRow);
  }
  return table;
}

function createBestBuyersTable(dataArr) {
  const table = el(`table.best-buyers-table.table.`);

  const sortedArr = [...dataArr].sort((a, b) => b.profit - a.profit);

  for (let i = 0; i < sortedArr.length; ++i) {
    if (sortedArr[i].profit && sortedArr[i].profit > 0) {
      const tableRow = el('tr.table__row', [
        el('td.table__cell', `${sortedArr[i].campaign_group}`),
        el('td.table__cell', `+ ${Math.round(sortedArr[i].profit)} $`)
      ]);
      table.appendChild(tableRow);
    }
  }
  return table;
}

let chart;

async function profitGraph(canv, costArr, period) {
  const keitaroData = await getKeitaroApi(period);
  const profitsForGraph = [];
  const ctx = canv.getContext('2d');

  keitaroData.rows.forEach(obj => obj.revenue ? profitsForGraph.push(Math.round(obj.revenue)) : '');

  let costsForGraph = [];
  let data = 0;
  let configuration = 0;

  switch (period) {
    case 'today':
      costsForGraph = costArr.daySpends;
      break;
    case '7_days_ago':
      costsForGraph = costArr.weekSpends;
      break;
    case '1_month_ago':
      costsForGraph = costArr.monthSpends;
      break;
  }

  const arrayOfLabels = [];

  const startTime = new Date('2024-11-02T22:00:00.082Z');
  const endTime = new Date('2024-11-03T22:00:00.082Z');
  const timeArr = getDatesArray(startTime, endTime);

  for (const i in timeArr) {
    const item = `${timeArr[i]}ч`;
    arrayOfLabels.push(item);
  }

  if (profitsForGraph.length < arrayOfLabels.length) {
    arrayOfLabels.length = profitsForGraph.length;
  } else {
     const diff = profitsForGraph.length - arrayOfLabels.length;

     for (let i = 0; i < diff; ++i) {

       const item = arrayOfLabels[arrayOfLabels.length - 1];
       arrayOfLabels.push(item + 1);
     }
  }

  data = {
    labels: arrayOfLabels,
    datasets: [{
      label: 'Расходы',
      data: costsForGraph,
      backgroundColor: 'rgba(255, 99, 132, .7)',
      borderColor: 'rgba(255, 99, 132, .7)',
      borderWidth: 2,
      fill: false,
      yAxisID: 'cost',
    },
    {
      label: 'Доходы',
      data: profitsForGraph,
      backgroundColor: 'rgba(25, 219, 83, 1)',
      borderColor: 'rgba(25, 219, 83, 1)',
      borderWidth: 3,
      fill: false,
      yAxisID: 'sales',
    }
    ]
  },

    configuration = {
      type: 'line',
      data: data,
      options: {
        responsive: true,
        scales: {
          x: {
            display: false,
          },
          cost: {
            type: 'linear',
            display: true,
            position: 'left',
            beginAtZero: true,
            ticks: {
              color: 'rgb(247, 24, 24)'
            }
          },
          sales: {
            type: 'linear',
            display: true,
            position: 'right',
            beginAtZero: true, // Начало оси y не с нуля, поскольку данные отражают температуру
            grid: {
              drawOnChartArea: false, // Показывает только у одного графика линии на заднем фоне
            },
            ticks: {
              color: 'rgb(7, 155, 51)'
            }
          }
        },
      },
    };

  if (chart) {
    chart.destroy();
    chart = new Chart(ctx, configuration);
  } else {
    chart = new Chart(ctx, configuration);
  }
}

function reduceArr(arr) {
  let concatedArr = Array.from(arr.toString().split(','));

  concatedArr = concatedArr.filter(arr => arr !== '').reduce((prev, curr) => {
    return parseFloat(prev) + parseFloat(curr);
  }, 0);

  return concatedArr;
}

const getDatesArray = (start, end) => {
  const arr = [];

  while (start <= end) {
    arr.push(new Date(start).toLocaleTimeString('ru-RU', { hour: '2-digit' }));
    start.setHours(start.getHours() + 1);
  }
  return arr;
};

function createTable(dataArray, colCount, className) {
  const table = el(`table.dashboard__table.table.${className}`);

  switch (colCount && className) {
    case 2, 'cost-table':
      setChildren(table, [
        dataArray.map(data => el(
          'tr.table__row',
          el('td.table__cell', `${data.agent_name}`),
          el('td.table__cell', `- ${data.agent_cost} $`)
        )),
      ]);
      // console.log('COST', dataArray)
      break;

    // case 3, 'buyers-table':
    //   setChildren(table, [
    //     dataArray.map(data => el(
    //       'tr.table__row',
    //       el('td.table__cell', `${data.group}`),
    //       el('td.table__cell', `+ ${data.sales_revenue} $`),
    //       el('td.table__cell', `${data.date ? new Date(data.date).toLocaleDateString() : ''}`)
    //     )),
    //   ]);
    //   break;
    case 3, 'withdrawl-table':
      setChildren(table, [
        dataArray.map(data => el(
          'tr.table__row',
          el('td.table__cell', `${data.withdraw_name}`),
          el('td.table__cell', `${data.withdraw_amount} $`),
          el('td.table__cell', `${data.date ? new Date(data.date).toLocaleDateString() : ''}`)
        )),
      ]);
      // console.log('WITHDRW', dataArray)
      break;
    case 4, 'spend-table':
      setChildren(table, [
        dataArray.map(data => el(
          'tr.table__row',
          el('td.table__cell', `${data.group}`),
          el('td.table__cell', `${data.spend_agent}`),
          el('td.table__cell', `${data.spend_cost} $`),
          el('td.table__cell', `${data.date ? new Date(data.date).toLocaleDateString() : ''}`)
        )),
      ]);
      // console.log('SPEND', dataArray)
      break;
  }

  return table;
}

const time = Array.from({ length: 24 }, (n, i) => {
  const d = new Date(0, 0, 0, 0, 60 * i);
  return d.toLocaleTimeString('ru-RU', { hour: '2-digit' });
});
