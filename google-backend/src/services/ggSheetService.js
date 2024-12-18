const reqFromGgSheet = require('../database/crosgifGgSheet');
const reqFromFbSheet = require('../database/fbGgSheet');

const getCgSheetReport = async () => {
  const crosgiGgSheet = await reqFromGgSheet.readDataFromCgSheet();

  return crosgiGgSheet;
};

const getFbSheetReport = async () => {
  const fbGgSheet = await reqFromFbSheet.readDataFromFbSheet();

  return fbGgSheet;
}

module.exports = {
  getCgSheetReport,
  getFbSheetReport
}
