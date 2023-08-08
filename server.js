var express = require('express'),
    http = require('http');
    bodyParser = require('body-parser'),
    proxy = require('express-http-proxy'),
    urlHelper = require('url');
const latexService = require('./latexService.js')


// ENV Variables

const BASE_URL = 'https://compass-dev.tarento.com/';

const API_AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiI0WEFsdFpGMFFhc1JDYlFnVXB4b2RvU2tLRUZyWmdpdCJ9.mXD7cSvv3Le6o_32lJplDck2D0IIMHnv0uJKq98YVwk";

const PORTAL_COOKIES= "connect.sid=s%3AsherXnbJZVk9PSaDZZKS067kYwg5wkPT.VXctObnTeEzMd%2F6qDRVMcPxg1TiDo2wxjfUaTKUQRJc"

const USER_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICI5YnBaRzhRQWF1SnZodUl2a2VqM2RVU2g3MUMzLTlvc21TdlhNeFBrbENRIn0.eyJqdGkiOiI1NzIyMWU1OC1lZTM0LTRkZWYtOGQzMS1hMjE0NDI5ZThjMTEiLCJleHAiOjE2OTE1MTEwMzEsIm5iZiI6MCwiaWF0IjoxNjkxNDY3ODMxLCJpc3MiOiJodHRwczovL2NvbXBhc3MtZGV2LnRhcmVudG8uY29tL2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJhY2NvdW50Iiwic3ViIjoiZjo0NDBjZTUzNi01NTYxLTRjYzgtOGZjMy1mZTRmMjUyMTBiZWY6YzIyNWI1ZTgtMGI5Mi00NWUxLWE1ZGMtODZjY2UwNWMzNTVhIiwidHlwIjoiQmVhcmVyIiwiYXpwIjoibG1zIiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiZjJjZmIyZmYtOGExYi00MGFlLWIwZjctYjY3NmNmYjRjYzRkIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2NvbXBhc3MtZGV2LnRhcmVudG8uY29tIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJvZmZsaW5lX2FjY2VzcyIsInVtYV9hdXRob3JpemF0aW9uIl19LCJyZXNvdXJjZV9hY2Nlc3MiOnsiYWNjb3VudCI6eyJyb2xlcyI6WyJtYW5hZ2UtYWNjb3VudCIsIm1hbmFnZS1hY2NvdW50LWxpbmtzIiwidmlldy1wcm9maWxlIl19fSwic2NvcGUiOiIiLCJuYW1lIjoiQ29tcGFzc3JnQWRtaW4xIiwicHJlZmVycmVkX3VzZXJuYW1lIjoiY29tcGFzc2FkbWluMSIsImdpdmVuX25hbWUiOiJDb21wYXNzcmdBZG1pbjEiLCJmYW1pbHlfbmFtZSI6IiIsImVtYWlsIjoiY28qKioqKioqKioqKkB5b3BtYWlsLmNvbSJ9.DID4TH2ipt-5OdyL4G-_Qj0wnSnyOLrLeKTR8Yh7Jr1mkAqILQMF_wRdIJTqO41JMmn0MZEdy1mpTT3IWYnfdzOJ9ASyzgKZv8zPbVVc0rdR2048qMII_JJYjq5j-37Me8hHCBDx_cBasfgmIYGY_3GkCiGCKK8-ip4Q3H2l1fm4PlzZvANATxa3hIHo1XbfoOaTiAZY5H1hQTUcx1uMqnPoqEEexWs-v0IzoAiKEgsTMMvmP108WzSViw9UL45qbfkOUlJt4R0lnAM_D2m-QaQcsAAoKrXNCl8L9UN_Wj3jtV4z0tn7Gz4cjcQB9Fk6ZqNjBjFpnkCYFaGqjoiXMg";

 

var app = express();
app.set('port', 3000);
app.use(express.json())
app.get("/latex/convert", latexService.convert)
app.post("/latex/convert", bodyParser.json({ limit: '1mb' }), latexService.convert);
app.use(express.static(__dirname + '/web-component-examples/vanilla-js'));
app.all(['/api/framework/v1/read/*',
     '/learner/framework/v1/read/*', 
     '/api/channel/v1/read/*',
     '/api/question/v2/list'], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function(req) {
        console.log('proxyReqPathResolver ',  urlHelper.parse(req.url).path);
        return urlHelper.parse(req.url).path;
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 2')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['Cookie'] = PORTAL_COOKIES;
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        return proxyReqOpts;
    }
}));
// app.use('/action/questionset/v2/*', proxy(BASE_URL, {
//     https: true,
//     limit: '30mb',
//     proxyReqPathResolver: function (req) {
//         console.log("pavan1", req.originalUrl);
//         let originalUrl;
//         if(!req.originalUrl.split("/").includes('update')) {
//             originalUrl = req.originalUrl.replace('/action/', '/api/');
//         } else {
//             originalUrl = req.originalUrl;
//         }
//         console.log("pavan2", originalUrl);
//         originalUrl = originalUrl.replace('/v2/','/v1/');
//         console.log("pavan3", originalUrl);
//         console.log('proxyReqPathResolver question', originalUrl, require('url').parse(originalUrl).path);
//         return require('url').parse(originalUrl).path;
//     },
//     proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
//         console.log('proxyReqOptDecorator 3')
//         // you can update headers
//         proxyReqOpts.headers['Content-Type'] = 'application/json';
//         proxyReqOpts.headers['user-id'] = 'content-editor';
//         proxyReqOpts.headers['Cookie'] = PORTAL_COOKIES;
//         proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
//         proxyReqOpts.headers['x-authenticated-user-token'] = USER_TOKEN;
//          return proxyReqOpts;
//     }
// }));
app.use(['/action/questionset/v2/*',
    '/action/question/v2/*',
    '/action/collection/v1/*',
    '/action/object/category/definition/v1/*',
    '/action/collection/v1/*'
    ], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function (req) {
        console.log("adda", req.originalUrl);
        let originalUrl = req.originalUrl.replace('/action/', '/api/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 3')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['Cookie'] = PORTAL_COOKIES;
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        proxyReqOpts.headers['x-authenticated-user-token'] = USER_TOKEN;
         return proxyReqOpts;
    }
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
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 3')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['Cookie'] = PORTAL_COOKIES;
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        proxyReqOpts.headers['x-authenticated-user-token'] = USER_TOKEN;
         return proxyReqOpts;
    }
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
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 3')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['Cookie'] = PORTAL_COOKIES;
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        proxyReqOpts.headers['x-authenticated-user-token'] = USER_TOKEN;
         return proxyReqOpts;
    }
}));

app.use(['/api','/assets','/action'], proxy(BASE_URL, {
    https: true,
    limit: '30mb',
    proxyReqPathResolver: function(req) {
        console.log('proxyReqPathResolver ',  urlHelper.parse(req.url).path);
        return urlHelper.parse(req.url).path;
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 4')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['Cookie'] = PORTAL_COOKIES;
        return proxyReqOpts;
    }
}));

app.use(['/action/content/*'], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function (req) {
        let originalUrl = req.originalUrl.replace('/api/', '/api/')
        console.log('proxyReqPathResolver questionset', originalUrl, require('url').parse(originalUrl).path);
        return require('url').parse(originalUrl).path;
    },
    proxyReqOptDecorator: function (proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 1')
        // you can update headers
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['Cookie'] = PORTAL_COOKIES;
        return proxyReqOpts;
    }
}));
app.use(['/content/preview/*', '/content-plugins/*', '/assets/public/*'], proxy(BASE_URL, {
    https: true,
    proxyReqPathResolver: function(req) {
        return require('url').parse(`https://${BASE_URL}` + req.originalUrl).path
    },
    proxyReqOptDecorator: function(proxyReqOpts, srcReq) {
        console.log('proxyReqOptDecorator 5')
        // you can update headers 
        proxyReqOpts.headers['Content-Type'] = 'application/json';
        proxyReqOpts.headers['user-id'] = 'content-editor';
        proxyReqOpts.headers['Cookie'] = PORTAL_COOKIES;
        proxyReqOpts.headers['authorization'] = `Bearer ${API_AUTH_TOKEN}`;
        return proxyReqOpts;
    }
}));
http.createServer(app).listen(app.get('port'), 3000);