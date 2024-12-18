export default function reduceObjects(arr) {
  const targetArr = arr.reduce((prev, curr) => {
    const {
      campaign_group,
      daySpend,
      weekSpend,
      monthSpend
    } = curr;
    if (!prev[campaign_group]) {
      prev[campaign_group] = {
        daySpend: 0,
        weekSpend: 0,
        monthSpend: 0,
      }
    }
    prev[campaign_group].daySpend += daySpend;
    prev[campaign_group].weekSpend += weekSpend;
    prev[campaign_group].monthSpend += monthSpend;
    return prev;
  }, {});

  const reducedSheets = Object.entries(targetArr).map(obj => (
    {
      campaign_group: obj[0],
      daySpend: Number(Math.fround(obj[1].daySpend).toFixed(2)),
      weekSpend: Number(Math.fround(obj[1].weekSpend).toFixed(2)),
      monthSpend: Number(Math.fround(obj[1].monthSpend).toFixed(2))
    }
  ));

  console.log('reduced', reducedSheets);

  return reducedSheets;
}
