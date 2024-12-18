export async function getKeitaroApi(range) {
  const obj = {
    range: { 'interval': `${range}`, 'timezone': 'Europe/Moscow', 'from': null, 'to': null },
    columns: [],
    metrics: ['revenue', 'uepc'],
    grouping: ['campaign_group'],
    sort: [],
    filters: [{ 'name': 'campaign_group', 'operator': 'NOT_EQUAL', 'expression': '' }],
    summary: false, 'limit': 1000, 'offset': 0
  }

  const response = await fetch(`https://sevaapp.online/admin_api/v1/report/build `, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
      'Accept': 'application/json',
      'Api-Key': `f2d5291e59ecd36640d46f170824c4cb`
    },
    body: JSON.stringify(obj)
  });

  const data = await response.json();

  range !== undefined ? data.meta.interval = range : '';

  // console.log('API', data);

  return data;
}

export async function getFbGgSheet() {
  try {
    const response = await fetch('http://localhost:1337/api/fbsheets/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const dataFromFb = await response.json();

    const usersArray = separateData(dataFromFb.data, /AD|1\s/).allUsersArr;
    const usersAccsArray = separateData(dataFromFb.data, null).allAccsArr;
    const users = createObjArr(usersArray);

    const fbObjectsArr = calculateFbSpend(users, usersAccsArray).objArr;
    const fbObjectSpends = calculateFbSpend(users, usersAccsArray).spendsObj;

    // console.log('FB-objspends', fbObjectSpends);

    return { fbObjectsArr, fbObjectSpends };
  } catch (err) {
    console.log('ERROR', err.message);
  }
}

function calculateFbSpend(usersArr, accsArr) {
  const objArr = [];
  const users = usersArr;
  const usersAccs = accsArr;
  const accsFilteredArr = [];
  const spendsObj = {
    daySpends: [],
    weekSpends: [],
    monthSpends: [],
    agent: 'FB RENT'
  };

  usersAccs.forEach(acc => {
    const tempArr = [];

    for (let i = 0; i < acc.length; ++i) {
      if (i === 0) tempArr.push(acc[i]);

      if (i === 7) tempArr.push(acc[i]);

      if (i < 9) continue;

      if (i === 11) tempArr.push(acc[i]);

      if (acc.indexOf(acc[i]) % 2 !== 0 && i !== 11) {
        if (acc[i] !== '') {
          tempArr.push(acc[i]);
        }
      }
    }
    accsFilteredArr.push(tempArr);
  });

  for (const obj of users) {
    const newObj = Object.assign({}, obj);

    delete newObj.accounts;

    const objAccs = obj.accounts;

    let dSpend = fbDaySpend(objAccs, accsFilteredArr);
    let wSpend = fbWeekSpend(objAccs, accsFilteredArr);
    const mSpend = fbMonthSpend(objAccs, accsFilteredArr);

    newObj.daySpend = Number(Math.fround(parseFloat(reduceArr(dSpend))).toFixed(2));
    newObj.weekSpend = Number(Math.fround(parseFloat(reduceArr(wSpend))).toFixed(2));
    newObj.monthSpend = Number(Math.fround(parseFloat(reduceArr(mSpend))).toFixed(2));

    dSpend = dSpend.filter(item => item !== 0);
    wSpend = wSpend.filter(item => item !== 0);

    dSpend.length ? spendsObj.daySpends.push(dSpend) : '';
    wSpend.length ? spendsObj.weekSpends.push(wSpend) : '';
    mSpend.length ? spendsObj.monthSpends.push(mSpend) : '';

    objArr.push(newObj);
  }

  // console.log('facebook', objArr);

  return { objArr, spendsObj };
}

function fbDaySpend(arr, arr2) {
  const date = new Date();
  const today = date.getDate();
  const tempDaySumsArr = [];

  arr.forEach(acc => {
    arr2.forEach(acc2 => {
      if (acc2.includes(acc)) {
        let num = acc2[today - 1];

        num = num.replace(',', '.');

        if (!num.includes('-')) {
          tempDaySumsArr.push(parseFloat(num));
        }
      }
    });
  });
  return tempDaySumsArr;
}

function fbMonthSpend(arr, arr2) {
  const tempMonthArr = [];
  const monthSumsArr = [];

  arr.forEach(acc => {
    arr2.forEach(acc2 => {
      if (acc2.includes(acc)) {
        tempMonthArr.push(acc2);
      }
    });
  });

  tempMonthArr.forEach(arr => {
    if (arr.length > 4) {
      arr.forEach(item => {
        if (arr.indexOf(item) > 0) {
          item = item.replace(',', '.');
          if (item !== '' && item !== '0.00' && !item.includes('-')) {
            monthSumsArr.push(parseFloat(item));
          }
        }
      });
    }
  });

  return monthSumsArr;
}

function fbWeekSpend(arr, arr2) {
  const date = new Date();
  const today = date.getDate();
  const weekSumsArr = [];
  const tempWeekSumsArr = [];

  arr.forEach(acc => {
    arr2.forEach(acc2 => {
      if (acc2.includes(acc)) {
        let tempWeekArr = [];
        let spl;
        if (today > 7) {
          spl = today - 7;
          tempWeekArr = acc2.slice(spl, today);
          tempWeekArr = tempWeekArr.filter(item => !item.includes('-'));
        }
        if (today <= 7) {
          tempWeekArr = acc2.splice(7, today);
          tempWeekArr = tempWeekArr.filter(item => !item.includes('-'));
        }

        tempWeekSumsArr.push(tempWeekArr);
      }
    });
  });

  tempWeekSumsArr.forEach(arr => {
    arr.forEach(item => {
      item = item.replace(',', '.');
      weekSumsArr.push(parseFloat(item));
    });
  });

  return weekSumsArr;
}

/////////////////////////////////////////////////////////////////////////////


export async function getCrossgifGgSheet() {
  try {
    const response = await fetch('http://localhost:1337/api/cgsheets/', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      }
    });

    const dataFromCg = await response.json();

    const usersArray = separateData(dataFromCg.data, /K[0-9]|Desk/).allUsersArr;
    const usersAccsArray = separateData(dataFromCg.data, null).allAccsArr
    const users = createObjArr(usersArray);

    const cgObjectsArr = calculateCgSpend(users, usersAccsArray).objArr;
    const cgObjectSpends = calculateCgSpend(users, usersAccsArray).spendsObj;

    // console.log('CG-objspends', cgObjectSpends);

    return { cgObjectsArr, cgObjectSpends }
  } catch (err) {
    console.log('ERROR', err.message);
  }
}

function calculateCgSpend(usersArr, accsArr) {
  const objArr = [];
  const spendsObj = {
    daySpends: [],
    weekSpends: [],
    monthSpends: [],
    agent: 'CROSSGIF'
  };
  const users = usersArr;
  const usersAccs = accsArr;

  const maxLength = accsArr.reduce((acc, item, index) => {
    if (item.length > acc) {
      acc = item.length
      return acc;
    } else {
      return acc
    }
  }, 0);

  const lastDayTrans = usersAccs.filter(arr => arr.length === maxLength);

  for (const obj of users) {
    const newObj = Object.assign({}, obj);

    delete newObj.accounts;

    const objAccs = obj.accounts;

    const dSpend = cgDaySpend(objAccs, lastDayTrans);
    const mSpend = cgMonthSpend(objAccs, usersAccs);
    const wSpend = cgWeekSpend(objAccs, usersAccs, maxLength);

    newObj.daySpend = Number(Math.fround(parseFloat(reduceArr(dSpend))).toFixed(2));
    newObj.weekSpend = Number(Math.fround(parseFloat(reduceArr(wSpend))).toFixed(2));
    newObj.monthSpend = Number(Math.fround(parseFloat(reduceArr(mSpend))).toFixed(2));

    dSpend.length ? spendsObj.daySpends.push(dSpend) : '';
    wSpend.length ? spendsObj.weekSpends.push(wSpend) : '';
    mSpend.length ? spendsObj.monthSpends.push(mSpend) : '';

    objArr.push(newObj);
  }

  // console.log('crossgif', objArr);

  return { objArr, spendsObj }
}

function cgDaySpend(arr, arr2) {
  const tempDaySumsArr = [];

  arr.forEach(acc => {
    arr2.forEach(acc2 => {
      if (acc2.includes(acc)) {

        let num = acc2[acc2.length - 1];

        num = num.replace(',', '.');

        tempDaySumsArr.push(parseFloat(num));
      }
    });
  });
  return tempDaySumsArr;
}

function cgMonthSpend(arr, arr2) {
  const tempMonthSumsArr = [];
  const monthSumsArr = [];

  arr.forEach(acc => {
    arr2.forEach(acc2 => {
      if (acc2.includes(acc)) {
        tempMonthSumsArr.push(acc2);
      }
    });
  });

  tempMonthSumsArr.forEach(arr => {
    if (arr.length > 4) {
      arr.forEach(item => {
        if (arr.indexOf(item) > 3) {
          if (/^[\d]+([,\.][\d]+)?$/.test(item)) {
            item = item.replace(',', '.');
            monthSumsArr.push(parseFloat(item));
          }
        }
      });
    }
  });

  return monthSumsArr;
}

function cgWeekSpend(arr, arr2, mxLgth) {
  const tempWeekSumsArr = [];
  const weekSumsArr = [];

  arr.forEach(acc => {
    arr2.forEach(acc2 => {
      if (acc2.includes(acc)) {
        let tempWeekArr = [];
        let spl;

        if (acc2.length === mxLgth && mxLgth >= 11) {
          tempWeekArr = acc2.slice(-7);
        }
        if (acc2.length < mxLgth && acc2.length > mxLgth - 7) {
          spl = acc2.length - (mxLgth - 7);
          tempWeekArr = acc2.slice(-spl);
        }
        if (acc2.length <= mxLgth && mxLgth <= 11) {
          tempWeekArr = acc2.slice(4);
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

  return weekSumsArr;
}

///////////////////////////////////////////////////////////////////////////////////////////

function separateData(mainArr, regEx) {
  const allAccs = [];
  const allUsers = [];
  const allUsersArr = [];
  let allAccsArr = [];

  mainArr.forEach(arr => {
    arr.forEach(subArr => {
      if (!isAllNums(subArr)) {
        allUsers.push(subArr);
      } else {
        allAccs.push(subArr);
      }
    });
  });

  for (let i = 0; i < allAccs.length; ++i) {
    if (i !== allAccs.length) {
      allAccsArr = allAccs[0].concat(allAccs[i]);
    }
  }

  allUsers.toString().split(regEx).forEach(item => {
    if (item.length) {
      const arr = Array.from(item.split(','));
      allUsersArr.push(arr);
    }
  });

  return { allAccsArr, allUsersArr };
}

function createObjArr(arr) {
  const objectsArr = [];

  for (let i = 0; i < arr.length; ++i) {
    const obj = {
      name: '',
      accounts: []
    }
    arr[i].forEach(item => {
      if (item.includes('Dima') || item.includes('\S')) {
        obj.name = 'BOSS';
      }
      if (item.includes('SHUHRAT') || item.includes('S 2')) {
        obj.name = 'RDS_team';
      }
      if (item.includes('Maks')) {
        obj.name = 'Fufel';
      }
      if (item.includes('Leo')) {
        obj.name = 'Leo';
      }
      if (item.includes('Artem') || item.includes('S 1') || item.includes('H106')) {
        obj.name = 'Artem';
      }
      if (item.includes('Denis')) {
        obj.name = 'Gambak'
      }
      if (item.includes('Jey')) {
        obj.name = 'Jey Krips'
      }
      if (item.includes('Ayanna')) {
        obj.name = 'Dorein'
      }
      if (item.includes('Lera')) {
        obj.name = 'Jerry'
      }
      if (/^\d+$/.test(item)) {
        obj.accounts.push(item);
      }
    });
    if (obj.accounts.length) {
      objectsArr.push(obj);
    }
  }

  const mergedArr = objectsArr.reduce((prev, curr) => {
    const { name, accounts } = curr;

    if (!prev[name]) {
      prev[name] = {
        accounts: []
      }
    }
    prev[name].accounts.push(accounts);

    return prev;
  }, {});

  const resultArr = Object.entries(mergedArr).map(item => (
    {
      campaign_group: item[0],
      accounts: item[1].accounts
    }
  ));

  resultArr.forEach(obj => {
    if (obj.accounts.length) {
      obj.accounts = Array.from(obj.accounts.toString().split(','));
    }
  });

  return resultArr;
}

function isAllNums(arr) {
  return arr.every(item => /^\d+$/.test(item[0]));
}

function reduceArr(arr) {
  return arr.reduce((prev, curr) => {
    return prev + curr;
  }, 0);
}

export default { getKeitaroApi, getCrossgifGgSheet, getFbGgSheet };

