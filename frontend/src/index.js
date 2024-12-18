import Router from './utils/Router';
import { setChildren, el, mount } from 'redom';
import mountPageContent from './utils/mountPageContent';
import loginPage from './components/loginPage';
import dashboardPage from './components/dashboardPage';
import buyersPage from './components/buyersPage';
import preloader from './utils/preloader';
import './css/normalize.css';
import './css/styles.css';

document.addEventListener('DOMContentLoaded', async () => {
  const loader = preloader();

  Router.getRouter()
  .on('/', () => {
    mountPageContent(loginPage())
  })

  .on('/dashboard', async () => {
    document.body.prepend(loader);
    mountPageContent(await dashboardPage());
  })

  .on('/buyers', async () => {
    document.body.prepend(loader);
    mountPageContent(await buyersPage());
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

});
