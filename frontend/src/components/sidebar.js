import Router from '../utils/Router';
import { setChildren, el } from 'redom';
import '../css/sidebar.css';

export default function sidebar() {
  const sidebar = el('div.sidebar');
  const logo = el('img.sidebar__logo', { src: '', alt: 'SEVAAP-logo' });
  const navigation = el('nav.sidebar__nav.nav');
  const navList = el('ul.nav__list.nav-list');
  const dashboardLink = { href: '/dashboard', text: 'Главная' };
  const buyersLink = { href: '/buyers', text: 'Баеры' };
  const agentsLink = { href: '/agents', text: 'Агенты' };
  const offersLink = { href: '/offers', text: 'Офера' };
  const costsLink = { href: '/costs', text: 'Затраты' };
  const navLinksArr = Array.from([dashboardLink, buyersLink, agentsLink, offersLink, costsLink]);
  const navLinks = [];

  const observer = new MutationObserver(() => {
    if (document.location.pathname === '/') {
      sidebar.style.display = 'none';
    } else {
      sidebar.style.display = 'block';
    }
    navList.childNodes.forEach(child => {
      child.firstChild.classList.remove('active-link');

      if (document.location.pathname === child.firstChild.pathname) {
        child.firstChild.classList.add('active-link');
      }
    });
    observer.disconnect();
  });

  observer.observe(document.body, {subtree: true, childList: true});

  setChildren(navList, navLinksArr.map(link => el(
    'li.nav-list__item',
    el('a.nav-list__link', {
      href: link.href
    }, link.text)
  )));

  setChildren(navigation, [navList]);

  setChildren(sidebar, [
    logo,
    navigation
  ]);

  navList.childNodes.forEach(item => {
    navLinks.push(item.firstChild);
  });

  navLinks.forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      Router.getRouter().navigate(link.pathname);
    });
  });

  return sidebar;
}
