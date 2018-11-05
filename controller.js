/**
 * Created by xiye on 9/1/17.
 */
//constants
var BASE_URL = 'http://localhost:8080/MicroStrategyLibrary/api/';


/* PROVIDE EITHER ID OR NAME HERE IF YOU WANT TO USE A SPECIFIC PROJECT */
var PROJECT_ID = null;
var PROJECT_NAME = null;


/* PROVIDE EITHER ID OR NAME HERE IF YOU WANT TO USE A SPECIFIC CONFIGURATION FOLDER */
var FOLDER_ID = null;
var FOLDER_NAME = null;

/* PROVIDE THE NUMBER OF DOCUMENTS TO DISPLAY WITHIN THE FOLDER IF YOU LIKE TO. OTHERWISE, THE DEFAULT WILL BE 200.  */
var NUM_OF_DOCS_TO_DISPLAY = null;

var USERNAME = 'administrator';
var PASSWORD = '';

var todoApp = angular.module("folderBrowsingApp", [])
    .constant("docListActiveClass", "btn-primary")
    .controller("ToDoCtrl", function ($scope, $http, docListActiveClass) {

        $scope.projectId = PROJECT_ID;
        $scope.folderId = FOLDER_ID;
        $scope.baseUrl = BASE_URL;

        //initialize view to list view
        $scope.showList = "list.html";

        getAuthToken($scope, $http)
            .then(function (response) {
                $scope.authToken = response.headers("X-MSTR-AuthToken");
                return getAllProjects($scope, $http);
            })
            .then(function (response) {
                $scope.projects = response.data;
                getTheProject($scope);
                return getConfigurationLevelFolders($scope, $http);
            })
            .then(function (response) {
                $scope.configurationFolders = response.data;
                getTheFolder($scope);
                return searchDocsInFolder($scope, $http);
            })
            .then(function (response) {
                $scope.docsInFolder = prepareData(response.data.result);
            });

        $scope.viewDocs = function () {
            return $scope.showList === "list.html" ? "list.html" : "showDocView.html";
        }

        $scope.goToListView = function () {
            return $scope.showList = "list.html";
        }


        $scope.openDoc = function (currDoc) {
            //clear content of div, so it does not show previous dossier while switching between dossiers
            var myEl = angular.element(document.querySelector('#dossierContainer'));
            myEl.empty();

            $scope.currentDocId = currDoc.id;
            $scope.showList = true;
            $scope.showDossier();
        }

        $scope.openDocFromMain = function (currDoc) {

            $scope.showList = "showDocView.html";
            $scope.currentDocId = currDoc.id;
        }

        $scope.highlightSelection = function (selectedDocId) {
            return selectedDocId.id == $scope.currentDocId ? docListActiveClass : '';
        }

        /**
         * Hide 'Go to list view' button if already on the list view.
         * @returns {boolean}
         */
        $scope.hideButton = function () {
            if ($scope.showList === "list.html") {
                return true;
            } else {
                return false;
            }
        }


        /**
         * Function to embed documents view.
         * In the example below, we pass an authToken to the create function to authenticate.
         */
        $scope.showDossier = function () {

            var placeHolderDiv = document.getElementById("dossierContainer");
            var projectUrl = 'http://localhost:8080/MicroStrategyLibrary/app/' + $scope.projectId;
            var dossierUrl = projectUrl + '/' + $scope.currentDocId;
            microstrategy.dossier.create({
                placeholder: placeHolderDiv,
                //url should match /dossier/projectId/docId
                url: dossierUrl,
                enableCustomAuthentication: true,
                enableResponsive: true,
                customAuthenticationType: microstrategy.dossier.CustomAuthenticationType.AUTH_TOKEN,
                getLoginToken: function () {
                    return getEmbeddedAuthToken($http).then(function (response) {
                        return response.headers("X-MSTR-AuthToken");
                    })
                }
            });
        }

    });
/**
 * Gettting authToken for embedding dossiers
 * @param BASE_URL
 * @param $http
 * @returns {*}
 */
function getEmbeddedAuthToken($http) {

    //application/x-www-form-encoded form data
    var credentials = 'username=' + USERNAME + '&loginMode=1&password=' + PASSWORD;

    var loginUrl = 'auth/login';

    return $http({
        url: BASE_URL + loginUrl,
        method: "POST",
        data: credentials,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
}

/**
 * Method to get the authToken
 * @param $scope
 * @param $http
 */
function getAuthToken($scope, $http) {

    //application/x-www-form-encoded form data
    var credentials = 'username=' + USERNAME + '&loginMode=1&password=' + PASSWORD;

    var loginUrl = 'auth/login';

    return $http({
        url: $scope.baseUrl + loginUrl,
        method: "POST",
        data: credentials,
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'X-Requested-With': 'XMLHttpRequest'
        }
    });
}

/**
 * Function to get all the projects.
 * @param $scope
 * @param $http
 * @returns {*}
 */
function getAllProjects($scope, $http) {

    var requestUrl = $scope.baseUrl + 'projects';

    return $http({
        url: requestUrl,
        method: 'GET',
        headers: {
            'X-MSTR-AuthToken': $scope.authToken
        }
    });
}

/**
 * Function to get the object ID of MicroStrategyTutorial Project
 * @param $scope
 */
function getTheProject($scope) {

    /* Find the project ID */
    if ($scope.projects && $scope.projects.length > 0) {

        /* Go through returned project list to find the project*/
        if (PROJECT_ID && PROJECT_ID.length > 0) {
            $scope.projects.forEach(function (e) {
                if (e.id === PROJECT_ID) {
                    $scope.projectId = e.id;
                }
            })
        } else {
            if (PROJECT_NAME == null || PROJECT_NAME.length <= 0) {
                PROJECT_NAME = 'MicroStrategy Tutorial';
            }
            $scope.projects.forEach(function (e) {
                if (e.name === 'MicroStrategy Tutorial') {
                    $scope.projectId = e.id;
                }
            })
        }

        /* If didn't find the project matching the projectName, use the first project*/
        $scope.projectId = ($scope.projectId == null ? $scope.projects[0].id : $scope.projectId);
    }

}


/**
 * Search all the documents in the given folder
 * @param $scope
 * @param $http
 */
function searchDocsInFolder($scope, $http) {
    var requestUrl = $scope.baseUrl + 'searches/results';
    NUM_OF_DOCS_TO_DISPLAY = NUM_OF_DOCS_TO_DISPLAY == null ? 200 : NUM_OF_DOCS_TO_DISPLAY;

    return $http({
        url: requestUrl,
        method: 'GET',
        headers: {
            'X-MSTR-AuthToken': $scope.authToken,
            'X-MSTR-ProjectID': $scope.projectId
        },
        params: {
            pattern: 4,
            root: $scope.folderId,
            type: 55, /* Only search for documents */
            getAncestors: false,
            offset: 0,
            limit: NUM_OF_DOCS_TO_DISPLAY /* Retrieve all documents */
        }
    });
}

/**
 * Get all the configuration-level folders given the project
 * @param $scope
 * @param $http
 * @returns {*}
 */
function getConfigurationLevelFolders($scope, $http) {

    var requestUrl = $scope.baseUrl + 'folders';

    return $http({
        url: requestUrl,
        method: 'GET',
        headers: {
            'X-MSTR-AuthToken': $scope.authToken,
            'X-MSTR-ProjectID': $scope.projectId
        },
        params: {
            offset: 0,
            limit: -1 /* Retrieve all of them */
        }
    });
}

/**
 * Get the folder ID of a given folder ID or folder name.
 * @param $scope
 */
function getTheFolder($scope) {
    if ($scope.configurationFolders && $scope.configurationFolders.length > 0) {

        //If folderId was provided/specified
        if (FOLDER_ID && FOLDER_ID.length > 0) {
            $scope.configurationFolders.forEach(function (e) {
                if (e.id === FOLDER_ID) {
                    $scope.folderId = e.id;
                }
            });
        }

        //If folderId was not provided or provided folderId does not match any returned folders
        if ($scope.folderId == null) {

            if (FOLDER_NAME == null || FOLDER_NAME.length <= 0) {
                FOLDER_NAME = "Public Objects";
            }
            $scope.configurationFolders.forEach(function (e) {
                if (e.name === FOLDER_NAME) {
                    $scope.folderId = e.id;
                }
            });
        }

        //If provided folderName does not match any returned folders, search for 'Public Objects'
        if ($scope.folderId == null) {

            $scope.configurationFolders.forEach(function (e) {
                if (e.name === 'Public Objects') {
                    $scope.folderId = e.id;
                }
            });
        }
    }
}

/**
 * Append the URL of dossier cover page to the data array if there is any
 * @param arr; parseDate from String to Date objects
 * @returns {*}
 */
function prepareData(arr) {

    arr.forEach(function (e) {
        /* append cover page URL */
        e.imageUrl = e.iconPath && e.iconPath.length != 0 ? e.iconPath : 'dossier.png';
        /* Parse string to Date objects */
        e.dateModified = parseDate(e.dateModified);
        e.dateCreated = parseDate(e.dateCreated);
    });
    return arr;
}

/**
 * Parse the datetime into the correct format so that they can be convert from String to
 * Date object
 * @param date
 * @returns {Date}
 */
function parseDate(date) {
    var newDate = date.replace('.000', '');
    var len = newDate.length;
    return new Date(newDate.slice(0, len - 2) + ':' + newDate.slice(len - 2, len));
}
