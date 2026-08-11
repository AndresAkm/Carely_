import asyncHandler from '../../../common/helpers/asyncHandler.js';
import catalogService from '../services/catalogService.js';

const catalogController = {
  getCatalog: asyncHandler(async (req, res) => {
    const data = await catalogService.getCatalogData(req.query.category);
    res.render('catalog/index', {
      title: 'Catálogo - Carely',
      ...data,
    });
  }),
};

export default catalogController;
