import Router from '../utils/Router';
import { setChildren, el } from 'redom';
import addErrMsg from '../utils/addErrMsg';
import dashboardPage from './dashboardPage';
import mountPageContent from '../utils/mountPageContent';
import '../css/loginpage.css';

export default function loginPage() {
  const wrapper = el('div.login-page-wrapper');
  const form = el('form.form');
  const inputName = el('input.form__input', { id: 'user', type: 'text', name: 'user' });
  const inputPass = el('input.form__input', { id: 'password', type: 'text', name: 'password' });
  const loginBtn = el('button.form__login-btn', { type: 'submit' }, 'Вход');
  const formErrors = el('div.form__error-container');

  const loginData = {};

  setChildren(form, [
    el('label.form__label', { for: 'user'}, 'Пользователь:', inputName),
    el('label.form__label', { for: 'password'}, 'Пароль:', inputPass),
    loginBtn,
    formErrors
  ]);

  setChildren(wrapper, [form]);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const inputs = [...form.elements].filter(input => input.name);

    formErrors.innerHTML = '';

    for (const elem of inputs) {
      elem.classList.remove('input-error');

      if (elem.value) {
        if (/\s/.test(elem.value)) {
          addErrMsg(formErrors, elem, 'Логин или пароль не должны содержать пробелов');
        }
      } else {
        addErrMsg(formErrors, elem, 'Все поля должны быть заполнены');
      }

      if (inputs.every(inputElement => !inputElement.classList.contains('input-error'))) {
        switch (elem.name) {
          case 'login':
            loginData.login = elem.value.trim();
            break;
          case 'password':
            loginData.password = elem.value.trim();
            break;
        }
        Router.getRouter().navigate('/dashboard');
        mountPageContent(dashboardPage())
      }
    }

    if (Object.keys(loginData).length === 2) {
      inputs.forEach(input => {
        input.value = '';
      });

      for (const key of Object.keys(loginData)) {
        delete loginData[key];
      }
    }
  });

  return wrapper;
}
