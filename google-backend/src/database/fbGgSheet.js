const { google } = require('googleapis');

async function readDataFromFbSheet() {
  const auth = new google.auth.GoogleAuth({
    keyFile: './src/credentials.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });
  const client = await auth.getClient();
  const sheets = google.sheets({ version: 'v4', auth: client });
  const tableId = ['1c7tzHS2abcHMq3wN6AJAxvO8FftZ-DrZAPY0Wu-W2EI', '1FEMgESUrpJnRiI9VHuBkOoinckYZyXFsl5EiRPpW6u8'];
  const totalArr = [];

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
      range: `12/24!A13:C`
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
    console.log('ERROR', err.message);
  }
}

async function getAllTransactions(table, id) {
  const sumsArr = [];
  try {
    const response = await table.spreadsheets.values.get({
      spreadsheetId: id,
      range: `12/24!C13:BR`
    });
    const rows = response.data.values;

    for (let i = 0; i < rows.length; ++i) {
      if (rows[i].length) {
        const tempArr = [];
        const subArr = rows[i];

        for (let j = 0; j < subArr.length; ++j) {
          if (/^\d+$/.test(subArr[0]) && subArr[0] !== '') {
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

module.exports = { readDataFromFbSheet }
