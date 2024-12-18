import { el } from 'redom';

export default function addErrMsg(errContainer, formElem, text) {
  const errorMessage = el('span.form__error', text);

  if (!errContainer.childNodes.length) {
    errContainer.appendChild(errorMessage);
  } else {
    for (const child of errContainer.childNodes) {
      if (child.textContent !== errorMessage.textContent) {
        errContainer.appendChild(errorMessage);
      }
    }
  }

  (formElem !== null && !formElem.classList.contains('input-error')) ? formElem.classList.add('input-error') : '';

  return errContainer;
}
