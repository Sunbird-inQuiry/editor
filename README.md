# Sunbird Collection Editor

## Run Locally

`Use node version 14.15.0`

Fork the project

If you are new to Angular or getting started with a new Angular application, see [Angular's full Getting Started Guide](https://angular.io/start) and [Setting up your environment](https://angular.io/guide/setup-local).

> **_NOTE:_**
  `@project-sunbird/sunbird-collection-editor@5.1.*` versions will refer to angular 9 to 12 upgradation changes.


For existing applications, follow the steps below to begin using Collection editor library.
## :label: Step 1: Install the packages

The following commands will add `sunbird-collection-editor` library to your package.json file along with its dependencies.

```red
npm i @project-sunbird/sunbird-collection-editor --save
```

### Setting up the Collection Editor Library
Go to the root directory

```bash
  cd sunbird-collection-editor
```
npm i common-form-elements-web-v9 --save
npm i ng2-semantic-ui-v9 --save
npm i ngx-infinite-scroll --save
npm i lodash-es --save
npm i jquery.fancytree --save
npm i angular2-uuid --save
npm i @project-sunbird/client-services --save
npm i export-to-csv --save
npm i moment --save
npm i @project-sunbird/ckeditor-build-classic --save
npm i @project-sunbird/sunbird-pdf-player-v9 --save
npm i @project-sunbird/sunbird-epub-player-v9 --save
npm i @project-sunbird/sunbird-video-player-v9 --save
npm i @project-sunbird/sunbird-quml-player --save
npm i ngx-bootstrap@6.0.0 --save
npm i ng2-cache-service --save
npm i fine-uploader --save
npm i ngx-chips@2.2.0 --save
npm i epubjs --save
npm i videojs-contrib-quality-levels --save
npm i videojs-http-source-selector --save
npm i jquery --save
npm i express-http-proxy --save
npm i mathjax-full --save
npm i svg2img --save
npm i font-awesome --save
npm i @project-sunbird/sb-styles
```


Note: *As Collection library is build with angular version 12, we are using **bootstrap@4.6.1** and **ngx-bootstrap@6.0.0** which are the compatible versions.
For more reference Check compatibility document for ng-bootstrap [here](https://valor-software.com/ngx-bootstrap/#/documentation#compatibility)*  

## :label: Step 2: create and copy required assests

After installing the above dependencies, now we have to copy the required assets from the given folder to the assets folder of your angular application. It contains styles and plugins.

- Copy the assets from: [assets](https://github.com/Sunbird-Ed/sunbird-collection-editor/tree/release-4.8.0/src/assets)

<img width="320" alt="image" src="https://user-images.githubusercontent.com/36467967/154430084-44060eda-97a9-4fd4-a3c0-06364a8ba86f.png">

- Create a latexService.js in the root folder. Refer: [latexService.js](https://github.com/Sunbird-Ed/sunbird-collection-editor/blob/release-4.8.0/latexService.js)

- Create a proxy.conf.json in the root folder. Refer: [proxy.conf.json](https://github.com/Sunbird-Ed/sunbird-collection-editor/blob/release-4.8.0/proxy.conf.json)

- Create server.js in the root folder. Refer: [server.js](https://github.com/Sunbird-Ed/sunbird-collection-editor/blob/release-4.8.0/server.js) 


## :label: Step 3: Include the styles, scripts and assets in angular.json

Now open the `angular.json` file and add the following under `architect.build.assets` for default project
  
```diff
{
  ...
  "build": {
    "builder": "@angular-devkit/build-angular:browser",
    "options": {
      ...
      ...
      "aot": false,
      "assets": [
        ...
        ...
+        {
+          "glob": "**/*",
+          "input": "node_modules/@project-sunbird/sunbird-pdf-player-v9/lib/assets/",
+         "output": "/assets/"
+        },
+        {
+          "glob": "**/*",
+          "input": "node_modules/@project-sunbird/sunbird-video-player-v9/lib/assets/",
+          "output": "/assets/"
+        },
+        {
+          "glob": "**/*",
+          "input": "node_modules/@project-sunbird/sunbird-collection-editor/lib/assets",
+          "output": "/assets/"
+        },
+        {
+          "glob": "**/*",
+          "input": "node_modules/@project-sunbird/sunbird-quml-player/lib/assets/",
+          "output": "/assets/"
+        }
      ],
      "styles": [
        ...
+        "src/assets/quml-styles/quml-carousel.css",
+        "node_modules/@project-sunbird/sb-styles/assets/_styles.scss",
+        "src/assets/lib/semantic/semantic.min.css",
+        "src/assets/styles/styles.scss",
+        "node_modules/font-awesome/css/font-awesome.css",
+        "node_modules/video.js/dist/video-js.min.css",
+        "node_modules/@project-sunbird/sunbird-video-player-v9/lib/assets/videojs.markers.min.css",
+        "node_modules/videojs-http-source-selector/dist/videojs-http-source-selector.css"
      ],
      "scripts": [
        ...
+        "node_modules/epubjs/dist/epub.js",
+        "src/assets/libs/iziToast/iziToast.min.js",
+        "node_modules/jquery/dist/jquery.min.js",
+        "node_modules/jquery.fancytree/dist/jquery.fancytree-all-deps.min.js",
+        "src/assets/lib/dimmer.min.js",
+        "src/assets/lib/transition.min.js",
+        "src/assets/lib/modal.min.js",
+        "src/assets/lib/semantic-ui-tree-picker.js",
+        "node_modules/@project-sunbird/client-services/index.js",
+        "node_modules/video.js/dist/video.js",
+        "node_modules/@project-sunbird/sunbird-video-player-v9/lib/assets/videojs-markers.js",
+        "node_modules/videojs-contrib-quality-levels/dist/videojs-contrib-quality-levels.min.js",
+        "node_modules/videojs-http-source-selector/dist/videojs-http-source-selector.min.js"
      ]
    }
  }
  ...
  ...
}
```

It will create a `/dist/collection-editor-library` folder at the root directory and also copy all the required assets.


### Starting up Sample application

A sample angular application is included as part of this repo

In another terminal tab -

From the root directory - Start the server

```bash
  npm run start
```
The demo app will launch at `http://localhost:4200`

### Run Node server to proxy the APIs
From the root directory - go to `server.js` file
```bash
Update the host variable to which env your pointing. example if you are pointing sunbird dev instance update veriable like below
const host = 'dev.sunbirded.org'

add `authorization` token as shown below
proxyReqOpts.headers['authorization'] = 'Bearer XXXX'
```

Now open `app.module.ts` file and import like this:
 
```diff
+ import { EditorCursor } from 'collection-editor-library';
+ import { QuestionCursor } from '@project-sunbird/sunbird-quml-player';
+ import { EditorCursorImplementationService } from './editor-cursor-implementation.service';

    "assets": [
              "src/favicon.ico",
              "src/assets",
              {
                "glob": "**/*",
                "input": "./node_modules/@project-sunbird/sunbird-collection-editor-v9/lib/assets/",
                "output": "/assets/"
              }
            ],

######  Step 3: Import the modules and components

Add to `NgModule` for the application in which you want to use:

    import { CollectionEditorLibraryModule } from 'sunbird-collection-editor-v9';


## :label: Step 5: Import the modules and components

Include `CollectionEditorLibraryModule` in your app module:

```diff
  import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
+  import { CollectionEditorLibraryModule, EditorCursor } from '@project-sunbird/sunbird-collection-editor';
  import { RouterModule } from '@angular/router';
  import { QuestionCursor } from '@project-sunbird/sunbird-quml-player';
  import { EditorCursorImplementationService } from './editor-cursor-implementation.service';

    @NgModule({
	    ...
	    imports: [
            CollectionEditorLibraryModule,
	    ...
    })

### How to use question editor
In your template add

	<lib-editor [editorConfig]="editorConfig" (editorEmitter)="editorEventListener($event)" ></lib-editor>

#### Input for library

A sample config file is included in the demo app at `src/app/data.ts`

    editorConfig: {
        context: {
            identifier: 'do_1132125506761932801130',
            user: {},
            framework: '',
            channel: '',
            uid: "
        },
        config: {
            mode: 'edit', // edit / review / read
            maxDepth: 0,
            objectType: 'QuestionSet',
            primaryCategory: 'Practice Question Set',
            isRoot: true,
            iconClass: 'fa fa-book',
            children: {
                Question: [
                    'Multiple Choice Question',
                    'Subjective Question'
                ]
            },
            hierarchy: {}
        }
    }
