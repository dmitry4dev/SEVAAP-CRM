import Chart from 'chart.js/auto';
import { setChildren, el } from 'redom';
import dataJson from '../utils/data.json';
import '../css/dashboardpage.css';

export default function dashboardPage() {
  const time = Array.from({ length: 24 }, (n, i) => {
    const d = new Date(0, 0, 0, 0, 60 * i);
    return d.toLocaleTimeString('ru-RU', { hour: '2-digit' });
  });

  const wrapper = el('div.dashboard-page-wrapper.wrapper');
  const inner = el('div.inner-container');
  const canvas = el('canvas.dashboard__canvas', { id: 'profit-canvas' });


  const observer = new MutationObserver(() => {
    if (document.location.pathname === '/dashboard') {
      profitGraph(canvas, dataJson);
    }
  });

  observer.observe(document.body, { subtree: true, childList: true });

  function createSelectForm() {
    const form = el('form.dashboard__form.dashboard-form');
    const select = el('select.dashboard__select.dashboard-select', { id: 'profit-select', name: 'profit' }, [
      el('option.dashboard-select__option', { value: '' }, 'Выбрать периуд'),
      el('option.dashboard-select__option', { value: 'day' }, 'За сутки'),
      el('option.dashboard-select__option', { value: 'week' }, 'За неделю'),
      el('option.dashboard-select__option', { value: 'month' }, 'За месяц'),
    ]);

    setChildren(form, [
      el('label.dashboard-form__label', 'Сортировать:'),
      select
    ])

    return form;
  }

  setChildren(inner, [
    el('div.inner-wrapper', [
      el('h3.dashboard__subtitle', 'Доход/Расход'),
      canvas,
      createSelectForm()
    ]),
    el('div.inner-wrapper', [
      el('h3.dashboard__subtitle', 'Лучшие покупатели:'),
      createTable(dataJson.grouping.campaing_group, 3, 'buyers-table'),
    ]),
    el('div.inner-wrapper', [
      el('h3.dashboard__subtitle', 'Затраты'),
      createTable(dataJson.agents.agent_cost, 2, 'cost-table'),
      createSelectForm()
    ]),
    el('div.inner-wrapper', [
      el('h3.dashboard__subtitle', 'Расходы'),
      createTable(dataJson.spend.spend_agent_cost, 4, 'spend-table'),
      createSelectForm()
    ])
  ]);

  setChildren(wrapper, [
    el('h1.dashboard__title.page-title', 'Главная'),
    inner,
    el('div.outer-wrapper', [
      el('h3.dashboard__subtitle', 'Ожидаемая прибыль'),
      createTable(dataJson.awaiting_data.whithdraws, 3, 'withdrawl-table')
    ])
  ])

  return wrapper;
}

let chart;

function profitGraph(canv, dataJs) {
  const ctx = canv.getContext('2d');

  let data = 0;
  let configuration = 0;

  const startTime = new Date(dataJs.range.from);
  const endTime = new Date(dataJs.range.to);
  const timeArr = getDatesArray(startTime, endTime)
  const arrayOfLabels = [];

  for (const i in timeArr) {
    const item = `${timeArr[i]}ч`;
    arrayOfLabels.push(item);
  }

  // let allCurrencyDatasets = allCurrencyName.map((currency) => ({
  //   label: currency,
  //   borderColor: cashGenerateRandomColor(),
  //   data: this.getCashDatasetsForOneCurrency(currency),
  // }));

  data = {
    labels: arrayOfLabels,
    datasets: [{
      label: 'Расходы',
      data: dataJs.metrics.cost,
      borderColor: 'rgba(255, 99, 132, .7)',
      borderWidth: 2,
      fill: false,
      yAxisID: 'cost',
    },
    {
      label: 'Доходы',
      data: dataJs.metrics.sales_revenue,
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

const getDatesArray = (start, end) => {
  const arr = [];
  while (start <= end) {
    arr.push(new Date(start).toLocaleTimeString('ru-RU', { hour: '2-digit' }));
    start.setHours(start.getHours() + 2);
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
      console.log('COST', dataArray)
      break;
    case 3, 'buyers-table':
      setChildren(table, [
        dataArray.map(data => el(
          'tr.table__row',
          el('td.table__cell', `${data.group}`),
          el('td.table__cell', `+ ${data.sales_revenue} $`),
          el('td.table__cell', `${data.date ? new Date(data.date).toLocaleDateString() : ''}`)
        )),
      ]);
      console.log('BUYERS', dataArray)
      break;
    case 3, 'withdrawl-table':
      setChildren(table, [
        dataArray.map(data => el(
          'tr.table__row',
          el('td.table__cell', `${data.withdraw_name}`),
          el('td.table__cell', `${data.withdraw_amount} $`),
          el('td.table__cell', `${data.date ? new Date(data.date).toLocaleDateString() : ''}`)
        )),
      ]);
      console.log('WITHDRW', dataArray)
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
      console.log('SPEND', dataArray)
      break;
  }

  return table;
}
