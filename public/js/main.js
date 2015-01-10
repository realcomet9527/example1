$(document).ready(function() {

  var CSRF_HEADER = 'X-CSRF-Token';

  var setCSRFToken = function(securityToken) {
    jQuery.ajaxPrefilter(function(options, _, xhr) {
      if (!xhr.crossDomain) {
        xhr.setRequestHeader(CSRF_HEADER, securityToken);
      }
    });
  };

  setCSRFToken($('meta[name="csrf-token"]').attr('content'));

  $('.start-challenge').on('click', function() {
      $(this).parent().remove();
      $('.challenge-content')
        .removeClass('hidden-element')
        .addClass('animated fadeInDown');
  });

  $('.completed-challenge').on('click', function() {
      $('#complete-dialog').modal('show');

      l = location.pathname.split('/');
      cn = l[l.length - 1];
      console.log(cn);
      $.ajax({
          type: 'POST',
          data: {challengeNumber: cn},
          url: '/completed_challenge/'
      });
  });

  $('.skip-challenge').on('click', function() {
      $('#skip-dialog').modal('show');
  });

  $('.next-button').on('click', function() {
      l = location.pathname.split('/');
      window.location = '/challenges/' + (parseInt(l[l.length - 1]) + 1);
  });
});

var profileValidation = angular.module('profileValidation',['ui.bootstrap']);
profileValidation.controller('profileValidationController', ['$scope', '$http',
    function($scope, $http) {
        $http.get('/account/api').success(function(data) {
            $scope.user = data.user;
            $scope.user.profile.username = $scope.user.profile.username.toLowerCase();
            $scope.user.email = $scope.user.email.toLowerCase();
            $scope.user.profile.twitterHandle = $scope.user.profile.twitterHandle.toLowerCase();
        });
    }
]);

profileValidation.controller('emailSignUpController', ['$scope',
    function($scope) {

    }
]);

profileValidation.controller('emailSignInController', ['$scope',
    function($scope) {

    }
]);

profileValidation.directive('uniqueUsername', function($http) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            element.bind("keyup", function (event) {
                ngModel.$setValidity('unique', true);
                if (element.val()) {
                    $http.get("/api/checkUniqueUsername/" + element.val()).success(function (data) {
                        if (data) {
                            ngModel.$setValidity('unique', false);
                        }
                    });
                }
            });
        }
    };
});

profileValidation.directive('uniqueEmail', function($http) {
    return {
        restrict: 'A',
        require: 'ngModel',
        link: function (scope, element, attrs, ngModel) {
            element.bind("keyup", function (event) {
                ngModel.$setValidity('unique', true);
                if (element.val()) {
                    console.log(encodeURIComponent(element.val()));
                    $http.get("/api/checkUniqueEmail/" + encodeURIComponent(element.val())).success(function (data) {
                        if (data) {
                            ngModel.$setValidity('unique', false);
                        }
                    });
                }
            });
        }
    };
});