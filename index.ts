const express = require('express')
const app = express()
const cors = require('cors')
const logger = require('morgan')
const helmet = require('helmet')
const path = require('path')
const i18next = require('i18next')
const backend = require('i18next-fs-backend')
const middleware = require('i18next-http-middleware')


const {NODE_PORT} = require('./src/config/index')


//// import routes
const AuthRouter = require('./src/router/AuthRouter')
const FreeRouter = require("./src/router/FreeRouter")
const UploadRouter = require('./src/router/UploadRouter')
const General = require('./src/router/General')
const CartRouter = require('./src/router/CartController')
const AdminRouter = require('./src/router/AdminRouter')


const allowedOrigins = [
  "http://192.168.5.90",
  "http://localhost:5173", 
  "http://localhost" 
]

app.disable('x-powered-by');


/// language detector 
i18next.use(backend).use(middleware.LanguageDetector)
  .init({
    fallbackLng: 'en',
    backend: {
      loadPath: './src/locales/{{lng}}/translation.json'
    }
})




///middlewares
app.use('/file', express.static('./public/attachments/files'));
app.use('/image', express.static('./public/attachments/images'));
app.use('/icon', express.static('./public/icons'))

//// utils
app.use(logger("dev"));
app.use(express.json())
app.use(middleware.handle(i18next))
app.use(cors({
  origin (origin:any, callback:any) {
    // console.log(origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
}))
app.use(function (req: any, res: any, next: any) {
    res.header("Content-Type", "application/json;charset=UTF-8");
    res.header("Access-Control-Allow-Credentials", true);
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
    );
    next();
});
app.use(helmet({
  contentSecurityPolicy : {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      "script-src": ["'self'", "'unsafe-inline'"],
    }
  }
}))


/////// ROUTES 
app.use('/api/model-app/auth', AuthRouter)
app.use('/api/model-app/free', FreeRouter)
app.use('/api/model-app/upload', UploadRouter)
app.use('/api/model-app/general', General)
app.use('/api/model-app/cart', CartRouter)
app.use('/api/model-app/admin', AdminRouter)

const port = NODE_PORT | 5001
app.listen(port, () => console.log(`Server runs on port ${port}`))
