import express from 'express';
import path from 'path';
import { getDirname } from '../../common/utils/path.js';
import router from '../../routes/index.js';
import { errorHandler } from '../../common/middleware/errorHandler.js';
import { notFoundHandler } from '../../common/middleware/notFound.js';

const __dirname = getDirname(import.meta.url);

const createApp = () => {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', '..', 'views'));

  app.use(express.static(path.join(__dirname, '..', '..', 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use('/', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
