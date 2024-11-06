import Router from './utils/Router';
import { setChildren, el, mount } from 'redom';
import mountPageContent from './utils/mountPageContent';
// import dataJson from './utils/data.json';
import loginPage from './components/loginPage';
import dashboardPage from './components/dashboardPage';
import './css/normalize.css';
import './css/styles.css';

document.addEventListener('DOMContentLoaded', () => {

  Router.getRouter()
  .on('/', () => {
    mountPageContent(loginPage())
  })

  .on('/dashboard', () => {
    mountPageContent(dashboardPage());
  })

  .on('/buyers', () => {
    mountPageContent(el('h1.page-title', 'buyers'))
  })

  .on('/agents', () => {
    mountPageContent(el('h1.page-title', 'agents'))
  })

  .on('/offers', () => {
    mountPageContent(el('h1.page-title', 'offers'))
  })

  .on('/costs', () => {
    mountPageContent(el('h1.page-title', 'costs'))
  })
  .resolve();

  // const ctx = document.querySelector('.dashboard__canvas').getContext('2d');
  // const lineChart = new Chart(ctx, {
  //   type: 'line',
  //   data: {
  //     labels: ['00ч', '02ч', '04ч', '06ч', '08ч', '10ч', '12ч', '14ч', '16ч', '18ч', '20ч', '22ч', '24ч'],
  //     datasets: [{
  //       label: 'Расходы',
  //       data: dataJson.metrics.cost,
  //       borderColor: 'rgba(255, 99, 132, 1)',
  //       borderWidth: 2,
  //       fill: false
  //     }]
  //   },
  //   options: {
  //     scales: {
  //       y: {
  //         beginAtZero: false // Начало оси y не с нуля, поскольку данные отражают температуру
  //       }
  //     }
  //   }
  // });

});
