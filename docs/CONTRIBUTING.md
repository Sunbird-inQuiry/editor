# Welcome to Editor contributing guide <!-- omit in toc -->

In this guide you will get an overview of the contribution workflow of the editor.

**If you don't have git on your machine,** [install it](https://help.github.com/articles/set-up-git/).

## Getting started

#### Fork the project
Go to GitHub and [fork the repository](https://github.com/Sunbird-inQuiry/editor.git).
The forked repository will appear in your GitHub account as 

`https://github.com/<YOUR-USERNAME>/editor`
#### Clone the repository

Now clone the forked repository to your machine. Go to your GitHub account, open the forked repository, click on the code button and then click the copy to clipboard icon.

Open a terminal and run the following git command:

```
git clone "url you just copied"
```
For example: `git clone https://github.com/Sunbird-inQuiry/editor.git`

#### Go to the root directory and run the following command

```
cd editor
```

#### Install dependencies

```
npm install
```

#### Build the library

```
npm run build-lib
```

It will create a `/dist/questionset-editor-library` folder at the root directory and also copy all the required assets.

#### Starting up the sample application

A sample angular application is included as part of this repo

Open your terminal, then start the server


```
npm run start
```

The demo app will launch at http://localhost:4200


#### Set the auth token and questionset identifier

Go to the root directory - Open `server.js` file


Update the host variable to which env your pointing. example if you are pointing sunbird dev instance update variable like below
```javascript
const BASE_URL = 'dev.sunbirded.org'
const API_AUTH_TOKEN = 'XXXX'
const USER_TOKEN= 'YYYY'
```
Note: You will need actual `API_AUTH_TOKEN` and `USER_TOKEN`

If you are pointing to sunbird dev ([dev.sunbirded.org](https://dev.sunbirded.org/)), create a questionset in sunbird dev and set the do_id of created questionset in `data.ts` file

```javascript
export const questionSetEditorConfig = {
  context: {
    ...
    identifier: 'do_id', // identifier of questionset created in sunbird dev
    ...
  },
  config: {
    ...
    ...
  }
}
```
Run Node server to proxy the APIs (Open one more terminal in root folder and run the server.js ) as:


  ```
nodemon server.js
```

#### Now make the changes. Stick to the code-style guidelines and remember about tests and 100% code coverage!
#### Commit your changes and Push your changes to your forked repository
#### Go to your forked repository on GitHub. Use the pull request button to create the pull request of your changes.