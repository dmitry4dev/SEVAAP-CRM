const ggSheetService = require('../services/ggSheetService');

const getCrosgifSheetReport = async (req, res) => {
  const sheetReport = await ggSheetService.getCgSheetReport();

  res.send({status: 'OK', data: sheetReport});
};

const getFbSheetReport = async (req, res) => {
  const sheetReport = await ggSheetService.getFbSheetReport();

  res.send({status: 'OK', data: sheetReport});
};

module.exports = { getCrosgifSheetReport, getFbSheetReport };
