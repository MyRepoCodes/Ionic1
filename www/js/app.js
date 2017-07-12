// Ionic deals App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'deals' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'deals.services' is found in services.js
// 'deals.controllers' is found in controllers.js
angular.module('deals', ['ionic', 'deals.services', 'deals.controllers', 'ionic.rating', 'xeditable'])

.run(function($ionicPlatform, $cordovaPush, $rootScope, $window, editableOptions, $state, $ionicLoading, $cordovaGeolocation, $ionicPopup, $ionicViewService) {
  
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);

    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }


    // GETTING SIM DETAILS
       
    window.plugins.sim.getSimInfo(successCallback, errorCallback);    
     
    function successCallback(result) {
      window.localStorage['phoneNumber'] = result.phoneNumber;
    }
    function errorCallback(error) {
      window.localStorage['phoneNumber'] = '';
    }

 
    // DEVICE TYPE SETTING

    window.localStorage['deviceType'] = ionic.Platform.platform();
    

    // PUSH NOTIFICATIONS CONFIGURATION

    var push = PushNotification.init({ 
        "android": {"senderID": SENDER_ID},
        "ios": {"alert": "true", "badge": "true", "sound": "true"}, 
        "windows": {} 
    });

    push.on('registration', function(data) {        
        // alert('data.registrationId: '+data.registrationId);
        window.localStorage['deviceId'] = JSON.stringify(data);
        $rootScope.deviceId = JSON.stringify(data);
    });

    push.on('notification', function(data) {
        // data.message,
        // data.title,
        // data.count,
        // data.sound,
        // data.image,
        // data.additionalData
    });

    push.on('error', function(e) {
        // e.message
    });

    editableOptions.theme = 'bs3';



    // HANDLING LOCATION

    $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {     
        
        window.localStorage['userlatitude']  = position.coords.latitude;
        window.localStorage['userlongitude'] = position.coords.longitude;
        // alert(position.coords.latitude +''+position.coords.longitude)
      
    }, function(err) {
        $ionicPopup.show({
          template: '',
          title: 'Need Your Location',
          subTitle: 'Please turn on your location to get more precise deals nearby you.',
          buttons: [
            { 
              text: 'Turn On',
              type: 'pink-white-theme-color',
              onTap: function(e) {                  
                cordova.plugins.diagnostic.switchToLocationSettings();
              }
            }
          ]
        });
    });



    // HANDLING LOGIN ROUTING

    // if (localStorage.getItem("userData") === null) {
    //   $state.go('landing');
    // }else{
    //   $ionicViewService.nextViewOptions({disableBack: true});
    //   $ionicLoading.show({
    //     content: 'Loading',
    //     animation: 'fade-in',
    //     showBackdrop: true,
    //     maxWidth: 200,
    //     showDelay: 0,
    //     template: 'Loading Deals...'
    //   });
    //   $state.go('app.deals');
    // }



  });

})

.config(function($stateProvider, $urlRouterProvider, $httpProvider) {
var checkRememberMe = function($q, $state, $ionicViewService, $ionicLoading, $timeout, $location){

var deferred = $q.defer();

    if (localStorage.getItem("userData") === null) {
    // $state.go('home');
      $timeout(deferred.resolve, 0);
    }else{
      $timeout(deferred.resolve, 0);
      $ionicViewService.nextViewOptions({disableBack: true});
      $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0,
      template: 'Fetching Deals around you...'
      });
      $location.path('/app/deals');
      // $state.go('sidemenu.myoffer');
    }
   return deferred.promise;
 }

  $stateProvider



    .state('landing', {
      url: '/landing-home',
      templateUrl: 'templates/landing-home.html',
      controller: 'SignInCtrl',
      resolve:{checked:checkRememberMe}
    })
    .state('signin', {
      url: '/sign-in',
      templateUrl: 'templates/users/sign-in.html',
      controller: 'SignInCtrl'
    })
    .state('forgot', {
      url: '/forgot-password',
      templateUrl: 'templates/users/forgot.html',
      controller: 'ForgotCtrl'
    })
    .state('register', {
      url: '/register',
      templateUrl: 'templates/users/register.html',
      controller: 'RegisterCtrl'
    })
    .state('contactAdmin', {
      url: '/contact-admin',
      templateUrl: 'templates/pages/contact-admin.html',
      controller: 'SignInCtrl'
    })
    .state('app', {
      url: '/app',
      abstract: true,
      templateUrl: 'templates/global/menu.html',
      controller: 'AppCtrl'
    })
    .state('app.deals', {
      url: '/deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/deals.html',
          controller: 'DealsCtrl'
        }
      }
    })
    .state('app.dealsFiltered', {
      url: '/deals/:sortType',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/deals.html',
          controller: 'DealsCtrl'
        }
      }
    })
    .state('app.dealsFilterBySearch', {
      url: '/deals/:sortType/:searchKeyword',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/deals.html',
          controller: 'DealsCtrl'
        }
      }
    })
    .state('app.dealsToBeNotify', {
      url: '/deals-to-be-notify',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/deals-to-be-notify.html',
          controller: 'DealsToBeNotifyCtrl'
        }
      }
    })
    .state('app.myUnPublishedDeals', {
      url: '/my-unpublished-deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/my-unpublished-deals.html',
          controller: 'MyDeals'
        }
      }
    })
    .state('app.myPublishedDeals', {
      url: '/my-published-deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/future-deals.html',
          controller: 'MyFutureDeals'
        }
      }
    })
    .state('app.pastDeals', {
      url: '/past-deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/past-deals.html',
          controller: 'PastDeals'
        }
      }
    })
    .state('app.activeDeals', {
      url: '/active-deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/active-deals.html',
          controller: 'ActiveDeals'
        }
      }
    })
    .state('app.favoritedByBizuser', {
      url: '/deals-favorited-by-bizuser',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/deals-favorited-by-bizuser.html',
          controller: 'FavotriteAndReviewedDeals'
        }
      }
    })
    .state('app.reviewedByBizuser', {
      url: '/deals-reviewed-by-bizuser',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/deals-reviewed-by-bizuser.html',
          controller: 'FavotriteAndReviewedDeals'
        }
      }
    })
    .state('app.nationaldeals', {
      url: '/national-deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/national-deals.html',
          controller: 'NationalDealsCtrl'
        }
      }
    })
    .state('app.localdeals', {
      url: '/local-deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/local-deals.html',
          controller: 'LocalDealsCtrl'
        }
      }
    })
    .state('app.createDeal', {
      url: '/create-deal',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/create-deal.html',
          controller: 'CreateDealCtrl'
        }
      },
      // To check if user created a business address or not
      // resolve:{
      //     "check":function(CheckService){
      //       CheckService.checkPermission();
      //     }
      // }
    })
    .state('app.createDealByClone', {
      url: '/create-deal-by-clone',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/create-deal-by-clone.html',
          controller: 'CreateDealByCloneCtrl'
        }
      }
    })
    .state('app.cloneDeal', {
      url: '/clone-deal/:dealId',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/clone-deal.html',
          controller: 'CreateDealCtrl'
        }
      },
      resolve:{
          "check":function(CheckService){
            CheckService.checkPermission();
          }
      }
    })
    .state('app.editDeal', {
      url: '/edit-deal/:dealId',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/edit-deal.html',
          controller: 'EditDealCtrl'
        }
      },
      resolve:{
          "check":function(CheckService){
            CheckService.checkPermission();
          }
      }
    })
    .state('app.favourites', {
      url: '/favourites',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/favourites.html',
          controller: 'DealsCtrl'
        }
      }
    })
    .state('app.deal', {
      url: '/single-deal/:dealId',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/deal.html',
          controller: 'DealDetailCtrl'
        }
      }
    })
    .state('app.catDeal', {
      url: '/cat-deals/:catId/:catName',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/cat-deals.html',
          controller: 'CatDealsCtrl'
        }
      }
    })

    .state('app.settings', {
      url: '/settings',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/settings.html',
          controller: 'SettingsCtrl'
        }
      }
    })
    .state('app.profile', {
      url: '/profile',
      views: {
        'menuContent': {
          templateUrl: 'templates/users/profile.html',
          controller: 'ProfileCtrl'
        }
      }
    })
    .state('app.credits', {
      url: '/credits',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/credits.html',
          controller: 'CreditsCtrl'
        }
      }
    })
    .state('app.purchaseHistory', {
      url: '/purchase-history',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/purchase-history.html',
          controller: 'CreditsCtrl'
        }
      }
    })
    .state('app.creditsHistory', {
      url: '/credits-history',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/credits-history.html',
          controller: 'CreditHistoryCtrl'
        }
      }
    })
    .state('app.creditsUsedHistory', {
      url: '/credits-used-history',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/credits-used-history.html',
          controller: 'CreditUsedHistoryCtrl'
        }
      }
    })
    .state('app.buyCreditCardCredits', {
      url: '/buy-creditcard-credits/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/buy-creditcard-credits.html',
          controller: 'BuyCreditsCtrl'
        }
      }
    })
    .state('app.bizAddress', {
      url: '/biz-address',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/biz-address.html',
          controller: 'BizCtrl'
        }
      }
    })
    .state('app.bizAddressSingle', {
      url: '/biz-address/:id',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/single-biz-address.html',
          controller: 'SingleBizCtrl'
        }
      }
    })
    .state('app.myReviews', {
      url: '/my-reviews',
      views: {
        'menuContent': {
          templateUrl: 'templates/users/my-reviews.html',
          controller: 'ReviewsCtrl'
        }
      }
    })
    .state('app.about', {
      url: '/about',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/about.html',
          controller: 'AboutCtrl'
        }
      }
    })
    .state('app.notifications', {
      url: '/notifications',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/notifications.html',
          controller: 'NotificationCtrl'
        }
      }
    })
    .state('app.myFavorites', {
      url: '/my-favorites',
      views: {
        'menuContent': {
          templateUrl: 'templates/deals/my-favorites.html',
          controller: 'MyFavoritesCtrl'
        }
      }
    })
    .state('app.faq', {
      url: '/faq',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/faq.html',
          controller: 'FaqCtrl'
        }
      }
    })
    .state('app.national-deals', {
      url: '/national-deals',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/faq.html',
          controller: 'FaqCtrl'
        }
      }
    })
    .state('app.contactAdminInner', {
      url: '/contact-admin-inner',
      views: {
        'menuContent': {
          templateUrl: 'templates/pages/contact-admin-inner.html',
          controller: 'ContactCtrl'
        }
      }
    });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/landing-home');
});