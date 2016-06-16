'use strict';

angular.module('todoAppApp')
  .config(function($routeProvider) {
    $routeProvider
      .when('/admin', {
        templateUrl: 'app/admin/admin.html',
        controller: 'AdminCtrl'
      });
  });
