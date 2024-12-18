import { el } from 'redom';
import '../css/preloader.css';

export default function preloader() {
  const preloaderContainer = el('div.preloader');
  const preloader = el('div.preloader__loader');
  const spinner = el('div.loadingio-spinner-rolling-esettsv4zm');
  const rolling = el('div.ldio-hu8xr3xorjc');
  const innerSpiner = el('div');

  rolling.append(innerSpiner);
  spinner.append(rolling);
  preloader.append(spinner);
  preloaderContainer.append(preloader);

  return preloaderContainer;
}
