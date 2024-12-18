export function mergeObjects(obj, obj2) {
  const newObj = {};

  for (const key in obj) {
    for (const key2 in obj2) {
      if (key === key2) {
        if (typeof obj[key] === 'object' && Array.isArray(obj[key])) {
          newObj[key] = obj[key].concat(obj2[key2]);
        }
      }
    }
  }

  newObj.daySpends = newObj.daySpends = newObj.daySpends.map(arr => reduceArr(arr));
  newObj.weekSpends = newObj.weekSpends.map(arr => reduceArr(arr));
  newObj.monthSpends = newObj.monthSpends = newObj.monthSpends.map(arr => reduceArr(arr));

  return newObj;
}

function reduceArr(arr) {
  const reduced = arr.reduce((prev, curr) => {
    return prev + curr;
  }, 0);
  return Math.round(reduced);
}
