var express = require('express'),
    http = require('http');
    bodyParser = require('body-parser'),
    proxy = require('express-http-proxy'),
    urlHelper = require('url');
const latexService = require('./latexService.js')

// const BASE_URL = 'dev.sunbirded.org';
// const API_AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIzZGNjMzY3OWIwYTE0NmU2YWYyZjlmZDA5NWU5NTlkNCJ9.0NZhX5sqUNy-GZUya90aQFkr5ZNiqfOuELYz_IvoyS8";
const PORTAL_COOKIES= "connect.sid=s%3Ax9f68dmc8LgRik8LsrCKqQCWTaTe4787.vC%2Fw7cP1peCCDsnYq%2Bs3Vxu3Tthgy6UMMACajwkbZls"
// const USER_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJsclI0MWpJNndlZmZoQldnaUpHSjJhNlowWDFHaE53a21IU3pzdzE0R0MwIn0.eyJqdGkiOiIyOThjNTgyYy1lMzU4LTRlYjYtOWI0OS0yMjNmMWY3ZjA3ZDQiLCJleHAiOjE2MDAzNjE5OTksIm5iZiI6MCwiaWF0IjoxNjAwMjc1NTk5LCJpc3MiOiJodHRwczovL2Rldi5zdW5iaXJkZWQub3JnL2F1dGgvcmVhbG1zL3N1bmJpcmQiLCJhdWQiOiJwcm9qZWN0LXN1bmJpcmQtZGV2LWNsaWVudCIsInN1YiI6ImY6NWE4YTNmMmItMzQwOS00MmUwLTkwMDEtZjkxM2JjMGZkZTMxOjk1ZTQ5NDJkLWNiZTgtNDc3ZC1hZWJkLWFkOGU2ZGU0YmZjOCIsInR5cCI6IkJlYXJlciIsImF6cCI6InByb2plY3Qtc3VuYmlyZC1kZXYtY2xpZW50IiwiYXV0aF90aW1lIjowLCJzZXNzaW9uX3N0YXRlIjoiNjNkMWMxMDEtYWIxMi00ZjM3LTg5NjUtODM2Zjk0YWRlYWNmIiwiYWNyIjoiMSIsImFsbG93ZWQtb3JpZ2lucyI6WyJodHRwczovL2Rldi5zdW5iaXJkZWQub3JnIl0sInJlYWxtX2FjY2VzcyI6eyJyb2xlcyI6WyJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sIm5hbWUiOiJSZXZpZXdlciBVc2VyIiwicHJlZmVycmVkX3VzZXJuYW1lIjoibnRwdGVzdDEwMyIsImdpdmVuX25hbWUiOiJSZXZpZXdlciIsImZhbWlseV9uYW1lIjoiVXNlciIsImVtYWlsIjoidXMqKioqKioqKkB0ZXN0c3MuY29tIn0.NCiUbiPIbgmcGjjUO6m71cSyXfcf54BSh8bTBCtumxDP37hLdG2ysDTWWlpLGNXQGCYsXWazk4SwZwvhZnsPbOP8ExM-fOr_r4bAQcecePQIrTNawnN_pdq9iL_I22trwB7sP-LQxfh0jmZsHY3mRjBbqM20bDsXK5-wEnI9nu-8Cxd6rszQa09izAHEvEBNG0XJ-ZY4k_Cc9y8O4Mw_RJcsRPzDhqwgy_wOKb2z60YLT_7DnOxCPKfwbzSOTKBBeQ4qmVaiKh4fiaulvgC1us1dNLLMUbY1LQ5F3nU1e_BeAZ8C0LcAPc5RmjuJ1NEbF2-0I8tOpYwTgBNrhJgS5w";

// const BASE_URL = 'dock.sunbirded.org';
const BASE_URL = 'dev.inquiry.sunbird.org';
// // DOCK
const API_AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJ6cFJkUDJSY0dhNFM3RGozemRkaGZlWVFPRUhOMzhzOCJ9.ehAZy9phSA1z1EqEdVG7AcudlAX8MC1XYin1z0hXQTg";
// // SUNBIRD
// const API_AUTH_TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiIyZWIzYTUxOWFiMWE0Mzk0YTE1ZDk2MDA4ODcwNzQ0NSJ9.lCRpUdbFKeZ3_ZO5vzG3jcfArKtIWeC-tEXFFSdj3Gs";
// const PORTAL_COOKIES= "connect.sid=s%3AzuGggL0eSOtxZrQC_Q9sABO7IVQUx99N.sPCajujQhy1MfOo3dwcjKQW9%2BwHaC47O%2Fu8tUxVBztM"
const USER_TOKEN = "eyJhbGciOiJSUzI1NiIsInR5cCIgOiAiSldUIiwia2lkIiA6ICJHUnh4OHVyNDNwWEgzX1FNekJXZXJRUFdyWDAyUEprSzlDemwzaGM2MGZBIn0.eyJqdGkiOiJiYjZjYjY2ZC1kNGFjLTRkZWMtYjQ2NS0zMmMyMmUxYTljN2UiLCJleHAiOjE2ODEzNjQ0MjAsIm5iZiI6MCwiaWF0IjoxNjc4NzcyNDIwLCJpc3MiOiJodHRwczovL3N0YWdpbmcuc3VuYmlyZGVkLm9yZy9hdXRoL3JlYWxtcy9zdW5iaXJkIiwiYXVkIjoiYWNjb3VudCIsInN1YiI6ImY6OTc5NzM4YjctMjUzYy00YWRmLTk2NzMtYTg1N2VlYjg2MTE1OjFjZjg4ZWEzLTA4M2QtNGZkZi04NGJlLTM2MjhlNjNjZTdmMCIsInR5cCI6IkJlYXJlciIsImF6cCI6InByb2plY3Qtc3VuYmlyZC1zdGFnZS1jbGllbnQiLCJhdXRoX3RpbWUiOjAsInNlc3Npb25fc3RhdGUiOiI0ZjExMzc1OC0yMWFlLTQ1MTEtOGE5OS05YmZkZDg5YTAyODciLCJhY3IiOiIxIiwiYWxsb3dlZC1vcmlnaW5zIjpbImh0dHBzOi8vc3RhZ2luZy5zdW5iaXJkZWQub3JnLyJdLCJyZWFsbV9hY2Nlc3MiOnsicm9sZXMiOlsib2ZmbGluZV9hY2Nlc3MiLCJ1bWFfYXV0aG9yaXphdGlvbiJdfSwicmVzb3VyY2VfYWNjZXNzIjp7ImFjY291bnQiOnsicm9sZXMiOlsibWFuYWdlLWFjY291bnQiLCJtYW5hZ2UtYWNjb3VudC1saW5rcyIsInZpZXctcHJvZmlsZSJdfX0sInNjb3BlIjoiIiwibmFtZSI6ImNic2VzdGFnaW5nMUB5b3BtYWlsLmNvbSIsInByZWZlcnJlZF91c2VybmFtZSI6ImNic2VzdGFnaW5nMUB5b3BtYWlsLmNvbSIsImdpdmVuX25hbWUiOiJjYnNlc3RhZ2luZzFAeW9wbWFpbC5jb20iLCJlbWFpbCI6ImNiKioqKioqKioqKkB5b3BtYWlsLmNvbSJ9.RljkHBPJjMrB62nFehWqBq0uXxrpdg0AJSVlolV3hT_JhhOPoXucLa2_nze5VhON09g-n0aLqrTcTIMeJW7fpnL1vHEj3qUAuycN-vrDTcwl4zlcH3ty2WDrPTSJmzyDTKQk4P74KIimzr6dZooxtd6PNkSobq3bz_eu48ilx9oz1x1vTfwH2lYDU6Z6k0PirpHVAkNXlIdLPjAUT4iZ6fj7TMdMoETQ3RxZFPldfyWnDqE_Hvs3umhNce5hUBrXXtVyml_eDfSbEXwqGeqeFAi8DpnvV8dyYDX-TB9bWmhYO3aPxd0o0f1_fwECeE0A-YDZfYwA0emgeybBhgffbw";


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
app.use(['/action/questionset/v2/*',
    '/action/question/v2/*',
    '/action/collection/v1/*',
    '/action/object/category/definition/v1/*',
    '/action/collection/v1/*'
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