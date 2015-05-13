var paymentApp = angular.module("paymentApp", ['ngAnimate', 'angularPayments', 'ui.router']);


paymentApp.config(function($sceDelegateProvider, $httpProvider) {
  $sceDelegateProvider.resourceUrlWhitelist([
    // Allow same origin resource loads.
    'self',
    // Allow loading from our assets domain.  Notice the difference between * and **.
    'https://api.sandbox.veritrans.co.id/v2/**'
  ]);

  // The blacklist overrides the whitelist so the open redirect here is blocked.
  // $sceDelegateProvider.resourceUrlBlacklist([
  //   'http://myapp.example.com/clickThru**'
  // ]);
  // We need to setup some parameters for http requests
  // These three lines are all you need for CORS support
  // $httpProvider.defaults.useXDomain = true;
  // $httpProvider.defaults.withCredentials = true;
  // delete $httpProvider.defaults.headers.common['X-Requested-With'];
});

paymentApp.config(function($stateProvider, $urlRouterProvider, $locationProvider) {
  $urlRouterProvider.otherwise('/home');

  $stateProvider

    .state('home', {
      url: '/home',
      templateUrl: 'pay.html'
    })

  $locationProvider.html5Mode(true);

})

//Factory
paymentApp.value('PaymentTypes', [{
    display_name: "Credit Card",
    payment_type: "credit_card",
    image_class: "fa fa-lg fa-credit-card"
  }, {
    display_name: "Virtual Account",
    payment_type: "permata",
    image_class: "fa fa-lg fa-diamond"
  }, {
    display_name: "BBM Pay",
    payment_type: "bbm_pay",
    image_class: "bbm-logo"
  }]
);



//Service
paymentApp.service('CreditCardService', function(){

  this.numberValidation = function (ccnumber) {
    var len = ccnumber.length;
    var cardType, valid;
    mul = 0,
    prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]],
    sum = 0;

    while (len--) {
        sum += prodArr[mul][parseInt(ccnumber.charAt(len), 10)];
        mul ^= 1;
    }

    if (sum % 10 === 0 && sum > 0) {
      valid = "valid"
    } else {
      valid = "not valid"
    }
    ccnumber = ccnumber.toString().replace(/\s+/g, '');

    if(/^5[1-5]/.test(ccnumber)) {
      cardType = "MasterCard";
    }
    else if (/^4/.test(ccnumber)) {
      cardType = "Visa";
    } else {
      cardType = "None";
    }

    return {
      cardType: cardType,
      valid: valid
    }
  }

});

paymentApp.controller("buttonController", function($scope){
  $scope.buttonDetails = 'SHOW DETAILS';
  $scope.buttonActive = false;
  $scope.button2Active = false;
  $scope.button3Active = false;

  $scope.buttonClicked = function () {
    if ($scope.buttonActive == false){
      $scope.buttonActive = !($scope.buttonActive);
      $scope.buttonDetails = 'HIDE DETAILS';
    } else {
      $scope.buttonActive = !($scope.buttonActive);
      $scope.buttonDetails = 'SHOW DETAILS';
    }
  }

  $scope.button2Clicked = function () {
    if ($scope.button2Active == false){
      $scope.button2Active = !($scope.button2Active);
    } else {
      $scope.button2Active = !($scope.button2Active);
    }
  }

  $scope.button3Clicked = function () {
    if ($scope.button3Active == false){
      $scope.button3Active = !($scope.button3Active);
    } else {
      $scope.button3Active = !($scope.button3Active);
    }
  }

});

paymentApp.controller('DropdownCtrl', function ($scope, $log) {
  $scope.items = [
    'The first choice!',
    'And another choice for you.',
    'but wait! A third!'
  ];

  $scope.status = {
    isopen: false
  };

  $scope.toggled = function(open) {
    $log.log('Dropdown is now: ', open);
  };

  $scope.toggleDropdown = function($event) {
    $event.preventDefault();
    $event.stopPropagation();
    $scope.status.isopen = !$scope.status.isopen;
  };
});

paymentApp.controller("submitController", function($scope, $http, CreditCardService, PaymentTypes){
  $scope.card_exp_date = '12 / 2016';

  $scope.creditCard = {
    card_number: '4811111111111114',
    card_cvv: '123',
    card_exp_month: $scope.card_exp_date.substr(0, 2),
    card_exp_year: $scope.card_exp_date.substr(5, 4)
  };

  $scope.status = 'default';
  $scope.responseStatus = '';
  $scope.statusMessage = '';
  $scope.paymentStatus = 'default';


  $scope.purchasedProducts = [
    { 
      id: "1",
      name: "Baygon rasa jambu batu",
      quantity: 1,
      price: 50000
    }
  ];

  $scope.customerDetails = {
    first_name: "Danny",
    phone: "83199440068",
    email: "noreply@veritrans.co.id",
    billing_address: {
      last_name: "Pranoto",
      address: "Jalan Ciumbuleuit",
      city: "Bandung",
      postal_code: "40141"
    }
  };

  $scope.payments = PaymentTypes;
  
  $scope.paymentType = "default";

  $scope.bankType = '';
  $scope.installment = '';

  $scope.totalPrice = function() {
    var total = 0;
    for(var i = 0; i < $scope.purchasedProducts.length; i++){
      total += $scope.purchasedProducts[i].quantity * $scope.purchasedProducts[i].price;
    }
    return total;
  }

  $scope.$watch('creditCard.card_number', function(val){
    if (val != undefined){
      var cardType = CreditCardService.numberValidation(val).cardType;
      var valid = CreditCardService.numberValidation(val).valid;
      if (val.length == 16) {
        if (valid === 'valid'){
          if (cardType === 'Visa'){
            $scope.status = 'visa';
          } else if (cardType === 'MasterCard'){
            $scope.status = 'mastercard';
          }
          else {
            $scope.status = 'invalid';
          }
        } else if (valid === 'not valid'){
          $scope.status = 'invalid';
        }      
      } else {
        $scope.status = 'default';
      }
    }

  });

  $scope.loadFinish = function(){
    if ($scope.paymentStatus == '3d-secure-loading'){
      setTimeout(function() {
        $scope.$apply(function(){
          $scope.paymentStatus = '3d-secure';
        })
      }, 1000);
    }
  }

  $scope.submit = function() {
    // Sandbox URL
    if ($scope.paymentType.payment_type == 'credit_card'){
      if ($scope.form.creditCardForm.$valid && $scope.form.shippingForm.$valid){
        Veritrans.url = "https://api.sandbox.veritrans.co.id/v2/token";
        Veritrans.client_key = "VT-client-SimkwEjR3_fKj73D";
        var card = function () {
          return {
            "card_number": $scope.creditCard.card_number,
            "card_exp_month": $scope.creditCard.card_exp_month,
            "card_exp_year": $scope.creditCard.card_exp_year,
            "card_cvv": $scope.creditCard.card_cvv,
            "secure": false,
            "gross_amount": $scope.totalPrice()
          }
        };

        function callback(response) {
          console.log(response);
          if (response.redirect_url) {
            console.log("3D SECURE");
            $scope.$apply(function(){
              $scope.responseStatus = response;
              $scope.paymentStatus = '3d-secure-loading';
            });
          }
          else if (response.status_code == "200") {
            console.log("NOT 3-D SECURE");
            // Success 3-D Secure or success normal
            console.log($scope.paymentStatus);
            $scope.$apply(function(){
              $scope.paymentStatus = 'charge-loading';
            });
            $http({
              method: 'POST',
              url: "http://128.199.71.156:8080/v1/charge", 
              data : {
                client_key : "VT-client-SimkwEjR3_fKj73D",
                payment_type : "credit_card",
                item_details : $scope.purchasedProducts,
                credit_card : {
                  token_id : response.token_id,
                  save_token_id : false
                },
                customer_details : {
                  email : $scope.customerDetails.email
                }
              }
              ,
              headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
              }
              }).
            success(function(response) {
              console.log(response)
              //Confirm Transaction
              $http({
                method: 'POST',
                url: "http://128.199.71.156:8080/v1/merchant/payment/confirm", 
                data : {
                  client_key : "VT-client-SimkwEjR3_fKj73D",
                  transaction_id : response.transaction_id
                },
                headers: {
                  'Content-Type': 'application/json',
                  'Accept': 'application/json'
                }
              }).
              success(function(response){
                console.log(response);
                setTimeout(function() {
                  $scope.$apply(function(){
                    $scope.responseStatus = response;
                    $scope.paymentStatus = 'complete';
                  })
                }, 10000);
              }).
              error(function(response){
                console.log(response);
              });

            }).
            error(function(response) {
              console.log(response);
            });
          }
          else {
            // Failed request token
            $scope.responseStatus = 'invalid';
            $scope.statusMessage = response.status_message;
          }
          console.log($scope.paymentStatus);
          console.log("callback");

        }

        Veritrans.token(card, callback);        
      }
      else {
        $scope.responseStatus = 'invalid';
        $scope.statusMessage = 'Invalid Form! Please make sure all the details below has been filled and valid';
      }

    }
    else if ($scope.paymentType.payment_type == 'permata'){
      if ($scope.form.shippingForm.$valid){
        console.log("Permata Success");
      }
      else {

      }
    }

  }

});

var INTEGER_REGEXP = /^\d+$/;
paymentApp.directive('number', function() {
  return {
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.number = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(modelValue)) {
          // consider empty models to be valid
          return true;
        }

        if (INTEGER_REGEXP.test(viewValue)) {
          // it is valid
          if (attrs.number == 'month'){
            if (viewValue <= 12 && viewValue >= 1){
              return true;
            }
            else{
              return false;
            }
          }
          else if (attrs.number == 'year'){
            var date = new Date();
            if (viewValue >= date.getFullYear()){
              return true;
            }
            else{
              return false;
            }
          }
          else {
            return true; 
          }
        }
        // it is invalid
        return false;
      };
    }
  };
});

paymentApp.directive('expDate', function() {
  return{
    require: 'ngModel',
    link: function(scope, elm, attrs, ctrl) {
      ctrl.$validators.expDate = function(modelValue, viewValue) {
        if (ctrl.$isEmpty(viewValue)) {
          return true;
        }
        else{
          var date = viewValue.split("/");
          var currentDate = new Date();
          if (viewValue.length == 5) {
            //Format date mm/yy
            var str = '20';
            date[1] = str.concat(date[1]);
          }

          if (currentDate.getFullYear() == date[1]){
            if (date[0] >= currentDate.getMonth() && date[0] <= 12){
              return true;
            }
            else {
              return false;
            }            
          }
          else if (date[1] > currentDate.getFullYear()){
            if (date[0] >= 1 && date[0] <= 12){
              return true;
            }
            else{
              return false;
            }
          }
          else{
            return false;
          }
        }
      }
    }

  }
});

paymentApp.directive('iframeOnload', [function(){
return {
    scope: {
        callBack: '&iframeOnload'
    },
    link: function(scope, element, attrs){
        element.on('load', function(){
            return scope.callBack();
        })
    }
}}])

paymentApp.directive('inputShipping', function() {
  return{
    scope: {
      type: '@',
      name: '@',
      model: '=?',
      form: '=',
      displayName: '@',
      maxlength: '@'
    },
    templateUrl: 'templates/input-shipping.html',
    link: function(scope, element, attrs){
      scope.model = scope.model || '';
      scope.invalid = '';

      scope.$watch("model", function(value){
        var regexRequired = new RegExp(/^[\s\t\r\n]*\S+/ig);
        var regexEmail = new RegExp(/^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i);
        var regexNumber = new RegExp(/^\d+$/);
        if (value == undefined){
          scope.invalid = 'required';
        }
        else {
          if (attrs.name == 'email'){
            regexEmail.test(value) ? scope.invalid = 'valid' : scope.invalid = 'email';
          }
          else if (attrs.name == 'phonenumber'){
            regexNumber.test(value) ? scope.invalid = 'valid' : scope.invalid = 'phone';
          }
          else {
            regexRequired.test(value) ? scope.invalid = 'valid' : scope.invalid = "required";
          }
        }
        console.log (scope.model + ' : ' + scope.invalid)
      });

    }
  }
});

paymentApp.directive('loading', function ($http) {
  return {
      restrict: 'A',
      link: function (scope, elm, attrs)
      {
          scope.isLoading = function () {
              return $http.pendingRequests.length > 0;
          };

          scope.$watch(scope.isLoading, function (v)
          {
              if(v){
                  $(elm).show();
              }else{
                  $(elm).hide();
              }
          });
      }
  };
});

paymentApp.directive('paymentsVal', function(CreditCardService){
  return{
    restrict: 'A',
    require: 'ngModel',
    link: function (scope, element, attrs) {
      scope.$watch('creditCard.card_exp_month', function(newValue, oldValue) {
          var arr = String(newValue).split("");
          if (arr.length === 0) return;
          if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return;
          if (arr.length === 2 && newValue === '-.') return;
          if (isNaN(newValue)) {
              scope.creditCard.card_exp_month = oldValue;    
          }
      });
      scope.$watch('creditCard.card_exp_year', function(newValue, oldValue) {
          var arr = String(newValue).split("");
          if (arr.length === 0) return;
          if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return;
          if (arr.length === 2 && newValue === '-.') return;
          if (isNaN(newValue)) {
              scope.creditCard.card_exp_year = oldValue;    
          }
      });
    }
  }  
});

// paymentApp.directive('ccLogo', function(){
//   return{
//     restrict: 'A',
//     link: function ($scope, element, attrs){
//       $scope.$watch($scope.creditCard.card_number, function(val){
//         var cardType = CreditCardService.numberValidation(val).cardType;
//         var valid = CreditCardService.numberValidation(val).valid;
//         if (valid === 'valid'){
//           if (cardType === 'Visa'){
//             $scope.status = 'visa';
//           } else if (cardType === 'MasterCard'){
//             $scope.status = 'mastercard';
//           }
//         } else if (valid === 'not valid' && val.length == 16){
//           $scope.status = 'invalid';
//         }

//       });
//     }
//   }
// });

// paymentApp.directive('autoCcFormat', function())


paymentApp.filter('mycurrency', function(){
  return function(number){
    var rev     = parseInt(number, 10).toString().split('').reverse().join('');
    var rev2    = '';
    for(var i = 0; i < rev.length; i++){
        rev2  += rev[i];
        if((i + 1) % 3 === 0 && i !== (rev.length - 1)){
            rev2 += '.';
        }
    }
    return 'Rp. ' + rev2.split('').reverse().join('') + ',00';
  };
});

angular.module('myApp', ['filters']);

angular.module('filters', []).  
filter('validate', [function () {  
    return function (ccnumber) {
      if (!ccnumber) { return ''; }
      var len = ccnumber.length;
      var cardType, valid;
      mul = 0,
      prodArr = [[0, 1, 2, 3, 4, 5, 6, 7, 8, 9], [0, 2, 4, 6, 8, 1, 3, 5, 7, 9]],
      sum = 0;

      while (len--) {
          sum += prodArr[mul][parseInt(ccnumber.charAt(len), 10)];
          mul ^= 1;
      }

      if (sum % 10 === 0 && sum > 0) {
        valid = "valid"
      } else {
        valid = "not valid"
      }
      ccnumber = ccnumber.toString().replace(/\s+/g, '');

      if(/^5[1-5]/.test(ccnumber)) {
        cardType = "MasterCard";
      }
      if (/^4/.test(ccnumber)) {
        cardType = "Visa"
      }
      return ccnumber + " is a(n) " + cardType + " and it's " + valid;
    };
}]);



paymentApp.controller("dropdownDemo", function($scope) {

});

paymentApp.run(function($rootScope) {
  angular.element(document).on("click", function(e) {
    $rootScope.$broadcast("documentClicked", angular.element(e.target));
  });
});

paymentApp.directive("dropdown", function($rootScope) {
  return {
    restrict: "E",
    templateUrl: "templates/dropdown.html",
    scope: {
      placeholder: "@",
      list: "=",
      selected: "=",
      property: "@"
    },
    link: function(scope) {
      scope.listVisible = false;
      scope.isPlaceholder = true;

      scope.select = function(item) {
        scope.isPlaceholder = false;
        scope.selected = item;
        scope.listVisible = false;
      };

      scope.isSelected = function(item) {
        return item[scope.property] === scope.selected[scope.property];
      };

      scope.show = function() {
        scope.listVisible = true;
      };

      // $rootScope.$on("documentClicked", function(inner, target) {
      //   console.log($(target[0]).is(".dropdown-display.clicked") || $(target[0]).parents(".dropdown-display.clicked").length > 0);
      //   if (!$(target[0]).is(".dropdown-display.clicked") && !$(target[0]).parents(".dropdown-display.clicked").length > 0)
      //     scope.$apply(function() {
      //       scope.listVisible = false;
      //     });
      // });

      // scope.$watch("listVisible", function(value){
      //   console.log("list Visible:" + scope.listVisible);
      // });

      scope.$watch("selected", function(value) {
        scope.isPlaceholder = scope.selected[scope.property] === undefined;
        scope.display = scope.selected;
      });
    }
  }
});