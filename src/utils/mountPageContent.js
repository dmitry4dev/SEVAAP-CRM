import { mount, el, setChildren } from 'redom';
import sidebar from '../components/sidebar';

export default function mountPageContent(component) {
  const body = window.document.body;
  const container = el('div.app');

  body.innerHTML = '';

  setChildren(container, [sidebar(), component]);

  return mount(body, container);
}
