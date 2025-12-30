var express = require('express'),
    http = require('http');
    bodyParser = require('body-parser'),
    proxy = require('express-http-proxy'),
    urlHelper = require('url');
const latexService = require('./latexService.js')
const dotenv = require('dotenv');
dotenv.config();

const BASE_URL = process.env.BASE_URL || "dev.sunbirded.org";
const API_AUTH_TOKEN = process.env.AUTH_API_TOKEN;
const USER_TOKEN = process.env.USER_API_TOKEN;
const PORTAL_COOKIES= ""

var app = express();
app.set('port', 3000);
app.use(express.json())
app.get("/latex/convert", latexService.convert)
app.post("/latex/convert", bodyParser.json({ limit: '1mb' }), latexService.convert);
app.use(express.static(__dirname + '/web-component-examples/vanilla-js'));

const decoratePublicRequestHeaders = function () {
    return function (proxyReqOpts, srcReq) {
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        // proxyReqOpts.headers['x-authenticated-user-token'] = USER_TOKEN;
        return proxyReqOpts;     
    }
};

app.post(["/action/asset/v1/upload/*"], proxy(BASE_URL, {
    https: true,
    parseReqBody: false,
    proxyReqPathResolver: function (req) {
      console.log('proxyReqPathResolver ::', req.originalUrl);
      let originalUrl = req.originalUrl.replace("/action/", "/api/");
      return urlHelper.parse(originalUrl).path;
    },
    proxyReqOptDecorator: decoratePublicRequestHeaders()
  })
);

app.get(['/api/framework/v1/read/*',
     '/learner/framework/v1/read/*', 
     '/api/channel/v1/read/*'], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function(req) {
        console.log('proxyReqPathResolver ',  urlHelper.parse(req.url).path);
        return urlHelper.parse(req.url).path;
    },
    proxyReqOptDecorator: decoratePublicRequestHeaders()
}));


app.use(['/action/questionset/v2/*',
    '/action/question/v2/*',
    '/action/object/category/definition/v1/*',
    '/api/question/v2/*'
    ], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function (req) {
        let originalUrl = req.originalUrl.replace('/action/', '/api/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: decoratePublicRequestHeaders()
}));

app.use(['/action/composite/v3/search'
    ], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function (req) {
        let originalUrl = req.originalUrl.replace('/action/composite/v3/', '/api/composite/v1/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: decoratePublicRequestHeaders()
}));

app.use(['/action/program/v1/*',
    '/action/question/v2/bulkUpload',
    '/action/question/v2/bulkUploadStatus'
    ], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function (req) {
        let originalUrl = req.originalUrl.replace('/action/', '/api/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: decoratePublicRequestHeaders()
}));

app.use(['/api','/assets','/action'], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function(req) {
        console.log('proxyReqPathResolver ',  urlHelper.parse(req.url).path);
        return urlHelper.parse(req.url).path;
    },
    proxyReqOptDecorator: decoratePublicRequestHeaders()
}));

app.use(['/action/content/*'], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function (req) {
        let originalUrl = req.originalUrl.replace('/api/', '/api/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: decoratePublicRequestHeaders()
}));
app.use(['/assets/public/*'], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function(req) {
        return require('url').parse(`https://${BASE_URL}` + req.originalUrl).path
    }
}));
http.createServer(app).listen(app.get('port'), 3000);