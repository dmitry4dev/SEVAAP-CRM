import { el, setChildren } from 'redom';

export default function createSelectForm(cssClass) {
  const form = el(`form.${cssClass}`);
  const select = el(`select.${cssClass}__select.select`, { id: 'buyers-select', name: 'buyers' }, [
    el(`option.select__option`, { value: '' }, 'Выбрать периуд'),
    el(`option.select__option`, { value: 'today' }, 'За сутки'),
    el(`option.select__option`, { value: '7_days_ago' }, 'За неделю'),
    el(`option.select__option`, { value: '1_month_ago' }, 'За месяц'),
  ]);
  const submitBtn = el(`button.${cssClass}__submit-btn.btn`, { type: 'submit' }, 'Показать');

  setChildren(form, [
    el(`label.${cssClass}__label.form-label`, 'Сортировать:'),
    el(`div.buyers-form-inner`, [
      select,
      submitBtn
    ])
  ]);

  return {form};
}
