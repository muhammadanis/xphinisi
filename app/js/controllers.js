var paymentApp = angular.module("paymentApp", []);

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

  this.autoSpace = function (ccnumber) {
    var rev     = parseInt(ccnumber, 10).toString();
    var rev2    = '';
    for(var i = 0; i < rev.length; i++){
        rev2  += rev[i];
        if((i + 1) % 4 === 0 && i !== (rev.length - 1)){
            rev2 += ' ';
        }
    }
    return rev2;
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

paymentApp.controller("submitController", function($scope, $http, CreditCardService){
  $scope.creditCard = {
    card_number: '4811111111111114',
    card_cvv: '123',
    card_exp_month: '06',
    card_exp_year: '2020'
  };

  $scope.status = 'default';

  $scope.purchasedProducts = [
    { 
      productName: "LG Nexus 4 16GB Black",
      productQty: 1,
      productPrice: 3999000
    },
    { productName: "Samsung Galaxy Note 3, Black",
      productQty: 1,
      productPrice: 8499000
    }
  ];



  $scope.paymentType = 'credit_card';
  $scope.bankType = '';

  $scope.totalPrice = function() {
    var total = 0;
    for(var i = 0; i < $scope.purchasedProducts.length; i++){
      total += $scope.purchasedProducts[i].productQty * $scope.purchasedProducts[i].productPrice;
    }
    return total;
  }

  $scope.config = {
    callback: 'JSON_CALLBACK',
    ip_address: '192.168.1.1',
    client_key: 'VT-client-SimkwEjR3_fKj73D',
    vtkey: 'v3r1tr4n5-15-n0-1',
    secure: 'false',
    gross_amount: $scope.totalPrice()
  };

  $scope.$watch('creditCard.card_number', function(val){
    var cardType = CreditCardService.numberValidation(val).cardType;
    var valid = CreditCardService.numberValidation(val).valid;
    console.log(cardType, valid, $scope.creditCard.card_number);
    if (val.length == 16) {
      if (valid === 'valid'){
        if (cardType === 'Visa'){
          $scope.status = 'visa';
        } else if (cardType === 'MasterCard'){
          $scope.status = 'mastercard';
        }
      } else if (valid === 'not valid'){
        $scope.status = 'invalid';
      }      
    } else {
      $scope.status = 'default';
    }


  });

  $scope.submit = function() {
    // console.log(angular.extend({},$scope.creditCard,$scope.config));
    $http.jsonp("https://api.sandbox.veritrans.co.id/v2/token", {
      params: angular.extend({},$scope.creditCard,$scope.config)
    }).
    success(function(response) {
      $token_id = response.token_id;
      console.log(response);
    }).
    error(function() {
      console.log('error');
    });

    // $http.post("http://10.255.255.25:8080/v1/charge", {
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Accept': 'application/json',
    //     'Authorization': 'Basic Og=='
    //   },
    //   data: {
    //     client_key: 'VT-client-SimkwEjR3_fKj73D',
    //     email: 'danny@pranoto.com',
    //     payment_type : "credit_card",
    //     item_details : $scope.purchasedProducts,
    //     credit_card : {
    //       "token_id" : $token_id
    //     }
    //   }
    // }).
    // success(function(response) {
    //   console.log(response)
    // }).
    // error(function(response) {
    //   console.log(error)
    // })

  }

});

// paymentApp.directive('paymentsValidate', function(CreditCardService){
//   return{
//     restrict: 'A',
//     require: 'ngModel',
//     link: function (scope, element, attrs) {
//       console.log(scope.creditCard.card_exp_year);
//       scope.$watch('creditCard.card_number', function(newValue, oldValue) {
//           var arr = String(newValue).split("");
//           if (arr.length === 0) return;
//           if (arr.length === 1 && (arr[0] == '-' || arr[0] === '.' )) return;
//           if (arr.length === 2 && newValue === '-.') return;
//           if (isNaN(newValue)) {
//               scope.creditCard.card_number = oldValue;    
//           }
//           // scope.creditCard.card_number = CreditCardService.autoSpace(scope.creditCard.card_number);
//           // console.log(scope.creditCard.card_number);
//       });
//       // console.log($scope.creditCard.card_number);
//       // $scope.$watch($scope.creditCard.card_number, function (val){
//       //     // $scope.$apply(function() {
//       //     //   $scope.creditCard.card_number = CreditCardService.autoSpace(val);
//       //     //   console.log($scope.creditCard.card_number);
//       //     // });
            
//       //       var validation = CreditCardService.autoSpace(val);
//       //       console.log(validation);

//       // });
//     }
//   }  
// });

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
  $scope.colours = [{
    name: "Red",
    hex: "#F21B1B"
  }, {
    name: "Blue",
    hex: "#1B66F2"
  }, {
    name: "Green",
    hex: "#07BA16"
  }];
  $scope.colour = "";
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
      };

      scope.isSelected = function(item) {
        return item[scope.property] === scope.selected[scope.property];
      };

      scope.show = function() {
        scope.listVisible = true;
      };

      $rootScope.$on("documentClicked", function(inner, target) {
        console.log($(target[0]).is(".dropdown-display.clicked") || $(target[0]).parents(".dropdown-display.clicked").length > 0);
        if (!$(target[0]).is(".dropdown-display.clicked") && !$(target[0]).parents(".dropdown-display.clicked").length > 0)
          scope.$apply(function() {
            scope.listVisible = false;
          });
      });

      scope.$watch("selected", function(value) {
        scope.isPlaceholder = scope.selected[scope.property] === undefined;
        scope.display = scope.selected[scope.property];
      });
    }
  }
});