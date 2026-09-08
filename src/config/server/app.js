import express from 'express';
import path from 'path';
import session from 'express-session';
import MongoStore from 'connect-mongo';
import { getDirname } from '../../common/utils/path.js';
import router from '../../routes/index.js';
import { errorHandler } from '../../common/middleware/errorHandler.js';
import { notFoundHandler } from '../../common/middleware/notFound.js';
import env from '../environment/env.js';

const __dirname = getDirname(import.meta.url);

const createApp = () => {
  const app = express();

  app.set('view engine', 'ejs');
  app.set('views', path.join(__dirname, '..', '..', 'views'));

  app.use(express.static(path.join(__dirname, '..', '..', 'public')));
  app.use(express.urlencoded({ extended: false }));
  app.use(express.json());

  app.use(
    session({
      secret: env.sessionSecret,
      resave: false,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: env.mongodbUri,
        collectionName: 'sessions',
      }),
      cookie: {
        maxAge: 1000 * 60 * 60 * 24,
        httpOnly: true,
        sameSite: 'lax',
      },
    })
  );

  app.use((req, res, next) => {
    res.locals.currentUser = req.session.user || null;
    res.locals.flash = req.session.flash || null;
    delete req.session.flash;
    next();
  });

  app.use('/', router);

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};

export default createApp;
