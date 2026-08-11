import asyncHandler from '../../../common/helpers/asyncHandler.js';
import homeService from '../services/homeService.js';

const homeController = {
  getLanding: asyncHandler(async (req, res) => {
    const data = await homeService.getLandingData();
    res.render('home/landing', {
      title: 'Carely - Cuidado Personal',
      ...data,
    });
  }),
};

export default homeController;
