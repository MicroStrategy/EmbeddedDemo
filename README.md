
![alt text](https://github.com/MicroStrategy/EmbeddedDemo/blob/master/screenShot.png)
## App Name:
MicroStrategy REST API & Dossier Embedded Demo

## App Description:
This App is a sample demo app to show the users how to use MicroStrategy REST APIs as well as how to embed dossier(s) into a 3rd party application. 

In this demo, we show documents in the MicroStrategy Tutorial project under Public Objects folder. The user can use the search bar to narrow down the documents they are looking for and select the document in the returned result to view the document. An embedded dossier will then be open and shown on the right side of the page. A “Go to list view” button can be used to go back to the list view for the user to see the detailed object information of the document.

A list of REST APIs were used in the demo. They were used to authenticating, getting all the projects, getting all the configuration-level folders given a project and searching for objects given a root folder.

## APIs used/demonstrated:

The REST APIs used in this demo are:
#### POST /auth/login 
Creating a MicroStrategy session given credentials and authentication mode. An authToken will be returned for latter operations.
In the demo, this API was used to create a configuration session.

#### GET /projects
Getting a list of projects which the authenticated user has access to.
In this demo, this API was used to get all the projects of the given i-Server.

#### GET /folders
Getting a list of all folders that are outside of projects, called configuration-level folders. This list includes folders such as users, user groups, databases, etc. which are not project-specific.
In this demo, this API was used to get all the configuration-level folders.

#### GET /searches/results
Using the stored results of the Quick Search engine to return search results and display them as a list. The Quick Search engine periodically indexes the metadata and stores the results in memory, making Quick Search very fast but with results that may not be the most recent.
In this demo, this API was used to find all the documents under the given folder.

#### microstrategy.dossier.create
In this demo, we used this API to embed the dossier into the web page.

## How to customize this App 
There are some variables at the beginning of the controller.js file that can be customized and configured for your own environment (i-Server, project, folder).
```
BASE_URL
```
Base URL of REST API. E.g. 'http://localhost:8080/MicroStrategyLibrary/api/'

```
PROJECT_ID/PROJECT_NAME
```
If you want to use a different project other than ‘MicroStrategy Tutorial’, you can provide the object ID of the project or the name of the project. If both the project ID and the project name are provided, the project ID will be used. If neither of the project ID or the project name are provided, ‘MicroStrategy Tutorial’ will be used.

```
FOLDER_ID/FOLDER_NAME
```
If you want to use a different folder other than ‘Public Objects’, you can provide the object ID of the configuration-level folder or the name of the configuration-level folder. If both the configuration-level folder ID and the configuration-level folder name are provided, the configuration-level folder ID will be used. If neither of the configuration-level folder ID or the configuration-level folder name are provided, ‘Public Objects’ will be used.

```
USERNAME
```
The username you want to be authenticated with. The default value is ‘administrator’.

```
PASSWORD
```
The username you want to be authenticated with. 

```
NUM_OF_DOCS_TO_DISPLAY
```
The max number of the documents that the user wants to display on the page. The default value is 200.

### Configuration required for cross origin in Library:
1. Set `auth.cors.origins=*` in MicroStrategyLibrary/WEB-INF/classes/config/configOverride.properties to enable cross origin for rest server.
2. - For 11.x and later Library, remove `X-Frame-Options : SAMEORIGIN` from <MicroStrategyLibrary-Installation-Directory>/WEB-INF/web.xml 
   - For 10.x Library, remove the line of `X-Frame-Options=SAMEORIGIN` from <MicroStrategyLibrary-Installation-Directory>/WEB-INF/classes/config/security_headers-index.properties to allow embedding a iframe with CORS
   
   OR

You can use Microstrategy REST API `PUT /admin/restServerSettings/security` and Set `"allowAllOrigins": true`


