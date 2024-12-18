const { google } = require('googleapis');

async function readDataFromCgSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './src/credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const tableId = ['1ATpGLfmJbg4qlyzd4toNdyNBd1HEQD-RJaucmZRaQLw', '1pjoCw-EWtn91IYMemRH5Cfpjwz-4IumQReoQR0Ta6F4'];
  const totalArr = [];

  const usersAccs = {
    spreadsheetId: tableId,
    range: `12/2024!H5:I`
  }

  for (let i = 0; i < tableId.length; ++i) {
    const tempArr = [];
    const table = await getAllTransactions(sheets, tableId[i]);
    const usersAccs = await getUsersAccs(sheets, tableId[i]);

    tempArr.push(table, usersAccs);

    totalArr.push(tempArr);
  }

  return totalArr;

}

async function getUsersAccs(table, id) {
  try {
    const response = await table.spreadsheets.values.get({
      spreadsheetId: id,
      range: `12/2024!H5:I`
    });
    const rows = response.data.values;
    const rowsConcate = [];


    for (let i = 0; i < rows.length; ++i) {
      if (rows[i].length) {
        const tempArr = [];

        rows[i].forEach(item => {
          if (item !== '') {
            tempArr.push(item);
          }
        });
        rowsConcate.push(tempArr.toString());
      }
    }

    return rowsConcate;
  } catch (err) {
    console.log('error', err);
  }
}

async function getAllTransactions(table, id) {
  const sumsArr = [];
  try {
    const response = await table.spreadsheets.values.get({
      spreadsheetId: id,
      range: `12/2024!I5:AQ`
    });
    const rows = response.data.values;

    for (let i = 0; i < rows.length; ++i) {
      if (rows[i].length) {
        const tempArr = [];
        const subArr = rows[i];

        for (let j = 0; j < subArr.length; ++j) {
          if (/^\d+$/.test(subArr[0]) && !subArr[0].includes('0,00$')) {
            tempArr.push(subArr[j]);
          }
        }
        if (tempArr.length) {
          sumsArr.push(tempArr);
        }
      }
    }
  } catch (err) {
    console.log('ERROR', err.message);
  }
  return sumsArr;
}

async function getLastTransactions(arr, transObj) {
  const objArr = [];
  const lastDayTransactions = transObj.lastDayTransArr;
  const lastAllTransactions = transObj.allTransactions;

  const maxLength = lastAllTransactions.reduce((acc, item, index) => {
    if (item.length > acc) {
      acc = item.length
      return acc;
    } else {
      return acc
    }
  }, 0);

  // Вычисляется сколько дней прошло от начала месяца, так как первые 4 клетки это другие данные, не дни недели
  const daysCount = maxLength - 4;

  // Собираются суммы за последние сутки
  for (const obj of arr) {
    const newObj = Object.assign({}, obj);

    delete newObj.accounts;

    const accs = obj.accounts;

    newObj.daySpend = [];
    newObj.weekSpend = [];
    newObj.monthSpend = [];

    const tempDaySumsArr = [];
    const tempWeekSumsArr = [];
    const weekSumsArr = [];
    const tempMonthSumsArr = [];
    const monthSumsArr = [];

    // Наполняем массив с суммами за последние сутки
    accs.forEach(acc => {
      lastDayTransactions.forEach(acc2 => {
        if (acc2.includes(acc)) {

          let num = acc2[acc2.length - 1];

          num = num.replace(',', '.');

          tempDaySumsArr.push(parseFloat(num));
        }
      });
    });

    // Наполняем массив с суммами за месяц
    accs.forEach(acc => {
      lastAllTransactions.forEach(acc2 => {
        if (acc2.includes(acc)) {
          tempMonthSumsArr.push(acc2);
        }
      });
    });

    tempMonthSumsArr.forEach(arr => {
      if (arr.length > 4) {
        arr.forEach(item => {
          if (arr.indexOf(item) > 3) {
            item = item.replace(',', '.');
            monthSumsArr.push(parseFloat(item));
          }
        });
      }
    });

    // Наполняем массив с суммами за последние 7 дней / за неделю
    accs.forEach(acc => {
      lastAllTransactions.forEach(acc2 => {
        if (acc2.includes(acc)) {
          let tempWeekArr = [];
          let spl;

          if (acc2.length > maxLength - 7 && acc2.length >= 11) {
            const position = maxLength - acc2.length;

            position === 0 ? spl = 7 : spl = 7 - position;
            tempWeekArr = acc2.splice(-spl, 7);
          }
          if (acc2.length > 4 && acc2.length <= 11) {
            tempWeekArr = acc2.splice(4)
          }
          if (tempWeekArr.length) {
            tempWeekArr = tempWeekArr.filter(item => item !== '');

            tempWeekSumsArr.push(tempWeekArr);
          }
        }
      });
    });

    tempWeekSumsArr.forEach(arr => {
      arr.forEach(item => {
        item = item.replace(',', '.');
        weekSumsArr.push(parseFloat(item));
      });
    });


    newObj.daySpend = Number(Math.fround(parseFloat(reduceArr(tempDaySumsArr))).toFixed(2));
    newObj.weekSpend = Number(Math.fround(parseFloat(reduceArr(weekSumsArr))).toFixed(2));
    newObj.monthSpend = Number(Math.fround(parseFloat(reduceArr(monthSumsArr))).toFixed(2));
    objArr.push(newObj);
  }

  function reduceArr(arr) {
    return arr.reduce((prev, curr) => {
      return prev + curr;
    }, 0);
  }

  return objArr;
}


module.exports = { readDataFromCgSheet };
