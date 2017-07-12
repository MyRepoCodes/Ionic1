angular.module("google.places",[]);
angular.module('deals.controllers', ['ngCordova', 'xeditable', 'ngSanitize', 'google.places', 'angucomplete'])

.controller('AppCtrl', function($scope, $ionicModal, $timeout, $state, DealService, $cordovaContacts, $cordovaSocialSharing, $ionicPopup, $cordovaGeolocation, $rootScope, LocationService, DealService) {

  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  // $scope.$on('$ionicView.enter', function(e) {
  // });

  // Form data for the login modal
  $scope.loginData = {};

  // Create the login modal that we will use later
  $ionicModal.fromTemplateUrl('templates/users/login.html', {
    scope: $scope
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the login modal to close it
  $scope.closeLogin = function() {
    $scope.modal.hide();
  };

  // Open the login modal
  $scope.login = function() {
    $scope.modal.show();
  };
  
  // LOGOUT USER FROM APP
  $scope.logout = function() {
    localStorage.clear();
    $state.go('landing');
  };
  
  // REFRESH APPLICATION
  $scope.refreshApp = function() {
    $scope.getTotalCount();
    $state.go($state.current, {}, {reload: true});
  };

  // Perform the login action when the user submits the login form
  $scope.doLogin = function() {
    console.log('Doing login', $scope.loginData);

    // Simulate a login delay. Remove this and replace with your login
    // code if using a login system
    $timeout(function() {
      $scope.closeLogin();
    }, 1000);
  };


  if (localStorage.getItem("userData") === null) {
    console.log('Its NULL') ;
    $state.go('landing');
  }else{
    $scope.userData = JSON.parse(window.localStorage['userData']);
    // console.log($scope.userData);
  }


  /*
   * Toggling Group in deal center
   * 
   */

  $scope.toggleGroupCenter = function(group) {
    if ($scope.isGroupShownCenter(group)) {
      $scope.shownGroupCenter = null;
    } else {
      $scope.shownGroupCenter = group;
    }
  };
  $scope.isGroupShownCenter = function(group) {
    return $scope.shownGroupCenter === group;
  };

  $scope.groupCenter = 'deals';


  /*
   * Toggling Group in deal Categories
   * 
   */

  $scope.toggleGroup = function(group) {
    if ($scope.isGroupShown(group)) {
      $scope.shownGroup = null;
    } else {
      $scope.shownGroup = group;
    }
  };
  $scope.isGroupShown = function(group) {
    return $scope.shownGroup === group;
  };

  $scope.group = 'deals';


  /*
   * Toggling Group in My Deals
   * 
   */

  $scope.toggleMyDealGroup = function(group) {
    if ($scope.isMyDealGroupShown(group)) {
      $scope.shownMyDealGroup = null;
    } else {
      $scope.shownMyDealGroup = group;
    }
  };
  $scope.isMyDealGroupShown = function(group) {
    return $scope.shownMyDealGroup === group;
  };

  $scope.groupMyDeal = 'deals';


  /*
   * Toggling Group in Credits
   * 
   */

  $scope.toggleCreditsGroup = function(group) {
    if ($scope.isCreditsGroupShown(group)) {
      $scope.shownCreditsGroup = null;
    } else {
      $scope.shownCreditsGroup = group;
    }
  };
  $scope.isCreditsGroupShown = function(group) {
    return $scope.shownCreditsGroup === group;
  };

  $scope.groupCredits = 'deals';


  /*
   * Toggling Group in Create Deal
   * 
   */

  $scope.toggleCreateDealGroup = function(group) {
    if ($scope.isCreateDealGroupShown(group)) {
      $scope.shownCreateDealGroup = null;
    } else {
      $scope.shownCreateDealGroup = group;
    }
  };
  $scope.isCreateDealGroupShown = function(group) {
    return $scope.shownCreateDealGroup === group;
  };

  $scope.groupCreateDeal = 'deals';




  /*
   * SETTING DEALS CENTER MENU
   * 
   */

  DealService.findAllDealCategories().then(function (categories) {
    $scope.dealCategories = categories.data.data;
  });



  /*
   * GETTING DEALS COUNTS
   * 
  */
  $scope.getTotalCount = function(){
    var date = new Date();
    $cordovaGeolocation
      .getCurrentPosition(POS_OPTIONS)
      .then(function (position) {

          LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
              
              $scope.timezone = data.data.timeZoneId;

              window.localStorage['timezone']  = $scope.timezone;
              $scope.user_range = window.localStorage['user_range'];

              if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
                $scope.timezone = "America/Los_Angeles"
              };

              DealService.findDealsCount($scope.userData.session_id, $scope.timezone).then(function (deals) {
                $scope.dealsCounts = deals.data;
                $rootScope.dealsCountsData = $scope.dealsCounts;
                //console.log("1")
               // console.log($scope.dealsCounts);
              });

          })

        }, function(err) {

        });
  }

  $scope.getTotalCount();
  // DealService.findAllDealCategories().then(function (categories) {
    // $scope.dealCategories = categories.data.data;
  // });


  /*
   * LOADING EXTERNAL SCRIPTS DYNAMICALLY
   * 
   */

  // var imported = document.createElement('script');
  // imported.src = 'https://maps.googleapis.com/maps/api/js?v=3.exp';
  // document.head.appendChild(imported);

  var imported = document.createElement('script');
  imported.src = 'http://maps.googleapis.com/maps/api/js?libraries=places';
  document.head.appendChild(imported);



  /*
   * INVITING FRIENDS FROM THE CONTACT LIST
   * 
   */

  $scope.pickContactUsingNativeUI = function () {
    $cordovaContacts.pickContact().then(function (contactPicked) {
      $scope.contact = contactPicked;
      INVITE_MESSAGE = ($scope.userData.profiledata.enable_invite_message==true)?$scope.userData.profiledata.invite_message:INVITE_MESSAGE;
      // alert(JSON.stringify($scope.contact))
      // alert($scope.contact.phoneNumbers[0].value)
      if ($scope.contact.phoneNumbers != null){
        $cordovaSocialSharing
        .shareViaSMS(INVITE_MESSAGE, $scope.contact.phoneNumbers[0].value)
        .then(function(result) {
          // Success!
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
            title:    'Error!',
            template: 'Sorry for the inconvenience. Please try again later.',
            buttons:[
              {
                text: '<b>Ok</b>',
                type: 'pink-white-theme-color'
              }
            ]
          });
        });
      }else{
        var alertPopup = $ionicPopup.alert({
            title:    'Phone Number Error!',
            template: 'No valid number found associated with this contact.',
            buttons:[
              {
                text: '<b>Ok</b>',
                type: 'pink-white-theme-color'
              }
            ]
          });
      }
      
    });
  }

  $scope.updateMenuContent = function(){
   //console.log('updateMenuContent') 
   $rootScope.$broadcast('getTotalCount', true);
  }

  $scope.$on('getTotalCount', function(event, mass) { $scope.getTotalCount(); });

 })
.controller('LandingInCtrl', function($scope, $state) {
  
  $scope.gotoRegister = function() {
    console.log('register');
    $state.go('register');
  };

  $scope.gotoLogin = function() {
    console.log('Sign-In');
    $state.go('signin');
  };

})
.controller('SettingsCtrl', function($scope, $state, $cordovaSocialSharing, $ionicPopup, NotificationService, $ionicLoading, ProfileService ) {
  
  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  $scope.userData = JSON.parse(window.localStorage['userData']);
  NotificationService.getNotifications($scope.userData.session_id).then(function (data) {
    $scope.notificationsCount = data.data.data.length;
    $ionicLoading.hide();
  });

  $scope.shareApp = function(){

    var message = 'Hello, \n Download this awesom app for catching hot deals around you. \n Download Link: '+DOWNLOAD_LINK;
    var subject = 'App Sharing';
    var file = '';
    var link = '';

      $cordovaSocialSharing
      .share(message, subject, file, link) // Share via native share sheet
      .then(function(result) {
        /*var alertPopup = $ionicPopup.alert({
                title:    'App Shared Successfully!',
                template: 'This App has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/

      }, function(err) {
        var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'Sorry for the interuption but their is no sharable app in your device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
      });
  };

  $scope.changeSharingText = function(){

    $scope.userProfileData = {}

    var changeSharingMsgPopup = $ionicPopup.show({
      template: '<div class="list"><ion-checkbox ng-model="userProfileData.enable_share_message">Use custom text</ion-checkbox></div>'+
                '<div class="list" ng-if="userProfileData.enable_share_message"><label class="item item-input"><textarea rows="4" placeholder="Your custom sharing text" ng-model="userProfileData.share_message"></textarea></label></div>',
      title: 'Change Social Sharing Text',
      subTitle: 'Enter Your Custom Text',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'pink-white-theme-color',
          onTap: function(e) {

            $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });

            // Hello this is custom text...
            $scope.userProfileData.user_id = $scope.userData.session_id
            // $scope.userProfileData.enable_share_message = ($scope.userProfileData.enable_share_message=='true'||$scope.userProfileData.enable_share_message==true)?1:0;
            // console.log($scope.userProfileData)
            ProfileService.changeSharingText($scope.userProfileData).success(function(data){
        
                // console.log(data);

                $ionicLoading.hide();
                
                if (data.code == 200) {

                  var alertPopup = $ionicPopup.alert({
                      title:    'Profile Details Updated!',
                      template: 'Your profile details has been updated successfully.',
                      buttons:[
                        {
                          text: '<b>Ok</b>',
                          type: 'pink-white-theme-color'
                        }
                      ]
                  });

                  // $state.go($state.current, {}, {reload: true});

                }else {

                  var alertPopup = $ionicPopup.alert({
                    title:    'Anonymously failed!',
                    template: 'Oop\'s! it seems like something went wrong.',
                    buttons:[
                      {
                        text: '<b>Ok</b>',
                        type: 'pink-white-theme-color'
                      }
                    ]
                  });
                  
                }

            });

          }
        }
      ]
    });
  };

  $scope.changeInviteText = function(){

    $scope.userProfileData = {}

    var changeSharingMsgPopup = $ionicPopup.show({
      template: '<div class="list"><ion-checkbox ng-model="userProfileData.enable_invite_message">Use custom text</ion-checkbox></div>'+
                '<div class="list" ng-if="userProfileData.enable_invite_message"><label class="item item-input"><textarea rows="4" placeholder="Custom App Invite text" ng-model="userProfileData.invite_message"></textarea></label></div>',
      title: 'Change App Invite Text',
      subTitle: 'Enter Your Custom Text',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'pink-white-theme-color',
          onTap: function(e) {

            $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });

            // Hello this is custom text...
            $scope.userProfileData.user_id = $scope.userData.session_id
            // $scope.userProfileData.enable_invite_message = ($scope.userProfileData.enable_invite_message=='true'||$scope.userProfileData.enable_invite_message==true)?1:0;
            
            ProfileService.changeAppInviteText($scope.userProfileData).success(function(data){
        
                // console.log(data);

                $ionicLoading.hide();
                
                if (data.code == 200) {

                  var alertPopup = $ionicPopup.alert({
                      title:    'Profile Details Updated!',
                      template: 'Your profile details has been updated successfully.',
                      buttons:[
                        {
                          text: '<b>Ok</b>',
                          type: 'pink-white-theme-color'
                        }
                      ]
                  });

                  // $state.go($state.current, {}, {reload: true});

                }else {

                  var alertPopup = $ionicPopup.alert({
                    title:    'Anonymously failed!',
                    template: 'Oop\'s! it seems like something went wrong.',
                    buttons:[
                      {
                        text: '<b>Ok</b>',
                        type: 'pink-white-theme-color'
                      }
                    ]
                  });
                  
                }

            });

          }
        }
      ]
    });
  };

})
.controller('ProfileCtrl', function($scope, $state, ProfileService, $ionicLoading, $ionicPopup, $cordovaSocialSharing, DealService) {
  
  $scope.profilePicPath = PROFILE_PIC;
  
  if (localStorage.getItem("userData") === null) {
    $state.go('landing');
  }else{
    $scope.userData = JSON.parse(window.localStorage['userData']);
    ProfileService.findProfileDetailsById($scope.userData.session_id).then(function(data) { 
      $scope.userProfileData = data.data.data;
      // console.log($scope.userProfileData);
    });
    DealService.findUserFavoriteDeals($scope.userData.session_id).then(function (deals) {
      $scope.favdeals = deals.data;
      $scope.favdealsmerged = $scope.favdeals.ratedata.concat( $scope.favdeals.reviewdata, $scope.favdeals.sharedata);
      $scope.dealsFavorited = $scope.favdealsmerged.length;
    });      
  }

  $scope.saveUser = function(userProfileData) {

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    ProfileService.editProfile(userProfileData).success(function(data){
        
        console.log(data);

        $ionicLoading.hide();
        
        if (data.code == 200) {

          var alertPopup = $ionicPopup.alert({
              title:    'Profile Details Updated!',
              template: 'Your profile details has been updated successfully.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });

          $state.go($state.current, {}, {reload: true});

        }else {

          var alertPopup = $ionicPopup.alert({
            title:    'Anonymously failed!',
            template: 'Oop\'s! it seems like something went wrong.',
            buttons:[
              {
                text: '<b>Ok</b>',
                type: 'pink-white-theme-color'
              }
            ]
          });
          
        }       

    });
  };
  
  $scope.shareApp = function(){

    var message = ($scope.userData.profiledata.enable_invite_message==true)?$scope.userData.profiledata.invite_message:INVITE_MESSAGE;
    var subject = 'App Sharing';
    var file = '';
    var link = '';

      $cordovaSocialSharing
      .share(message, subject, file, link) // Share via native share sheet
      .then(function(result) {        
       /* var alertPopup = $ionicPopup.alert({
                title:    'App Shared Successfully!',
                template: 'This App has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/

      }, function(err) {
        var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'Sorry for the interuption but their is no sharable app in your device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
      });
  };

  $scope.changePasssword = function() {
    
    $scope.password = {}

    var changePasswordPopup = $ionicPopup.show({
      template: '<div class="list"><label class="item item-input"><i class="icon ion-locked placeholder-icon"></i><input type="password" placeholder="Current Password" ng-model="password.oldpass">  </label></div>'+
                '<div class="list"><label class="item item-input"><i class="icon ion-locked placeholder-icon"></i><input type="password" placeholder="New Password" ng-model="password.newpass">  </label></div>',
      title: 'Change Your Password',
      subTitle: 'Enter Your Current Password',
      scope: $scope,
      buttons: [
        { text: 'Cancel' },
        {
          text: '<b>Save</b>',
          type: 'pink-white-theme-color',
          onTap: function(e) {

            $ionicLoading.show({
              content: 'Loading',
              animation: 'fade-in',
              showBackdrop: true,
              maxWidth: 200,
              showDelay: 0
            });

            // if($scope)
            ProfileService.changePassword($scope.userData.session_id, $scope.password).success(function(data){
        
                console.log(data);

                $ionicLoading.hide();
                
                if (data.code == 200) {

                  var alertPopup = $ionicPopup.alert({
                      title:    'Password Changed',
                      template: 'Your password has been updated successfully.',
                      buttons:[
                        {
                          text: '<b>Ok</b>',
                          type: 'pink-white-theme-color'
                        }
                      ]
                  });

                  $state.go($state.current, {}, {reload: true});

                }else if (data.code == 102) {

                  var alertPopup = $ionicPopup.alert({
                      title:    'Password Error!',
                      template: 'Your current password is incorrect!',
                      buttons:[
                        {
                          text: '<b>Ok</b>',
                          type: 'pink-white-theme-color'
                        }
                      ]
                  });

                }else {

                  var alertPopup = $ionicPopup.alert({
                    title:    'Anonymously failed!',
                    template: 'Oop\'s! it seems like something went wrong.',
                    buttons:[
                      {
                        text: '<b>Ok</b>',
                        type: 'pink-white-theme-color'
                      }
                    ]
                  });
                }       

            });

          }
        }
      ]
    });
  };

})
.controller('SignInCtrl', function($scope, $timeout, $ionicLoading, $ionicPopup, $state, $http, LoginService, $ionicHistory, $cordovaGeolocation, $window, ContactService, LocationService, $rootScope, $ionicViewService, $ionicViewService) {

  $scope.signIn = function(user) {

      // SETUP THE LOADER

      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });

      user.device_type       = ionic.Platform.platform();
      user.deviceInformation = ionic.Platform.device();
      
      if (typeof $rootScope.deviceId != 'undefined') {

        $scope.deviceId = JSON.parse($rootScope.deviceId);
        user.deviceId   = $scope.deviceId.registrationId;
        
      }else{
        user.deviceId   = '';
        // var deviceId = { "registrationId": "fkrNU4iCah8:APA91bGMPeXSjYK8Gr-w5ETRtjDGqZmUAQEiLafCFuVaL1-lMitmjkr2cQw_yMyn-UUjxxQFfgLhYjbOUeVmDFFqXlQoeHewACo8JqQsCnIrodQVt_34HqADksrQSxcuF7ou2MrC_pkz" }
        // user.deviceId = deviceId.registrationId;
      }


      
      $cordovaGeolocation
      .getCurrentPosition(POS_OPTIONS)
      .then(function (position) {      
        user.latitude  = position.coords.latitude;
        user.longitude = position.coords.longitude;

        // Getting location from lat long
        var promise = LocationService.getLocationByLatLong(user.latitude, user.longitude);
        promise.then(function(payload) {

            var userLocationData = payload.data;
           // console.log(userLocationData);

            $scope.userLocation = userLocationData.results[1].formatted_address;
            user.user_location  = $scope.userLocation;
            var addressArray    = user.user_location.split(",");
            user.country        = addressArray[addressArray.length-1].trim();
            address_components  = userLocationData.results[2].address_components;          
            user.continent      = CONTINENTS[address_components[address_components.length-1].short_name];

            $scope.signinLastStep(user);
            // console.log($scope.userLocation)
        });
        
      }, function(err) {        
        $scope.signinLastStep(user);
      });


      // HITTING LOGIN SERVICE
      $scope.signinLastStep = function(user) {

        LoginService.loginUser(user).success(

          function(data) {            
            
           // console.log(data);

            $ionicLoading.hide();
            console.log(data.code )
              
            if (data.code == 200) {
              
              window.localStorage['userData'] = JSON.stringify(data);
              var userData = JSON.parse(window.localStorage['userData'] || '{}');
            
              console.log('userData.username: ' + userData.username);
              console.log('userData.usertype:' + userData.usertype);

              // $state.go('app.deals');
              $ionicViewService.nextViewOptions({disableBack: true});
              $ionicHistory.clearCache().then(function(){ $state.go('app.deals') });
              $ionicViewService.nextViewOptions({disableBack: true});

            } else if(data.code == 102){  

                var confirmPopup = $ionicPopup.alert({
                  title: 'Login failed!',
                  template: 'Your account is inactive. Kindly contact the admin for account renewal.',
                  buttons:[
                    { text: 'Cancel' },
                    {
                      text: '<b>Ok</b>',
                      type: 'pink-white-theme-color',
                      onTap: function(e) {
                        // console.log('You are sure');
                        $state.go('contactAdmin');
                      }
                    }
                  ]
                });
                
                // krishanp@smartdatainc.net

            }else {
                var alertPopup = $ionicPopup.alert({
                    title:    'Login failed!',
                    template: 'Please check your credentials!',
                    buttons:[
                      {
                        text: '<b>Ok</b>',
                        type: 'pink-white-theme-color'
                      }
                    ]
                });
            }

        });
      }
  }

  $scope.contact = function(user) {
    ContactService.contactAdmin(user).success(function(data){
      if (data.code == 200) {
        var alertPopup = $ionicPopup.alert({
          title:    'Message Sent Successfully',
          template: 'Your message has been sent successfully. Our team will revert back you soon.',
          buttons:[
            {
              text: '<b>Ok</b>',
              type: 'pink-white-theme-color'
            }
          ]
        });
        $state.go('landing');

      } else {
        var alertPopup = $ionicPopup.alert({
          title:    'Error!',
          template: 'Sorry for the inconvenience. Please try again later.',
          buttons:[
            {
              text: '<b>Ok</b>',
              type: 'pink-white-theme-color'
            }
          ]
        });
      }
    });
  };
  
  $scope.gotoLogin = function() {
    console.log('Sign-In');
    $state.go('landing');
  };

})
.controller('RegisterCtrl', function($scope, $state, $ionicLoading, RegisterService, $ionicPopup, $cordovaGeolocation, LocationService, $rootScope) {

  $scope.gotoLogin = function() {
    $state.go('landing');
  };
  
  $scope.user = {};

  if (typeof window.localStorage['phoneNumber'] != 'undefined') {
    $scope.phone = Number(window.localStorage['phoneNumber']);
  }else{
    $scope.user.phone = '';
  }

  $scope.signup = function(user) {
    
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    
    
    // user.profilePic = BASE64IMAGE;
    user.profilePic = $scope.picData;    
    if (typeof user.profilePic == 'undefined') {
      user.profilePic = '';
    }

    if (typeof $rootScope.deviceId != 'undefined') {
      $scope.deviceId = JSON.parse($rootScope.deviceId);
      user.deviceId   = $scope.deviceId.registrationId;      
    }else{
      user.deviceId   = '';
      // var deviceId = { "registrationId": "fkrNU4iCah8:APA91bGMPeXSjYK8Gr-w5ETRtjDGqZmUAQEiLafCFuVaL1-lMitmjkr2cQw_yMyn-UUjxxQFfgLhYjbOUeVmDFFqXlQoeHewACo8JqQsCnIrodQVt_34HqADksrQSxcuF7ou2MrC_pkz" }
      // user.deviceId = deviceId.registrationId;
    }


    $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {      
        user.latitude  = position.coords.latitude;
        user.longitude = position.coords.longitude;

        var promise = LocationService.getLocationByLatLong(user.latitude, user.longitude);
        promise.then(function(payload) {

            var userLocationData = payload.data;

            $scope.userLocation = userLocationData.results[1].formatted_address;
            user.user_location  = $scope.userLocation;
            var addressArray    = user.user_location.split(",");
            user.country        = addressArray[addressArray.length-1].trim();
            address_components  = userLocationData.results[2].address_components;          
            user.continent      = CONTINENTS[address_components[address_components.length-1].short_name];

            $scope.signupLastStep(user);
        });
        
      }, function(err) {
        user.latitude  = '';
        user.longitude = '';
        user.user_location = '';
        user.country = '';
        user.continent = '';
        $scope.signupLastStep(user);
      });
  }


  // HITTING SIGNUP SERVICE

  $scope.signupLastStep = function(user) {

    RegisterService.registerUser(user).success(function(data){
        
        console.log(data);

        $ionicLoading.hide();
        
        if (data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    'Registered Successfully!',
                template: 'Your credentials has been mailed. You may log in now.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

            $state.go('landing');

        } else if(data.error.code == 11000){                
            var alertPopup = $ionicPopup.alert({
                title:    'Registeration failed!',
                template: 'Email already exists. Please try with different one.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        } else {                
            var alertPopup = $ionicPopup.alert({
                title:    'Registeration failed!',
                template: 'Oop\'s! something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        }       

    });
  }


  // UPLOAD USER's PROFILE PIC

  $scope.takePic = function() {
    var options =   {
        quality: 50,
        destinationType: Camera.DestinationType.DATA_URL, // FILE_URI, DATA_URL
        sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
        encodingType: 0     // 0=JPG 1=PNG
    }
    navigator.camera.getPicture($scope.onSuccess,$scope.onFail,options);
  }

  $scope.onSuccess = function(DATA_URL) {
    $scope.picData = "data:image/jpeg;base64," + DATA_URL;
    var image = document.getElementById('myImage2');
    image.src = "data:image/jpeg;base64," + DATA_URL;
    image.style.display = "block";
    // document.getElementById('uploadProfilePicButton').style.display = "none";
  };

  $scope.onFail = function(e) {
    console.log("On fail " + e);
  }

})
.controller('ForgotCtrl', function($scope, $state, $ionicLoading, $ionicPopup, ForgotService) {

  $scope.gotoLogin = function() {
    console.log('Sign-In');
    $state.go('landing');
  };

  $scope.forgotPassword = function(user) {

        // Setup the loader
      
        $ionicLoading.show({
          content: 'Loading',
          animation: 'fade-in',
          showBackdrop: true,
          maxWidth: 200,
          showDelay: 0
        });

        console.log('Sign-In', user);

        // Hitting Forgot password Service

        ForgotService.forgotUser(user.email).success(

          function(data) {            
            
            //console.log(data);

            $ionicLoading.hide();
              
            if (data.code == 200) {

                var alertPopup = $ionicPopup.alert({
                    title:    'Password Recovered Successfully',
                    template: 'Please check your Email for new password.',
                    buttons:[
                      {
                        text: '<b>Ok</b>',
                        type: 'pink-white-theme-color'
                      }
                    ]
                });

                $state.go('landing');

            } else {                
                var alertPopup = $ionicPopup.alert({
                    title:    'Invalid Email!',
                    template: 'Please check your Email you might have mistyped!',
                    buttons:[
                      {
                        text: '<b>Ok</b>',
                        type: 'pink-white-theme-color'
                      }
                    ]
                });
            }           

        });

    }

})


.controller('LocalDealsCtrl', function($scope, $state,$ionicSlideBoxDelegate, $rootScope,$cordovaGeolocation,LocationService,$location, DealService, $ionicLoading, $ionicPopup, $cordovaSocialSharing, $ionicModal, $stateParams, SharingService, $ionicPopover) {
  
  
  //$scope.viewMapListing=0;
  //$rootScope.test =0;

  $scope.mapView = function(){
    // document.getElementById('onlyMap').style.display = "block"
    $scope.viewMapListing=true;
    $scope.viewlisting=false;


      $cordovaGeolocation
              .getCurrentPosition(POS_OPTIONS)
              .then(function (position) {      
                
                var latitude  = position.coords.latitude;
                var longitude = position.coords.longitude;

                // console.log(latitude + ' : ' + longitude);
                putMarkerLastStep(latitude, longitude);                
                
            }, function(err) {        
                console.log(err);
                var latitude  = 28.6100;
                var longitude = 77.2300;
                putMarkerLastStep(latitude, longitude);  
            });


            /**** this rendering of markers via ng resource using service Locations ****/

            var putMarkerLastStep = function (latitude, longitude) {
      
                var myOptions = {
                      center: new google.maps.LatLng(latitude, longitude),
                      zoom: 7,
                      mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
              
                var map = new google.maps.Map(document.getElementById("map"),myOptions);

                var userData  = JSON.parse(window.localStorage['userData']);
                var user_id   = userData.session_id;
                console.log("rsrs");
                console.log(user_id)

                DealService.findLocalDeals(latitude, longitude, user_id).then(function (deals) {
                    
                    // console.log(deals.data.business[0][0].coordinates[0]);
                    // console.log(deals.data.business[0][0].coordinates[1]);
                    // console.log(deals.data.data);

                    var business_coordinates = deals.data;
                    var loan = 'loan';

                    for(var i=0;i<deals.data.data.length;i++)
                    {                      
                        var latdata     = deals.data.data[i].location[0].coordinates[1];
                        var longdata    = deals.data.data[i].location[0].coordinates[0];
                        latlongDataset  = new google.maps.LatLng(latdata, longdata);
                        var marker      = new google.maps.Marker({
                            map: map, 
                            title: loan ,
                            position : latlongDataset
                        });
                        map.setCenter(marker.getPosition())
                        
                        var content     = deals.data.data[i]._id;
                        var infowindow  = new google.maps.InfoWindow()

                        google.maps.event.addListener(marker,'click', (function(marker, content, infowindow){ 
                            return function() {
                              
                              var date = new Date();
                              $cordovaGeolocation
                                  .getCurrentPosition(POS_OPTIONS)
                                  .then(function (position) {
                                    LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                                      var timezone = data.data.timeZoneId;
                                      DealService.findDealsByBizId(content,timezone).then(function (data) {
                                          if(data.data.data.length == 0){
                                            var windowContent = 'We\'ve No Deal on this Address for now.';
                                          }else{
                                            var windowContent="<strong>Deals:</strong><br>"
                                            for(var j=0;j<data.data.data.length;j++){
                                             windowContent += '<br> <a class="pink-colo-font" href="#/app/single-deal/'+data.data.data[j]._id+'">'+data.data.data[j].deal_name+'</a>';
                                          }
                                          }
                                          // console.log(data.data.data.length)                                
                                          infowindow.setContent(windowContent);
                                          infowindow.open(map,marker);
                                        });
                                    });     
                                  }, function(err) {
                                    latitude  = undefined;
                                    longitude = undefined;
                                  });



                              
                                
                            };
                        })(marker,content,infowindow)); 

                        marker.setMap(map);
                        infowindow.setMap(map);
                    }

                });
            }


  }

 
   
 $scope.viewListingView = function(){
   
  //console.log($rootScope.test)

    $scope.viewMapListing=false;
    $scope.viewlisting=true;
   $scope.dealType="";

 if($stateParams.sortType!="" && $stateParams.sortType!=undefined){
        $scope.dealType=$stateParams.sortType;
  } 
 $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;
  $scope.filter ={}
  var date = new Date();
  

  if (localStorage.getItem("userData") === null) {
    $state.go('landing');
  }else{
    $scope.userData = JSON.parse(window.localStorage['userData']);
    $scope.session_id = $scope.userData.session_id;
  }
 
  // console.log($stateParams.sortType);
  if(typeof window.localStorage['user_range'] != 'undefined'){    
    var range = window.localStorage['user_range'];
    $scope.filter.range = Number(window.localStorage['user_range']);
  }else{
    var range = '';
  }
  if(typeof window.localStorage['deal_keyword'] != 'undefined'){    
    var deal_keyword = window.localStorage['deal_keyword'];
    $scope.filter.deal_keyword = window.localStorage['deal_keyword'];
  }else{
    var deal_keyword = '';
  }
  if(typeof window.localStorage['deal_search_zipcode'] != 'undefined'){    
    var deal_search_zipcode = window.localStorage['deal_search_zipcode'];
    $scope.filter.deal_search_zipcode = window.localStorage['deal_search_zipcode'];
  }else{
    var deal_search_zipcode = '';
  }




  if (  (
          window.localStorage['deal_search_zipcode'] != '' 
          && typeof window.localStorage['deal_search_zipcode'] != 'undefined'
        )||
        (
          window.localStorage['deal_keyword'] != '' 
          && typeof window.localStorage['deal_keyword'] != 'undefined'
        )
    ) {

    console.log(window.localStorage['deal_keyword'], window.localStorage['deal_search_zipcode'])

    if (  window.localStorage['deal_search_zipcode'] != '' 
          && typeof window.localStorage['deal_search_zipcode'] != 'undefined' 
    ){
        var type = 1;
        $cordovaGeolocation
        .getCurrentPosition(POS_OPTIONS)
        .then(function (position) {
            var promise = AddressService.getLatLongByLocation($scope.filter.deal_search_zipcode).then(function(payload) {          
                // console.log(payload)
                LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                    
                    $scope.timezone = data.data.timeZoneId;
                    console.log($scope.timezone)

                    window.localStorage['timezone']  = $scope.timezone;
                    $scope.user_range = window.localStorage['user_range'];

                    if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
                      $scope.timezone = "America/Los_Angeles"
                    };
                    if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
                      $scope.user_range = "0"
                    };

                    var userLocationData  = payload.data;
                    if(userLocationData.results.length > 0){
                      latitude       = userLocationData.results[0].geometry.location.lat;
                      longitude      = userLocationData.results[0].geometry.location.lng;
                      DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, $scope.user_range, type, $scope.timezone).then(function (deals) {
                        $scope.deals = deals.data.data;
                        $scope.futuredeals = deals.data.futuredeals;
                        $ionicLoading.hide();
                      });
                    }else{
                      DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, position.coords.latitude, position.coords.longitude, $scope.user_range, type, $scope.timezone).then(function (deals) {
                        $scope.deals = deals.data.data;
                        $scope.futuredeals = deals.data.futuredeals;
                        console.log($scope.deals)
                        $ionicLoading.hide();
                      });
                    }

                })

            })
          }, function(err) {
            latitude  = undefined;
            longitude = undefined;
            DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, '', type, '').then(function (deals) {
              $scope.deals = deals.data.data;
              console.log($scope.deals)
              $scope.futuredeals = deals.data.futuredeals;
              $ionicLoading.hide();
            }); 
          });
    }else{
        var type = 2;
        $cordovaGeolocation
        .getCurrentPosition(POS_OPTIONS)
        .then(function (position) {
            LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                    
                $scope.timezone = data.data.timeZoneId;

                window.localStorage['timezone']  = $scope.timezone;
                $scope.user_range = window.localStorage['user_range'];

                if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
                  $scope.timezone = "America/Los_Angeles"
                };
                if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
                  $scope.user_range = "0"
                };
                DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, position.coords.latitude, position.coords.longitude, $scope.user_range, type, $scope.timezone).then(function (deals) {
                  $scope.deals = deals.data.data;
                  console.log($scope.deals)
                  $scope.futuredeals = deals.data.futuredeals;
                  $ionicLoading.hide();
                });
            });
        }, function(err) {
          latitude  = undefined;
          longitude = undefined;
          DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, '', type, '').then(function (deals) {
            $scope.deals = deals.data.data;
            console.log($scope.deals)
            $scope.futuredeals = deals.data.futuredeals;
            $ionicLoading.hide();
          }); 
        });
    }
    
    
  }else{

    $scope.page = 0;

    $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      // window.localStorage['currentlatitude']  = position.coords.latitude;
      // window.localStorage['currentlongitude'] = position.coords.longitude;

      LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
        $scope.timezone = data.data.timeZoneId;
        console.log($scope.timezone)



        window.localStorage['timezone']  = $scope.timezone;
        $scope.user_range = window.localStorage['user_range'];

        if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
          $scope.timezone = "America/Los_Angeles"
        };
        if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
          $scope.user_range = "0"
        };

 //console.log($scope.dealType)
        var promise = LocationService.getLocationByLatLong(position.coords.latitude, position.coords.longitude);
          promise.then(function(payload) {

              var userLocationData  = payload.data;
              formatted_address     = userLocationData.results[1].formatted_address;
              var addressArray      = formatted_address.split(",");
              country               = addressArray[addressArray.length-1].trim();
          
              console.log(country)
              DealService.findAllDeals($scope.userData.session_id,country,$scope.dealType,position.coords.latitude, position.coords.longitude, $scope.timezone, $scope.user_range).then(function (deals) {
          $scope.deals = deals.data.data;
         if($scope.deals!=undefined){
            window.localStorage['currentcount'] = deals.data.data.length;
          }
          
          $scope.futuredeals = deals.data.futuredeals;
          
          $ionicLoading.hide();
        });
          });

        
      });

    }, function(err) {
       latitude  = undefined;
      longitude = undefined;
      if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
        $scope.timezone = "America/Los_Angeles"
      };
      if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
        $scope.user_range = "0"
      };
      DealService.findAllDeals($scope.userData.session_id, latitude, longitude, $scope.timezone, $scope.user_range).then(function (deals) {
        $scope.deals = deals.data.data;
        $scope.futuredeals = deals.data.futuredeals;
        $ionicLoading.hide();
      }); 
      }); 
  

  };
  

  DealService.findAllBusinessAddrLatLong().then(function (deals) {
    $scope.dealsLatLong = deals.data;
  });
  
  
  // DEALS FILTER POPOVER

  $ionicPopover.fromTemplateUrl('templates/deals/deal-filter-popover.html', {
    scope: $scope,
    // focusFirstInput: true
  }).then(function(popover) {
    $scope.popover = popover;    
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });


  /************** SET DEAL RANGE ***********/

  $scope.setDealRange = function(filter){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    console.log(filter)
    DealService.setDealRange(filter.range, $scope.userData.session_id).then(function (data) {
      console.log(data.data)
      if (data.data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    'Range Updated Successfully!',
                template: 'Your area circle range has been updated Successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });


            
            if (typeof filter.range != 'undefined'){
              window.localStorage['user_range']           = filter.range;
            }else{
              window.localStorage['user_range']           = '0';
            }
            if (typeof filter.deal_search_zipcode != 'undefined' && filter.deal_search_zipcode != ''){
              window.localStorage['deal_search_zipcode']  = filter.deal_search_zipcode;
            }else{
              window.localStorage['deal_search_zipcode']  = '';
            }
            if (typeof filter.deal_keyword != 'undefined' && filter.deal_keyword != ''){
              window.localStorage['deal_keyword']         = filter.deal_keyword;
            }else{
              window.localStorage['deal_keyword']         = '';
            }
           
           
            $state.go($state.current, {}, {reload: true});

        } else{                
            var alertPopup = $ionicPopup.alert({
                title:    'Anonymously failed!',
                template: 'Sorry for the inconvenience. Please try again later.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        }
      $ionicLoading.hide();
    }); 
  }


  /************** DEAL SEARCH ***********/

  $scope.searchDeal = function(deal_keyword){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    $location.path( "app/deals/search/"+deal_keyword );    
  }

  $scope.searchDealByZip = function(deal_search_zipcode){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    $location.path( "app/deals/byzipcode/"+deal_search_zipcode );    
  }

  $scope.searchDealByCity = function(deal_search_city){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    $location.path( "app/deals/bycity/"+deal_search_city );    
  }


  /************** DEAL SHARING ***********/  

  $scope.share = function(dealId, deal_owner, shareVia, message, subject, file, link){

    var image = '';
    // console.log('hey ' + shareVia);
    
    if( shareVia == 'fb' ){
      
      $cordovaSocialSharing
        .shareViaFacebook(message, image, link)
        .then(function(result) {
        
          SharingService.addShare(dealId, $scope.session_id, deal_owner, 'facebook');
          $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Facebook app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'tw' ){
      $cordovaSocialSharing
        .shareViaTwitter(message, image, link)
        .then(function(result) {
          
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'twitter');
            $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Twitter app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'insta' ){
      
      
      window.plugins.socialsharing.shareViaInstagram(message, '',  function(){
            var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                // template: 'Your deal has been Successfully shared. '+result,
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            $scope.modal.hide();            
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'google+');
          }, function(msg) {
            var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                // template: 'No Instagram app found in this device. '+msg,
                template: 'No Instagram app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
      
      
    }else if( shareVia == 'wp' ){
      $cordovaSocialSharing
        .shareViaWhatsApp(message, image, link)
        .then(function(result) {
            /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'twitter');
            $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No WhatsApp app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'gp' ){
      window.plugins.socialsharing.shareVia('com.google.android.apps.plus', message, null, null, null,  function(){
            var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared. '+result,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            $scope.modal.hide();            
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'google+');
          }, function(msg) {
            var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Google+ app found in this device. '+err,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
    }else if( shareVia == 'all' ){
      $cordovaSocialSharing
      .share(message, subject, file, link) // Share via native share sheet
      .then(function(result) {
        
        SharingService.addShare(dealId, $scope.session_id, deal_owner._id, 'all');
        $scope.modal.hide();
      }, function(err) {
        var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'Sorry for the interuption but their is no sharable app in your device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
    }   
  };

  // Create the share modal
  $ionicModal.fromTemplateUrl('templates/deals/share-deal.html', {
    id: '1', // We need to use and ID to identify the modal that is firing the event!
    scope: $scope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  // Open the share modal
  $scope.shareDeal = function(dealId, deal_owner, type, message, subject, file, link) {
    $scope.shareDealId      = dealId;
    $scope.shareDealOwner   = deal_owner;
    $scope.shareDealmessage = message;
    $scope.shareDealsubject = subject;
    $scope.shareDealfile    = file;
    $scope.shareDeallink    = link;
    $scope.modal.show();
  };

  $scope.$on('modal.shown', function(event, modal) {
    // console.log('Modal ' + modal.id + ' is shown!');
  });

  $scope.$on('modal.hidden', function(event, modal) {
    // console.log('Modal ' + modal.id + ' is hidden!');
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });



  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

  

  /*************** PAGINATION ***************/
  
  $scope.loadMoreq = function(page){

    var perPage = 1;
    page += 1;
    console.log(page);
    // console.log('$scope.count: ' + $scope.count);
    // console.log('$scope.count: ' + $scope.userData.session_id + window.localStorage['currentlatitude']);

    // while (3 >= (page * perPage)) {
      DealService.findAllDeals($scope.userData.session_id, window.localStorage['currentlatitude'], window.localStorage['currentlongitude'], perPage, page).then(function (deals) {
        
        $scope.count = deals.data.count;

        // console.log(deals.data.data);
        // console.log(Number(page) * Number(perPage))

        for (var i=0; i< deals.data.data.length; i++) {
          console.log($scope.deals);
          $scope.deals.push(deals.data.data[i]);
          // console.log(deals.data.data[i])
          // $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        $scope.page = page + 1;
        console.log($scope.page);
      });
      // 
    
    // };
    
  };

  $rootScope.$broadcast('getTotalCount', true);


  }
 // $rootScope.test
  
    $scope.viewListingView();
  
  
})


.controller('NationalDealsCtrl', function($scope, $state, DealService, LocationService, $ionicLoading, $ionicPopup, $cordovaGeolocation, $stateParams) {
  
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  var date = new Date();
  $scope.shouldShowDelete   = false;
  $scope.shouldShowReorder  = false;
  $scope.listCanSwipe       = true;

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;
  
  if (localStorage.getItem("userData") === null) {
    $state.go('landing');
  }else{
    $scope.userData = JSON.parse(window.localStorage['userData']);
    $scope.session_id = $scope.userData.session_id;
  }
  

  $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
     
      LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                    
          $scope.timezone = data.data.timeZoneId;
          console.log($scope.timezone)

          window.localStorage['timezone']  = $scope.timezone;

          if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
            $scope.timezone = "America/Los_Angeles"
          };

          var promise = LocationService.getLocationByLatLong(position.coords.latitude, position.coords.longitude);
          promise.then(function(payload) {

              var userLocationData  = payload.data;
              formatted_address     = userLocationData.results[1].formatted_address;
              var addressArray      = formatted_address.split(",");
              country               = addressArray[addressArray.length-1].trim();
          
              DealService.findNationalDeals(country, $scope.timezone).then(function (deals) {
                $scope.nationaldeals = deals.data.data;
                // $scope.deals = deals.data.data;
                $scope.futuredeals = deals.data.futuredeals;
                $ionicLoading.hide();
              });
          });
      })
        

    }, function(err) {
      
      DealService.findNationalDeals(DEFAULT_COUNTRY).then(function (deals) {
        $scope.nationaldeals = deals.data.data;
        // $scope.deals = deals.data.data;
        $scope.futuredeals = deals.data.futuredeals;
        $ionicLoading.hide();
      });

    });

})
.controller('DealsCtrl', function($scope,$stateParams,$rootScope, $state, $location, DealService, $ionicLoading, $ionicPopup, $cordovaSocialSharing, $ionicModal, $stateParams, SharingService, $ionicPopover, LocationService, $cordovaGeolocation, AddressService, $ionicViewService) {

 $scope.dealType="";
 if($stateParams.sortType!="" && $stateParams.sortType!=undefined){
        $scope.dealType=$stateParams.sortType;
  } 
 $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;
  $scope.filter ={}
  var date = new Date();
  

  if (localStorage.getItem("userData") === null) {
    $state.go('landing');
  }else{
    $scope.userData = JSON.parse(window.localStorage['userData']);
    $scope.session_id = $scope.userData.session_id;
  }
 
  // console.log($stateParams.sortType);
  if(typeof window.localStorage['user_range'] != 'undefined'){    
    var range = window.localStorage['user_range'];
    $scope.filter.range = Number(window.localStorage['user_range']);
  }else{
    var range = '';
  }
  if(typeof window.localStorage['deal_keyword'] != 'undefined'){    
    var deal_keyword = window.localStorage['deal_keyword'];
    $scope.filter.deal_keyword = window.localStorage['deal_keyword'];
  }else{
    var deal_keyword = '';
  }
  if(typeof window.localStorage['deal_search_zipcode'] != 'undefined'){    
    var deal_search_zipcode = window.localStorage['deal_search_zipcode'];
    $scope.filter.deal_search_zipcode = window.localStorage['deal_search_zipcode'];
  }else{
    var deal_search_zipcode = '';
  }

  // GETTING CURRENT TIMEZONE
  /*
  $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
        $scope.timezone = data.data.timeZoneId;
        window.localStorage['timezone'] = $scope.timezone;
      });     
    }, function(err) {
      latitude  = undefined;
      longitude = undefined;
    });
  */

  /*
  if ($stateParams.sortType == 'latest') {

    $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      DealService.findLatestDeals($scope.userData.session_id, position.coords.latitude, position.coords.longitude).then(function (deals) {
        $scope.deals = deals.data.data;
        $ionicLoading.hide();
      });     
    }, function(err) {
      latitude  = undefined;
      longitude = undefined;
      DealService.findLatestDeals($scope.userData.session_id, latitude, longitude).then(function (deals) {
        $scope.deals = deals.data.data;
        $ionicLoading.hide();
      }); 
    });

  }else if ($stateParams.sortType == 'popular') {

    $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      DealService.findPopularDeals($scope.userData.session_id, position.coords.latitude, position.coords.longitude).then(function (deals) {
        $scope.deals = deals.data.data;
        $ionicLoading.hide();
      });     
    }, function(err) {
      latitude  = undefined;
      longitude = undefined;
      DealService.findPopularDeals($scope.userData.session_id, latitude, longitude).then(function (deals) {
        $scope.deals = deals.data.data;
        $ionicLoading.hide();
      }); 
    });

  }else if ($stateParams.sortType == 'favorite') {

    $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      DealService.findFavoriteDeals($scope.userData.session_id, position.coords.latitude, position.coords.longitude).then(function (deals) {
        $scope.deals = deals.data.data;
        $ionicLoading.hide();
      });     
    }, function(err) {
      latitude  = undefined;
      longitude = undefined;
      DealService.findFavoriteDeals($scope.userData.session_id, latitude, longitude).then(function (deals) {
        $scope.deals = deals.data.data;
        $ionicLoading.hide();
      }); 
    });

  }*/


  if (  (
          window.localStorage['deal_search_zipcode'] != '' 
          && typeof window.localStorage['deal_search_zipcode'] != 'undefined'
        )||
        (
          window.localStorage['deal_keyword'] != '' 
          && typeof window.localStorage['deal_keyword'] != 'undefined'
        )
    ) {

    console.log(window.localStorage['deal_keyword'], window.localStorage['deal_search_zipcode'])

    if (  window.localStorage['deal_search_zipcode'] != '' 
          && typeof window.localStorage['deal_search_zipcode'] != 'undefined' 
    ){
        var type = 1;
        $cordovaGeolocation
        .getCurrentPosition(POS_OPTIONS)
        .then(function (position) {
            var promise = AddressService.getLatLongByLocation($scope.filter.deal_search_zipcode).then(function(payload) {          
                // console.log(payload)
                LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                    
                    $scope.timezone = data.data.timeZoneId;
                    console.log($scope.timezone)

                    window.localStorage['timezone']  = $scope.timezone;
                    $scope.user_range = window.localStorage['user_range'];

                    if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
                      $scope.timezone = "America/Los_Angeles"
                    };
                    if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
                      $scope.user_range = "0"
                    };

                    var userLocationData  = payload.data;
                    if(userLocationData.results.length > 0){
                      latitude       = userLocationData.results[0].geometry.location.lat;
                      longitude      = userLocationData.results[0].geometry.location.lng;
                      DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, $scope.user_range, type, $scope.timezone).then(function (deals) {
                        $scope.deals = deals.data.data;
                        $scope.futuredeals = deals.data.futuredeals;
                        $ionicLoading.hide();
                      });
                    }else{
                      DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, position.coords.latitude, position.coords.longitude, $scope.user_range, type, $scope.timezone).then(function (deals) {
                        $scope.deals = deals.data.data;
                        $scope.futuredeals = deals.data.futuredeals;
                        console.log($scope.deals)
                        $ionicLoading.hide();
                      });
                    }

                })

            })
          }, function(err) {
            latitude  = undefined;
            longitude = undefined;
            DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, '', type, '').then(function (deals) {
              $scope.deals = deals.data.data;
              console.log($scope.deals)
              $scope.futuredeals = deals.data.futuredeals;
              $ionicLoading.hide();
            }); 
          });
    }else{
        var type = 2;
        $cordovaGeolocation
        .getCurrentPosition(POS_OPTIONS)
        .then(function (position) {
            LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                    
                $scope.timezone = data.data.timeZoneId;

                window.localStorage['timezone']  = $scope.timezone;
                $scope.user_range = window.localStorage['user_range'];

                if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
                  $scope.timezone = "America/Los_Angeles"
                };
                if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
                  $scope.user_range = "0"
                };
                DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, position.coords.latitude, position.coords.longitude, $scope.user_range, type, $scope.timezone).then(function (deals) {
                  $scope.deals = deals.data.data;
                  console.log($scope.deals)
                  $scope.futuredeals = deals.data.futuredeals;
                  $ionicLoading.hide();
                });
            });
        }, function(err) {
          latitude  = undefined;
          longitude = undefined;
          DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, '', type, '').then(function (deals) {
            $scope.deals = deals.data.data;
            console.log($scope.deals)
            $scope.futuredeals = deals.data.futuredeals;
            $ionicLoading.hide();
          }); 
        });
    }
    
    
  }else{

    $scope.page = 0;

    $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      // window.localStorage['currentlatitude']  = position.coords.latitude;
      // window.localStorage['currentlongitude'] = position.coords.longitude;

      LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
        $scope.timezone = data.data.timeZoneId;
        console.log($scope.timezone)



        window.localStorage['timezone']  = $scope.timezone;
        $scope.user_range = window.localStorage['user_range'];

        if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
          $scope.timezone = "America/Los_Angeles"
        };
        if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
          $scope.user_range = "0"
        };

 //console.log($scope.dealType)
        var promise = LocationService.getLocationByLatLong(position.coords.latitude, position.coords.longitude);
          promise.then(function(payload) {

              var userLocationData  = payload.data;
              formatted_address     = userLocationData.results[1].formatted_address;
              var addressArray      = formatted_address.split(",");
              country               = addressArray[addressArray.length-1].trim();
          
              console.log(country)
              DealService.findAllDeals($scope.userData.session_id,country,$scope.dealType,position.coords.latitude, position.coords.longitude, $scope.timezone, $scope.user_range).then(function (deals) {
          $scope.deals = deals.data.data;
         if($scope.deals!=undefined){
            window.localStorage['currentcount'] = deals.data.data.length;
          }
          
          $scope.futuredeals = deals.data.futuredeals;
          
          $ionicLoading.hide();
        });
          });

        
      });

    }, function(err) {
       latitude  = undefined;
      longitude = undefined;
      if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
        $scope.timezone = "America/Los_Angeles"
      };
      if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
        $scope.user_range = "0"
      };
      DealService.findAllDeals($scope.userData.session_id, latitude, longitude, $scope.timezone, $scope.user_range).then(function (deals) {
        $scope.deals = deals.data.data;
        $scope.futuredeals = deals.data.futuredeals;
        $ionicLoading.hide();
      }); 
      }); 
  

  };
  

  DealService.findAllBusinessAddrLatLong().then(function (deals) {
    $scope.dealsLatLong = deals.data;
  });
  
  
  // DEALS FILTER POPOVER

  $ionicPopover.fromTemplateUrl('templates/deals/deal-filter-popover.html', {
    scope: $scope,
    // focusFirstInput: true
  }).then(function(popover) {
    $scope.popover = popover;    
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });


  /************** SET DEAL RANGE ***********/

  $scope.setDealRange = function(filter){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    console.log(filter)
    DealService.setDealRange(filter.range, $scope.userData.session_id).then(function (data) {
      console.log(data.data)
      if (data.data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    'Range Updated Successfully!',
                template: 'Your area circle range has been updated Successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });


            
            if (typeof filter.range != 'undefined'){
              window.localStorage['user_range']           = filter.range;
            }else{
              window.localStorage['user_range']           = '0';
            }
            if (typeof filter.deal_search_zipcode != 'undefined' && filter.deal_search_zipcode != ''){
              window.localStorage['deal_search_zipcode']  = filter.deal_search_zipcode;
            }else{
              window.localStorage['deal_search_zipcode']  = '';
            }
            if (typeof filter.deal_keyword != 'undefined' && filter.deal_keyword != ''){
              window.localStorage['deal_keyword']         = filter.deal_keyword;
            }else{
              window.localStorage['deal_keyword']         = '';
            }
           
           
            $state.go($state.current, {}, {reload: true});

        } else{                
            var alertPopup = $ionicPopup.alert({
                title:    'Anonymously failed!',
                template: 'Sorry for the inconvenience. Please try again later.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        }
      $ionicLoading.hide();
    }); 
  }


  /************** DEAL SEARCH ***********/

  $scope.searchDeal = function(deal_keyword){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    $location.path( "app/deals/search/"+deal_keyword );    
  }

  $scope.searchDealByZip = function(deal_search_zipcode){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    $location.path( "app/deals/byzipcode/"+deal_search_zipcode );    
  }

  $scope.searchDealByCity = function(deal_search_city){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    $location.path( "app/deals/bycity/"+deal_search_city );    
  }


  /************** DEAL SHARING ***********/  

  $scope.share = function(dealId, deal_owner, shareVia, message, subject, file, link){

    var image = '';
    // console.log('hey ' + shareVia);
    
    if( shareVia == 'fb' ){
      
      $cordovaSocialSharing
        .shareViaFacebook(message, image, link)
        .then(function(result) {
          /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
          SharingService.addShare(dealId, $scope.session_id, deal_owner, 'facebook');
          $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Facebook app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'tw' ){
      $cordovaSocialSharing
        .shareViaTwitter(message, image, link)
        .then(function(result) {
            /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'twitter');
            $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Twitter app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'insta' ){
      
      
      window.plugins.socialsharing.shareViaInstagram(message, '',  function(){
            var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                // template: 'Your deal has been Successfully shared. '+result,
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            $scope.modal.hide();            
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'google+');
          }, function(msg) {
            var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                // template: 'No Instagram app found in this device. '+msg,
                template: 'No Instagram app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
      
      /*
      var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Instagram app found in this device. '+err,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });$scope.modal.hide();*//*
      window.plugins.socialsharing.shareVia('com.instagram.android', message, null, null, null,  function(){
            var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared. '+result,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            $scope.modal.hide();            
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'google+');
          }, function(msg) {
            var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Instagram app found in this device. '+err,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });*/
    }else if( shareVia == 'wp' ){
      $cordovaSocialSharing
        .shareViaWhatsApp(message, image, link)
        .then(function(result) {
            /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'twitter');
            $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No WhatsApp app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'gp' ){
      window.plugins.socialsharing.shareVia('com.google.android.apps.plus', message, null, null, null,  function(){
            var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared. '+result,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            $scope.modal.hide();            
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'google+');
          }, function(msg) {
            var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Google+ app found in this device. '+err,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
    }else if( shareVia == 'all' ){
      $cordovaSocialSharing
      .share(message, subject, file, link) // Share via native share sheet
      .then(function(result) {
        /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
        SharingService.addShare(dealId, $scope.session_id, deal_owner._id, 'all');
        $scope.modal.hide();
      }, function(err) {
        var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'Sorry for the interuption but their is no sharable app in your device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
    }   
  };

  // Create the share modal
  $ionicModal.fromTemplateUrl('templates/deals/share-deal.html', {
    id: '1', // We need to use and ID to identify the modal that is firing the event!
    scope: $scope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.closeModal = function() {
    $scope.modal.hide();
  };

  // Open the share modal
  $scope.shareDeal = function(dealId, deal_owner, type, message, subject, file, link) {
    $scope.shareDealId      = dealId;
    $scope.shareDealOwner   = deal_owner;
    $scope.shareDealmessage = message;
    $scope.shareDealsubject = subject;
    $scope.shareDealfile    = file;
    $scope.shareDeallink    = link;
    $scope.modal.show();
  };

  $scope.$on('modal.shown', function(event, modal) {
    // console.log('Modal ' + modal.id + ' is shown!');
  });

  $scope.$on('modal.hidden', function(event, modal) {
    // console.log('Modal ' + modal.id + ' is hidden!');
  });

  $scope.$on('$destroy', function() {
    $scope.modal.remove();
  });



  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

  

  /*************** PAGINATION ***************/
  
  $scope.loadMoreq = function(page){

    var perPage = 1;
    page += 1;
    console.log(page);
    // console.log('$scope.count: ' + $scope.count);
    // console.log('$scope.count: ' + $scope.userData.session_id + window.localStorage['currentlatitude']);

    // while (3 >= (page * perPage)) {
      DealService.findAllDeals($scope.userData.session_id, window.localStorage['currentlatitude'], window.localStorage['currentlongitude'], perPage, page).then(function (deals) {
        
        $scope.count = deals.data.count;

        // console.log(deals.data.data);
        // console.log(Number(page) * Number(perPage))

        for (var i=0; i< deals.data.data.length; i++) {
          console.log($scope.deals);
          $scope.deals.push(deals.data.data[i]);
          // console.log(deals.data.data[i])
          // $scope.$broadcast('scroll.infiniteScrollComplete');
        }

        $scope.page = page + 1;
        console.log($scope.page);
      });
      // 
    
    // };
    
  };

  $rootScope.$broadcast('getTotalCount', true);

})
.controller('CreateDealCtrl', function($scope, $rootScope, $state, $location, DealService, $ionicLoading, $ionicPopup, $cordovaSocialSharing, $ionicModal, $stateParams, SharingService, $ionicPopover, LocationService, $cordovaGeolocation, AddressService, CreditsService, $timeout) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.deal = {};

  $scope.userData = JSON.parse(window.localStorage['userData']);
  $scope.session_id = $scope.userData.session_id;
  $scope.countries = COUNTRIES;

  DealService.findAllDealCategories().then(function (categories) {
    $scope.dealMenuCategories = categories.data.data;    
    $ionicLoading.hide();
  });

  DealService.findAllBusinessAddr($scope.userData.session_id).then(function (address) {
    $scope.businessAddress = address.data.data;    
    $ionicLoading.hide();
  });

  DealService.hourValues().then(function (data) {
    $scope.hourValues = data.data.data;    
    $ionicLoading.hide();
  });

    
    $scope.enable_1=false;
    $scope.enable_2=false;
    $scope.enable_3=false;
    $scope.enable_4=false;
  $scope.currentDateTime=function(type){
    //console.log(type)

    if(type==1){
    $scope.enable_2=true;
    $scope.enable_3=true;
    $scope.enable_4=true;
    }else if(type==2){
    $scope.enable_1=true;
    $scope.enable_2=false;
    $scope.enable_3=true;
    $scope.enable_4=true;
    }else if(type==3){
    $scope.enable_1=true;
    $scope.enable_2=true;
    $scope.enable_3=false;
    $scope.enable_4=true;
    }
    else if(type==4){
    $scope.enable_1=true;
    $scope.enable_2=true;
    $scope.enable_3=true;
    $scope.enable_4=false;
    }

    

   //console.log($scope.allModels)
    
   //console.log($scope.allModels);
   // $scope.deal.from_date
   // $scope.deal.from_time
   // $scope.deal.to_date
   // $scope.deal.to_time
  }

  $scope.enablecurrentDateTime=function(type){
   // console.log(type)

    if(type==1){
    $scope.enable_2=false;
    $scope.enable_3=false;
    $scope.enable_4=false;
    }else if(type==2){
    $scope.enable_1=false;
    $scope.enable_2=false;
    $scope.enable_3=false;
    $scope.enable_4=false;
    }else if(type==3){
    $scope.enable_1=false;
    $scope.enable_2=false;
    $scope.enable_3=false;
    $scope.enable_4=false;
    }
    else if(type==4){
    $scope.enable_1=false;
    $scope.enable_2=false;
    $scope.enable_3=false;
    $scope.enable_4=false;
    }
  }

  CreditsService.getCredits($scope.userData.session_id).then(function (credits) {
     //console.log(credits)
    $scope.credits = credits.data.data[0];
    console.log("@@@@@")
    console.log($scope.credits)

    $scope.hourdataArray = $scope.credits;

    //console.log($scope.hourdataArray);
   

    //console.log($scope.hourdataArray.credit_balance)

    //console.log($scope.hourdataArray.credit_bought)

    $scope.hourValuesArray = []; 

     for(var i=1 ;i<=100;i++){
     $scope.hourValuesArray[i] = {
            salevalue:(parseInt($scope.hourdataArray.credit_bought)*i)/$scope.hourdataArray.credit_balance ,
            hour: i
         }
     }
     var creditsAlert = $ionicPopup.show({
        template: '',
        title: 'Current Hours',
        subTitle: 'You have <strong>'+$scope.credits.credit_remain_amount+'</strong> Hours in your account.',
        scope: $scope,
        buttons: [
          {
            text: 'OK',
            type: 'pink-white-theme-color',
            onTap: function(e) {
              
              $timeout(function () {
                if ($scope.credits.credit_remain_amount <='2' ) {
                  var buyCredits = $ionicPopup.show({
                      template: '',
                      title: 'Low Hours',
                      subTitle: 'Your hours are critically low to create a Deal. You have to buy more hours.',
                      scope: $scope,
                      buttons: [
                        {
                          text: 'Buy Hours',
                          type: 'pink-white-theme-color',
                          onTap: function(e) {
                            $location.path('app/credits')
                          }
                        },
                        {
                          text: 'Cancel',
                          onTap: function(e) {
                            console.log('Ok')
                          }
                        }
                      ]
                  });
                };
              }, 3000);
            }
          }
        ]
    });
  });

  // GETTING CURRENT COUNTRY
  $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      var promise = LocationService.getLocationByLatLong(position.coords.latitude, position.coords.longitude);
      promise.then(function(payload) {

          var userLocationData = payload.data;

          $scope.userLocation       = userLocationData.results[1].formatted_address;
          var user_location         = $scope.userLocation;
          var addressArray          = user_location.split(",");
          $scope.deal.deal_country  = addressArray[addressArray.length-1].trim();
      });
      
    }, function(err) {        
      
    });

      $scope.number = 100;
      $scope.getNumber = function(num) {
          return new Array(num);   
      }

  
  
  /*************** CREATE DEAL ***************/

  $scope.createDealOptionNew = function(deal, status) {
    if (status==1) {deal.deal_publish = '1';}else{deal.deal_publish = '0';};
    $scope.createDeal(deal)
  }

  $scope.createDealOption = function(deal) {
    
    var data = $scope.getBill(deal);
    console.log("=========================");
    console.log(data);
    console.log("=========================");
    if (data == true) {
      var buyCredits = $ionicPopup.show({
        template: '',
        title: 'Publish Deal',
        subTitle: 'Choose your method to buy',
        scope: $scope,
        buttons: [
          { 
            text: 'Publish',
            type: 'pink-white-theme-color',
            onTap: function(e) {            
              deal.deal_publish = '1';
              $scope.createDeal(deal)
            }
          },
          {
            text: 'Save for Later',
            onTap: function(e) {
              deal.deal_publish = '0';
              $scope.createDeal(deal)
            }
          }
        ]
      });
    }
  }

  $scope.createDeal = function(deal) {
    
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    
    deal.dealImageData = $scope.dealImageData;
    // deal.dealImageData = BASE64IMAGE;
    deal.dealIconData  = $scope.dealIconData;
    $scope.userData = JSON.parse(window.localStorage['userData']);
    
    if ( deal.deal_link == undefined) { deal.deal_link = '' };
    if ( deal.deal_description == undefined) { deal.deal_description = '' };
    if ( deal.dealImage == undefined) { deal.dealImage = '' };
    if ( deal.dealIcon == undefined) { deal.dealIcon = '' };
    if ( deal.newBizAddr == undefined) { deal.newBizAddr = '' };
    if ( deal.bizAddrId  == undefined) { deal.bizAddrId ='' };
    if ( deal.favourite  == undefined) { deal.favourite ='0' };    
    if ( deal.deal_price == undefined) { deal.deal_price ='' };
    if ( deal.deal_location_type == undefined) { deal.deal_location_type ='' };
    if ( deal.deal_country == undefined) { deal.deal_country ='' };
    // console.log(typeof deal.deal_keyword)
    // console.log(typeof deal.deal_keyword_2)
    // console.log(typeof deal.deal_keyword_3)
    if ( typeof deal.deal_keyword   == 'undefined' || typeof deal.deal_keyword   == 'object' ) { deal.deal_keyword   = document.getElementById('keyword_1_value').value; }else{deal.deal_keyword   = ''};
    if ( typeof deal.deal_keyword_2 == 'undefined' || typeof deal.deal_keyword_2 == 'object' ) { deal.deal_keyword_2 = document.getElementById('keyword_2_value').value; }else{deal.deal_keyword_2 = ''};
    if ( typeof deal.deal_keyword_3 == 'undefined' || typeof deal.deal_keyword_3 == 'object' ) { deal.deal_keyword_3 = document.getElementById('keyword_3_value').value; }else{deal.deal_keyword_3 = ''};
    if ( deal.favourite  == true) { deal.favourite ='1' };
    if ( deal.deal_video) {video_arr = deal.deal_video.split("=");deal.deal_video = 'http://www.youtube.com/embed/'+video_arr[1];
    }else{deal.deal_video = '';};
    deal.deal_zipcode = 0;


    $ionicLoading.hide();
    
    // Deal Duration Time Manipulation

    var onlydate = new Date(deal.from_date);

    var month = onlydate.getMonth()+1;
    var day   = onlydate.getDate();
    var year  = onlydate.getFullYear();

    var onlytime = new Date(deal.from_time);

    var hour = onlytime.getHours();
    if (hour < 10)
        hour = "0"+hour;

    var min = onlytime.getMinutes();
    if (min < 10)
        min = "0"+min;

    var sec = onlytime.getSeconds();
    if (sec < 10)
        sec = "0"+sec;

    deal.from = month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;

   // console.log()
    
    ///////////////  Deal end time start///////////////////////////////////////////
    
    var end_date2 = new Date(deal.to_date);

    var month = end_date2.getMonth()+1;
    var day   = end_date2.getDate();
    var year  = end_date2.getFullYear();

    var end_time2 = new Date(deal.to_time);

    var hour = end_time2.getHours();
    if (hour < 10)
        hour = "0"+hour;

    var min = end_time2.getMinutes();
    if (min < 10)
        min = "0"+min;

    var sec = end_time2.getSeconds();
    if (sec < 10)
        sec = "0"+sec;

    deal.to = month+'/'+day+'/'+year+'  '+hour+':'+min+':'+sec;
    
    var newToDateObj = new Date(deal.to);
    
    
    /////////////// Deal end time end ///////////////////////////////////////
    
    var from_date_obj = new Date(deal.from);
    

    deal.dealOwner     = $scope.userData.session_id;
    deal.deal_lat       = '';
    deal.deal_long      = '';
    // deal.deal_country   = '';
    deal.deal_continent = '';

    // Getting location of deal's Business Address
    
    if (from_date_obj > newToDateObj)
    {
      //////////////////////////////////////////////////////////////////////////////////
      
      var alert = $ionicPopup.show({
      title: 'Dates selection validation',
      subTitle: 'Start Date Time should be less than End Date Time',
      scope: $scope,
      buttons: [
        { 
          text: 'OK',
          type: 'pink-white-theme-color'
         
        }
      ]
      });
      $scope.deal.to_hours = "";
      $scope.bill_credit = "";
      $scope.bill_hour   = "";
      $scope.bill_notify = "";
      $scope.bill_active = ""; 
      //////////////////////////////////////////////////////////////////////////////////
    }
    else
    {
      
    ////////////////////// Deal Notification Hour //////////////////////////////////
    deal.active_hours = Math.round(newToDateObj - from_date_obj) / 36e5;
    
    if (Number(JSON.parse(deal.to_hours).hour) >= deal.active_hours)
    {
      var notify_time = Number(JSON.parse(deal.to_hours).hour) - deal.active_hours; 
      from_date_obj.setHours(from_date_obj.getHours() - notify_time);
      
      var month = from_date_obj.getMonth()+1;
      var day   = from_date_obj.getDate();
      var year  = from_date_obj.getFullYear();
      var hour  = from_date_obj.getHours();
      if (hour < 10)
          hour  = "0"+hour;
  
      var min   = from_date_obj.getMinutes();
      if (min < 10)
          min   = "0"+min;
  
      var sec   = from_date_obj.getSeconds();
      if (sec < 10)
          sec   = "0"+sec;
  
      deal.notify_date_time   =  month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;
      deal.notify_hours        = notify_time;
      
      var sale_hour = Math.round(Number(JSON.parse(deal.to_hours).hour));
      if(deal.newBizAddr != ''){
        var promise = AddressService.getLatLongByLocation(deal.newBizAddr);
        promise.then(function(payload) {
  
            var userLocationData  = payload.data;
            if(userLocationData.results.length > 0){
              deal.deal_lat       = userLocationData.results[0].geometry.location.lat;
              deal.deal_long      = userLocationData.results[0].geometry.location.lng;
  
              formatted_address   = userLocationData.results[0].formatted_address;
              addressArray        = formatted_address.split(",");
              // deal.deal_country   = addressArray[addressArray.length-1].trim();
              address_components  = userLocationData.results[0].address_components; 
              deal.deal_continent = CONTINENTS[address_components[address_components.length-2].short_name];
            
            }
            $scope.createDealLastStep(deal);
        });
      }else{
           $scope.createDealLastStep(deal);
      }
      
    }
    else
    {
      var alert = $ionicPopup.show({
      template: '',
      title: 'Dates Duration',
      subTitle: 'Deal Duration should be minimum '+deal.active_hours + ' Hour',
      scope: $scope,
      buttons: [
        { 
          text: 'OK',
          type: 'pink-white-theme-color'
         
        }
      ]
      });
      $scope.deal.to_hours = "";
      $scope.bill_credit = "";
      $scope.bill_hour   = "";
      $scope.bill_notify = "";
      $scope.bill_active = ""; 
    }
          
    //////////////////// Deal Notification Hour ///////////////////////////////////
      
    
    }
  }
  
  $scope.getBill = function(deal){


      if (Number(JSON.parse(deal.to_hours).hour) > $scope.credits.credit_remain_amount){

           var alert = $ionicPopup.show({
                template: '',
                title: 'Hours Error!',
                subTitle: 'You can only select :'+$scope.credits.credit_remain_amount+ ' Hour',
                buttons: [
                  { 
                    text: 'OK',
                    type: 'pink-white-theme-color'
                   
                  }
                ]
                });
           return;
      } 
      if(!deal.from_time && !deal.from_time){
        //console.log(1)
        var alert = $ionicPopup.show({
          template: '',
          title: 'Timings Error!',
          subTitle: 'Please select complete deal durations first.',
          scope: $scope,
          buttons: [
            { 
              text: 'OK',
              type: 'pink-white-theme-color'
             
            }
          ]
        });
        $scope.deal.to_hours = '';
        return;
      }

       // Deal Duration Time Manipulation
      if (deal.from_date == "" || deal.from_time == "" || deal.to_date == "" || deal.to_time == "") {
        var alert = $ionicPopup.show({
        template: '',
        title: 'Dates Duration',
        subTitle: 'Please select Deal Date Timings first',
        scope: $scope,
        buttons: [
          { 
            text: 'OK',
            type: 'pink-white-theme-color'
           
          }
        ]
        });
        $scope.deal.to_hours = "";
      }
      else
      {
      
      var onlydate = new Date(deal.from_date);

      var month = onlydate.getMonth()+1;
      var day   = onlydate.getDate();
      var year  = onlydate.getFullYear();

      var onlytime = new Date(deal.from_time);

//console.log(Math.round((Number(JSON.parse(deal.to_hours).hour))* 10)/10)
      
      var hour = onlytime.getHours();
      if (hour < 10)
          hour = "0"+hour;

      var min = onlytime.getMinutes();
      if (min < 10)
          min = "0"+min;

      var sec = onlytime.getSeconds();
      if (sec < 10)
          sec = "0"+sec;


     
      deal.from = month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;

      $scope.fromDate=deal.from;

      //console.log($scope.fromDate)
      
      ///////////////  Deal end time start///////////////////////////////////////////
      
      var end_date2 = new Date(deal.to_date);

      var month = end_date2.getMonth()+1;
      var day   = end_date2.getDate();
      var year  = end_date2.getFullYear();




      var end_time2 = new Date(deal.to_time);

      var hour = end_time2.getHours();

      var calucateHour=end_time2.getHours()-onlytime.getHours();
     
      var getFinalHour=Math.round((Number(JSON.parse(deal.to_hours).hour))* 10)/10-calucateHour;
      
      var actaulhour = onlytime.getHours()-getFinalHour;

      if (actaulhour < 10)
          actaulhour = "0"+hour;

      deal.frdate = month+'/'+day+'/'+year+' '+actaulhour+':'+min+':'+sec;  

 //console.log(deal.frdate)

      if (hour < 10)
          hour = "0"+hour;

      var min = end_time2.getMinutes();
      if (min < 10)
          min = "0"+min;

      var sec = end_time2.getSeconds();
      if (sec < 10)
          sec = "0"+sec;

      deal.to = month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;

      $scope.toDate=deal.to;
      //console.log($scope.toDate)
      
      var newToDateObj = new Date(deal.to);
      
      
      /////////////// Deal end time end ///////////////////////////////////////
      
      var from_date_obj = new Date(deal.from);


// var today = newToDateObj;
// var Christmas = from_date_obj;
// var diffMs = (Christmas - today); // milliseconds between now & Christmas
// //var diffDays = Math.round(diffMs / 86400000); // days
// //var diffHrs = Math.round((diffMs % 86400000) / 3600000); // hours
// var diffMins = Math.round(((diffMs % 86400000) % 3600000) / 60000); // minutes
//  console.log(diffMins)
    //  console.log(min)
      if (from_date_obj > newToDateObj)
      {
        //////////////////////////////////////////////////////////////////////////////////
        var alert = $ionicPopup.show({
        title: 'Dates selection validation',
        subTitle: 'Start Date Time should be less than End Date Time',
        scope: $scope,
        buttons: [
          { 
            text: 'OK',
            type: 'pink-white-theme-color'
           
          }
        ]
        });
        //////////////////////////////////////////////////////////////////////////////////
      }else{

            deal.active_hours = Math.round(newToDateObj - from_date_obj) / 36e5;

            // console.log(Number(JSON.parse(deal.to_hours).hour))
            //   console.log("@@@@@@@@@@@")
            // console.log(deal.active_hours)

            if (Number(JSON.parse(deal.to_hours).hour) >= deal.active_hours)
            {
              var notify_time = Number(JSON.parse(deal.to_hours).hour) - deal.active_hours; 
              from_date_obj.setHours(from_date_obj.getHours() - notify_time);
              
              var month = from_date_obj.getMonth()+1;
              var day   = from_date_obj.getDate();
              var year  = from_date_obj.getFullYear();
              var hour  = from_date_obj.getHours();
              if (hour < 10)
                  hour  = "0"+hour;
          
              var min   = from_date_obj.getMinutes();
              if (min < 10)
                  min   = "0"+min;
          
              var sec   = from_date_obj.getSeconds();
              if (sec < 10)
                  sec   = "0"+sec;
          
              deal.notify_date_time   = month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;
              deal.notify_hour        = notify_time;
              //console.log(3)
              console.log(deal.notify_hour)
              $scope.bill_credit = Math.round((Number(JSON.parse(deal.to_hours).salevalue))* 10)/10;
              $scope.bill_hour   = Math.round((Number(JSON.parse(deal.to_hours).hour))* 10)/10;
              $scope.bill_notify = Math.round((Number(notify_time))* 10)/10;
              $scope.bill_active = $scope.bill_hour - $scope.bill_notify;
             // console.log($scope.bill_notify+' '+$scope.bill_active)
                        
              return true;
            }
            else
            {
              var alert = $ionicPopup.show({
              template: '',
              title: 'Dates Duration',
              subTitle: 'Deal Duration should be minimum '+Math.ceil(deal.active_hours) + ' Hour',
              scope: $scope,
              buttons: [
                { 
                  text: 'OK',
                  type: 'pink-white-theme-color'
                 
                }
              ]
              });
              $scope.deal.to_hours = "";
              $scope.bill_credit = "";
              $scope.bill_hour   = "";
              $scope.bill_notify = "";
              $scope.bill_active = "";
            
            } 
        
      }

    }
  }
  
  // HITTING CREATE DEAL SERVICE

  $scope.createDealLastStep = function(deal) {


  


    DealService.createDeal(deal).success(function(data){
        
        console.log(data);

        $ionicLoading.hide();
        
        if (data.code == 200) {

          if (data.balance_code == 200) {

            $rootScope.$broadcast('getTotalCount', true);

            if (deal.deal_publish = '1') {
              var alertTitle   ='Deal has been created successfully!'
              var alertTemplate='Your deal has been successfully created. You can view it under "My Deals".'
            }else{
              var alertTitle   ='Deal has been saved successfully! '
              var alertTemplate='Your deal has been saved successfully for later use. You can view it under "My Deals".'
            };
            var alertPopup = $ionicPopup.alert({
                title:    alertTitle,
                template: alertTemplate,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

            if($rootScope.unpublishedDealId){
              DealService.removeDeal($rootScope.unpublishedDealId).then(function (data) {
                console.log('Delete Unpublished Data: ',data)
              });
            }
            
            $state.go('app.deals');

          }else if(data.balance_code == 105){
            var alertPopup = $ionicPopup.alert({
                title:    'Insufficient Funds!',
                template: 'Insufficient balance, unable to create new deal.\n Please buy hours first.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

            $rootScope.createDeal   = true;
            $rootScope.tempDealData = deal;
            $state.go('app.credits');

          }

        } else if(data.code == 101){

            var alertPopup = $ionicPopup.alert({
                title:    'Anonymously failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

        } else {

            var alertPopup = $ionicPopup.alert({
                title:    'Anonymously failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

        }    

    });
  }

  /* GALLERY AND CAMERA OPTIONS FOR DEAL IMAGE UPLOAD */

  $scope.takePic = function() {
      var options =   {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
          encodingType: 0     // 0=JPG 1=PNG
      }
      navigator.camera.getPicture($scope.onSuccess,$scope.onFail,options);
  }
  $scope.onSuccess = function(DATA_URL) {
    
      // $scope.dealImageData = "data:image/jpeg;base64," + DATA_URL;
      $scope.dealImageData = DATA_URL;
      var image = document.getElementById('dealImage');
      image.src = "data:image/jpeg;base64," + DATA_URL;
      image.style.display = "block";
      document.getElementById('padding-picture').style.display = "block";    
      // document.getElementById('uploadDealImageButton').style.display = "none";
  };
  $scope.onFail = function(e) {
    console.log("On fail " + e);
  }

  /* GALLERY AND CAMERA OPTIONS FOR DEAL ICON UPLOAD */

  $scope.takeIconPic = function() {
      var options =   {
          quality: 50,
          destinationType: Camera.DestinationType.DATA_URL,
          sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
          encodingType: 0     // 0=JPG 1=PNG
      }
      navigator.camera.getPicture($scope.onSuccessIcon,$scope.onFailIcon,options);
  }
  $scope.onSuccessIcon = function(DATA_URL) {
    
      // $scope.dealIconData = "data:image/jpeg;base64," + DATA_URL;
      $scope.dealIconData = DATA_URL;
      var image = document.getElementById('dealIcon');
      image.src = "data:image/jpeg;base64," + DATA_URL;
      image.style.display = "block";
      document.getElementById('padding-icon').style.display = "block";
      // document.getElementById('uploadDealIconButton').style.display = "none";
  };
  $scope.onFailIcon = function(e) {
    console.log("On fail " + e);
  }



  // Create the business modal that we will use later
  $ionicModal.fromTemplateUrl('templates/pages/create-biz-addr.html', {
    id: '1', // We need to use and ID to identify the modal that is firing the event!
    scope: $scope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  $scope.closeModal = function(index) {
    $scope.modal.hide();
  };

  $scope.createBizAddrModal = function(index) {
    $scope.modal.show();
  };
  
  $scope.update = function(place){
    console.log(place)

    $scope.latitude  = place.geometry.location.lat();
    $scope.longitude = place.geometry.location.lng();

    $scope.biz_zipcode = '';
    $scope.country = '';
    $scope.state = '';
    $scope.city = '';

    // FINDING ZIP
    if (place.address_components[place.address_components.length-1].types[0] == 'postal_code') {
      $scope.biz_zipcode = Number(place.address_components[place.address_components.length-1].long_name);
    };

    // FINDING COUNTRY
    if (place.address_components[place.address_components.length-1].types[0] == 'country' || 
        place.address_components[place.address_components.length-2].types[0] == 'country') {
      if(place.address_components[place.address_components.length-1].types[0] == 'country'){
        $scope.country = place.address_components[place.address_components.length-1].long_name;  
      }else{
        $scope.country = place.address_components[place.address_components.length-2].long_name;  
      }      
    };

    // FINDING STATE
    if (place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_1' || 
        place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_1' ||
        place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_1') {
      
      if(place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_1'){
        $scope.state = place.address_components[place.address_components.length-1].long_name;
      }else if(place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_1'){
        $scope.state = place.address_components[place.address_components.length-2].long_name;  
      }else{
        $scope.state = place.address_components[place.address_components.length-3].long_name;  
      }
    };

    // FINDING CITY
    if (place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_2' || 
        place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_2' ||
        place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_2' ||
        place.address_components[place.address_components.length-4].types[0] == 'administrative_area_level_2' ||

        place.address_components[place.address_components.length-1].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-2].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-3].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-4].types[0] == 'sublocality_level_1' ) {
    
      if(place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_2' || 
        place.address_components[place.address_components.length-1].types[0] == 'sublocality_level_1'){
        $scope.city = place.address_components[place.address_components.length-1].long_name;
      }else if( place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_2' || 
                place.address_components[place.address_components.length-2].types[0] == 'sublocality_level_1'){
        $scope.city = place.address_components[place.address_components.length-2].long_name;  
      }else if( place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_2' || 
                place.address_components[place.address_components.length-3].types[0] == 'sublocality_level_1'){
        $scope.city = place.address_components[place.address_components.length-3].long_name;  
      }else{
        $scope.city = place.address_components[place.address_components.length-4].long_name;  
      }    
    };
  }

  /*************** CREATE BIZ ADDRESS  *************/

  $scope.createBizAddr = function(place, city, state, country, biz_zipcode) {
    $scope.modal.hide();

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    // Getting location from lat long
    var promise = AddressService.getLatLongByLocation(place);
    promise.then(function(payload) {
        var address = {};

        var userLocationData  = payload.data;
        
        if (payload.data.results.length > 0) {
          address.biz_lat   = userLocationData.results[0].geometry.location.lat;
          address.biz_long  = userLocationData.results[0].geometry.location.lng;
        }else{
          address.biz_lat   = $scope.latitude;
          address.biz_long  = $scope.longitude;
        }
        console.log(biz_zipcode)
        address.biz_address = place.formatted_address;
        address.biz_city    = city;
        address.biz_state   = state;
        address.biz_country = country;
        address.biz_zipcode = biz_zipcode;        
        address.biz_owner   = $scope.userData.session_id;    
        
        /*
        formatted_address   = userLocationData.results[0].formatted_address;
        var addressArray    = formatted_address.split(",");
        address.biz_country = addressArray[addressArray.length-1].trim();
        */
        
        $scope.saveAddrLastStep(address);
    });
    

    $scope.saveAddrLastStep = function(address){
      AddressService.addAddress(address).success(function(data){
          
          console.log(data);

          $ionicLoading.hide();        
          
          if (data.code == 200) {
            var alertPopup = $ionicPopup.alert({
                title:    'Address Added Successfully!',
                template: 'Your Address has been added Successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

            /*            
            $scope.TempDeal = {};
            $scope.TempDeal = $scope.deal;
            $scope.TempDeal.bizAddrSelect = 'select';
            $scope.TempDeal.bizAddrId     = data.data._id;
            $scope.deal     = $scope.TempDeal;
            */

            var pushBizAddr = {
              _id : data.data._id,
              biz_address : address.biz_address
            };
            if ($scope.businessAddress.length == 0) {
              $scope.businessAddress = []
            };
            $scope.businessAddress.push(pushBizAddr);
            $scope.deal.bizAddrSelect = 'select';
            $scope.deal.bizAddrId     = data.data._id;

          } else {
            var alertPopup = $ionicPopup.alert({
                title:    'Failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          }
      });
    }
  };

  // GET DEAL DETAIL WHILE CLONING THAT DEAL

  if ($stateParams.dealId) {
    DealService.findDealById($stateParams.dealId).then(function(deal) {

      $scope.deal              = deal.data.data;
      $scope.deal.dealCat       = $scope.deal.deal_category._id;
      $scope.deal.from_date     = new Date($scope.deal.deal_from);

      var onlydate = new Date($scope.deal.deal_from);

      var month = onlydate.getMonth()+1;
      var day   = onlydate.getDate();
      var year  = onlydate.getFullYear();

      var onlytime = new Date($scope.deal.deal_from);
     
      var hour = onlytime.getHours();
      if (hour < 10)
          hour = "0"+hour;

      var min = onlytime.getMinutes();
      if (min < 10)
          min = "0"+min;

      var sec = onlytime.getSeconds();
      if (sec < 10)
          sec = "0"+sec;


     
      deal.from = month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;
       console.log("from")
      console.log(deal.from)

      //$scope.deal.from_date=deal.from;


 //console.log(deal.data.data.from_date)

      //console.log("1")
      //console.log( $scope.deal.from_date)
      
      if ($scope.deal.deal_location_type == 'local') {
      $scope.deal.bizAddrSelect = 'select';
      }        
      ////////////////////////////////////////////////////////////////
      // $scope.deal.from_time = $scope.deal.from_date;
      ///////////////////////////////////////////////////////////////
      
      $scope.deal.to_date   = new Date($scope.deal.deal_to);
      //console.log($scope.deal.deal_to)
      $scope.deal.to_time   = $scope.deal.to_date;


      var end_date2 = new Date($scope.deal.to_time);

      var month = end_date2.getMonth()+1;
      var day   = end_date2.getDate();
      var year  = end_date2.getFullYear();




      var end_time2 = new Date($scope.deal.to_time);

      var hour = end_time2.getHours();
      //console.log($scope.bill_hour)

     // var calucateHour=end_time2.getHours()-onlytime.getHours();
     
      //var getFinalHour=$scope.bill_hour-calucateHour;
      
      var actaulhour = onlytime.getHours();

       if (actaulhour < 10)
           actaulhour = "0"+hour;

       $scope.deal.frdate = month+'/'+day+'/'+year+' '+actaulhour+':'+min+':'+sec;  
       console.log("frdatre")
       console.log($scope.deal.frdate)

      if (hour < 10)
          hour = "0"+hour;

      var min = end_time2.getMinutes();
      if (min < 10)
          min = "0"+min;

      var sec = end_time2.getSeconds();
      if (sec < 10)
          sec = "0"+sec;

    //  $scope.deal.to_time = month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;

      

      
      ///////////////////////////////////////////////////////////////
      
      //$scope.deal.to_hours     = {'salevalue':$scope.deal.salevalue,'hour':$scope.deal.deal_to};

      $scope.bill_credit       = Number($scope.deal.deal_salevalue);
      $scope.bill_hour         = Number($scope.deal.deal_hour);
      $scope.bill_notify       = Number($scope.deal.notify_hours);
      $scope.bill_active       = $scope.bill_hour - $scope.bill_notify;
     
      var today_date = new Date();
      if (today_date > $scope.deal.to_date || today_date > $scope.deal.from_date) {
        var alert = $ionicPopup.show({
        title: 'Dates selection validation',
        subTitle: 'Start/End Date Time of this deal has been passed , Please fill the Deal Duration again .',
        scope: $scope,
        buttons: [
          { 
            text: 'OK',
            type: 'pink-white-theme-color'
           
          }
        ]
        });
        $scope.deal.to_hours  = "";
        $scope.bill_credit    = "";
        $scope.bill_hour      = "";
        $scope.bill_notify    = "";
        $scope.bill_active    = "";
        $scope.deal.to_date   = "";
        $scope.deal.from_date = "";
        $scope.deal.to_time   = "";
        $scope.deal.from_time = "";
        
      }
      document.getElementById('keyword_1_value').value = $scope.deal.deal_keyword;
      document.getElementById('keyword_2_value').value = $scope.deal.deal_keyword_2;
      document.getElementById('keyword_3_value').value = $scope.deal.deal_keyword_3;

      $scope.deal.to_hours = '{"salevalue":'+$scope.deal.deal_salevalue+',"hour":'+$scope.deal.deal_hour+'}';
      $scope.deal.bizAddrId = $scope.deal.biz_address_id[0]
      /*
      $scope.deal         = deal.data.data;
      $scope.dealId       = $stateParams.dealId;
      $scope.deal.dealCat = $scope.deal.deal_category._id;
      $scope.deal.deal_keyword = $scope.deal.deal_keyword;
      $scope.deal.from_date    = new Date($scope.deal.deal_from);
      $scope.deal.to_date      = new Date($scope.deal.deal_to);
      
      //$scope.deal.to_hours     = {salvalue:$scope.deal.salevalue,hour:$scope.deal.deal_to};
      document.getElementById('keyword_1_value').value = $scope.deal.deal_keyword;
      document.getElementById('keyword_2_value').value = $scope.deal.deal_keyword_2;
      document.getElementById('keyword_3_value').value = $scope.deal.deal_keyword_3;
      if ($scope.deal.deal_location_type == 'local') {
      $scope.deal.bizAddrSelect = 'select';
      //$scope.deal.newBizAddr    = $scope.deal.biz_address_id[0];
      }*/
      console.log($scope.deal);
    });
  };
  
  // FOR UNPUBLISHED DEALS START 
  if($rootScope.tempDealData){

    $scope.deal5               = $rootScope.tempDealData;

    DealService.findDealById($scope.deal5._id).then(function(deal) {

      console.log(deal);

      $scope.deal              = deal.data.data;
      $scope.deal.dealCat       = $scope.deal.deal_category._id;
      $scope.deal.from_date     = new Date($scope.deal.deal_from);
      
      if ($scope.deal.deal_location_type == 'local') {
      $scope.deal.bizAddrSelect = 'select';
      }        
      ////////////////////////////////////////////////////////////////
      // $scope.deal.from_time = $scope.deal.from_date;
      ///////////////////////////////////////////////////////////////
      
      $scope.deal.to_date   = new Date($scope.deal.deal_to);
      // $scope.deal.to_time   = $scope.deal.to_date;
      
      ///////////////////////////////////////////////////////////////
      
      //$scope.deal.to_hours     = {'salevalue':$scope.deal.salevalue,'hour':$scope.deal.deal_to};
          
      $scope.bill_credit       = Number($scope.deal.deal_salevalue);
      $scope.bill_hour         = Number($scope.deal.deal_hour);
      $scope.bill_notify       = Number($scope.deal.notify_hours);
      $scope.bill_active       = $scope.bill_hour - $scope.bill_notify;
     
      var today_date = new Date();
      if (today_date > $scope.deal.to_date || today_date > $scope.deal.from_date) {
        var alert = $ionicPopup.show({
        title: 'Dates selection validation',
        subTitle: 'Start/End Date Time of this deal has been passed , Please fill the Deal Duration again .',
        scope: $scope,
        buttons: [
          { 
            text: 'OK',
            type: 'pink-white-theme-color'
           
          }
        ]
        });
        $scope.deal.to_hours  = "";
        $scope.bill_credit    = "";
        $scope.bill_hour      = "";
        $scope.bill_notify    = "";
        $scope.bill_active    = "";
        $scope.deal.to_date   = "";
        $scope.deal.from_date = "";
        $scope.deal.to_time   = "";
        $scope.deal.from_time = "";
        
      }
      document.getElementById('keyword_1_value').value = $scope.deal.deal_keyword;
      document.getElementById('keyword_2_value').value = $scope.deal.deal_keyword_2;
      document.getElementById('keyword_3_value').value = $scope.deal.deal_keyword_3;

      $scope.deal.to_hours = '{"salevalue":'+$scope.deal.deal_salevalue+',"hour":'+$scope.deal.deal_hour+'}';
      $scope.deal.bizAddrId = $scope.deal.biz_address_id[0]
      console.log($scope.deal);
      
        
    });
    // console.log($scope.deal);
  }
  // FOR UNPUBLISHED DEALS END

})
.controller('CreateDealByCloneCtrl', function($scope, $rootScope, $state, $stateParams, $cordovaGeolocation, DealService, LocationService, CreditsService, $ionicPopup, $location, $ionicLoading) {

  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;
  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;
  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  $scope.userData = JSON.parse(window.localStorage['userData']);
  DealService.findMyDeals($scope.userData.session_id).then(function (deals) {
    $scope.mydeals = deals.data.data;
    $ionicLoading.hide();
  });


  /************ CLONE THE DEAL ***********/

  $scope.clone = function(deal_id){
    $location.path( "app/clone-deal/"+deal_id );      
  };

  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

})
.controller('DealDetailCtrl', function($scope, $rootScope, $state, $stateParams, DealService, $ionicModal, $ionicPopup, $cordovaSocialSharing, $ionicLoading, SharingService, $timeout, $sce, AddressService, $cordovaGeolocation) {
       
    $scope.$on('$ionicView.loaded', function(){
      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
    });

    $scope.$on('$ionicView.enter', function(){      
      $timeout(function () {
        $ionicLoading.hide();
      }, 2000);
    });

    $scope.formatNumber = function(i) {
    return Math.round(i * 100)/100; 
        }

    if (localStorage.getItem("userData") === null) {      
      $state.go('landing');
    }else{
      $scope.userData = JSON.parse(window.localStorage['userData']);
      $scope.session_id = $scope.userData.session_id;      
      console.log($scope.userData);
      // console.log($scope.userData.profiledata.email);
    }

    $scope.dealImagePath  = DEAL_IMAGE;
    $scope.dealIconPath   = DEAL_ICON;
    $scope.profilePicPath = PROFILE_PIC;

    DealService.findDealById($stateParams.dealId, $scope.userData.session_id).then(function(deal) {
        $scope.deal           = deal.data.data;
        $scope.dealCountData  = deal.data.views;
        console.log("DealDetail")
        console.log($scope.deal);

        if($scope.dealCountData.performance){
          $scope.ratePerformance = {}
          $scope.ratePerformance.rating = $scope.dealCountData.performance.grade
          $scope.ratePerformance.comment = $scope.dealCountData.performance.comment  
        }        

        $scope.dealId         = $stateParams.dealId;

        $scope.deal.from_date = new Date(deal.data.data.deal_from);
        if ($scope.deal.from_date.getHours() <=12 ) {
          $scope.deal_from_time = $scope.deal.from_date.getHours() +':'+ $scope.deal.from_date.getMinutes() +' AM';
        }else{
          $scope.deal_from_time = $scope.deal.from_date.getHours() +':'+ $scope.deal.from_date.getMinutes() +' PM';
        }

        $scope.deal.to_date = new Date(deal.data.data.deal_to);
        if ($scope.deal.to_date.getHours() <=12 ) {
          $scope.deal_to_time = $scope.deal.to_date.getHours() +':'+ $scope.deal.to_date.getMinutes() +' AM';
        }else{
          $scope.deal_to_time = $scope.deal.to_date.getHours() +':'+ $scope.deal.to_date.getMinutes() +' PM';
        }
        
        console.log($scope.deal.biz_address_id[0]);

        // getSingleBusinessAddress
        AddressService.getSingleBusinessAddress($scope.deal.biz_address_id[0]).then(function (address) {

            $scope.businessAddress = address.data.data;


          $cordovaGeolocation
            .getCurrentPosition(POS_OPTIONS)
            .then(function (position) {

              // DISTANCE BETWEEN TWO LOCATION

              lat1 = position.coords.latitude;
              lon1 = position.coords.longitude;
              lat2 = $scope.businessAddress[0].biz_lat;
              lon2 = $scope.businessAddress[0].biz_long;

              var R = 6371; // Radius of the earth in km
              var dLat = deg2rad(lat2-lat1);  // deg2rad below
              var dLon = deg2rad(lon2-lon1); 
              var a = 
                Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
                Math.sin(dLon/2) * Math.sin(dLon/2)
                ; 
              var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
              var d = R * c; // Distance in km
              $scope.distanceFromHere = d;
              console.log('d',d)

              function deg2rad(deg) {
                return deg * (Math.PI/180)
              }
    

              // MAP ON SINGLE DEAL AND ROUTING

              var directionsDisplay;
              var directionsService = new google.maps.DirectionsService();
              var map;

              // console.log($scope.businessAddress[0])

              $scope.biz_address = $scope.businessAddress[0].biz_address;
              directionsDisplay = new google.maps.DirectionsRenderer();
              var myCenter=new google.maps.LatLng($scope.businessAddress[0].biz_lat,$scope.businessAddress[0].biz_long);
              var mapProp = {
                center: myCenter,
                zoom:5,
                mapTypeId: google.maps.MapTypeId.ROADMAP
              };

              map = new google.maps.Map(document.getElementById("googleMap"),mapProp);
              directionsDisplay.setMap(map);
              google.maps.event.addDomListener(document.getElementById('routebtn'), 'click', calcRoute);
              var marker = new google.maps.Marker({
                position: myCenter,
                title:'Click to zoom'
              });

              marker.setMap(map);

              google.maps.event.addListener(marker,'click',function() {
                map.setZoom(14);
                calcRoute();
                // map.setCenter(marker.getPosition());
              });

              function calcRoute() {
                var start = new google.maps.LatLng($scope.businessAddress[0].biz_lat,$scope.businessAddress[0].biz_long);
                //var end = new google.maps.LatLng(38.334818, -181.884886);
                var end = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);
                var request = {
                  origin: start,
                  destination: end,
                  travelMode: google.maps.TravelMode.DRIVING
                };
                directionsService.route(request, function(response, status) {
                  if (status == google.maps.DirectionsStatus.OK) {
                    directionsDisplay.setDirections(response);
                    directionsDisplay.setMap(map);
                  } else {
                    alert("Directions Request from " + start.toUrlValue(6) + " to " + end.toUrlValue(6) + " failed: " + status);
                  }
                });
              }

            })

        });

       

    });
    DealService.getDealRating($stateParams.dealId).then(function(rating) {
        $scope.dealRating   = rating.data;
        if($scope.dealRating.data.length <= 0 ){
          $scope.ratedstars = 0;
        }else{
          $scope.ratedstars = $scope.dealRating.data[0].avgRating;
        }
        $scope.maxrating = 5;        
        $scope.unratedstars = $scope.maxrating - $scope.ratedstars;
    });
    DealService.getDealReviews($stateParams.dealId).then(function(reviews) {
        $scope.dealReviews   = reviews.data.data;
        $scope.reviewsCount  = reviews.data.data.length;      
    });
    SharingService.getShares($stateParams.dealId).then(function(shares) {
        $scope.dealShares   = shares.data.data;
        $scope.sharesCount  = shares.data.data.length;
    });


    /* RATING SCOPES STARTS */

    // $scope.rating = 4;
    $scope.data = {
      rating : 1,
      max: 5
    }

    // Create the rating modal 
    $ionicModal.fromTemplateUrl('templates/deals/rate.html', {
      id: '1', 
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.oModal1 = modal;
    });

    // Create the reviews modal
    $ionicModal.fromTemplateUrl('templates/deals/review.html', {
      id: '2', 
      scope: $scope,
      backdropClickToClose: false,
      animation: 'slide-in-up'
    }).then(function(modal) {
      $scope.oModal2 = modal;
    });

    // Triggered in the rating modal to close it
    $scope.closeLogin = function(index) {
      if (index == 1) $scope.oModal1.hide();
      else $scope.oModal2.hide();
    };

    // Open the rating modal
    $scope.rate = function(index) {
      if (index == 1) $scope.oModal1.show();
      else $scope.oModal2.show();
    };

    $scope.$on('modal.shown', function(event, modal) {
      console.log('Modal ' + modal.id + ' is shown!');
    });

    $scope.$on('modal.hidden', function(event, modal) {
      console.log('Modal ' + modal.id + ' is hidden!');
    });

    //Cleanup the modal when we're done with it!
    $scope.$on('$destroy', function() {
      console.log('Destroying modals...');
      $scope.oModal1.remove();
      $scope.oModal2.remove();
    });

    // Execute action on hide modal
    $scope.$on('modal.hidden', function() {
      // Execute action
    });

    // Execute action on remove modal
    $scope.$on('modal.removed', function() {
      // Execute action
    });

    /************ FLAG THE DEAL ***********/

    $scope.flag = function(deal_id){

      DealService.flagDeal(deal_id, $scope.deal.deal_owner._id, $scope.session_id).success(function(data){
        
        console.log(data);
        
        if (data.code == 200) {

          var alertPopup = $ionicPopup.alert({
              title:    'Flagged Successfully!',
              template: 'This deal has been Flagged successfully.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });

          // $state.go('app.deals');

        } else {

          var alertPopup = $ionicPopup.alert({
              title:    'Anonymously failed!',
              template: 'Oop\'s! it seems like something went wrong.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });
        }

      });      
    };

  
    /************ SHARING DEAL ON SINGLE DEAL PAGE ***********/

    $scope.share = function(dealId, message, subject, file, link){

      $cordovaSocialSharing
      .share(message, subject, file, link) // Share via native share sheet
      .then(function(result) {
        /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/

        SharingService.addShare($scope.dealId, $scope.session_id, $scope.deal.deal_owner._id, 'all');
        $scope.sharesCount +=1;
        $scope.modal.hide();
        
      }, function(err) {
        var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'Sorry for the interuption but their is no sharable app in your device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
    };


    /************ SUBMIT REVIEW ON SINGLE DEAL PAGE ***********/

    $scope.submitReview = function(reviews){
      reviews.reviewby    = $scope.session_id ;
      reviews.deal_id     = $scope.dealId ;
      reviews.deal_owner  = $scope.deal.deal_owner._id ;
      DealService.postReviewsOnDeal(reviews).success(function(data){
        
        // console.log(data);

        $ionicLoading.hide();
        
        if (data.code == 200) {

          var alertPopup = $ionicPopup.alert({
              title:    'Review Posted Successfully!',
              template: 'Your review has been posted successfully. You may now check it in your My Reviews section.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });

          $scope.review = '';
          var pushDealReview = {
            reviewby : {
                        "photo": $scope.userData.profiledata.photo,
                        "first_name": $scope.userData.profiledata.first_name,
                        "last_name": $scope.userData.profiledata.last_name
                      },
            review : reviews.review

          };
          $scope.dealReviews.push(pushDealReview);
          $scope.reviewsCount +=1;
        } else {

          var alertPopup = $ionicPopup.alert({
              title:    'Anonymously failed!',
              template: 'Oop\'s! it seems like something went wrong.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });
        }

        $scope.oModal1.hide();

      });
    };


    /************ SUBMIT DEAL RATING PERFORMANCEE ***********/

    $scope.submitDealRatingPerformance = function(ratePerformance){

      ratePerformance.user       = $scope.session_id ;
      ratePerformance.deal_id    = $stateParams.dealId ;
      ratePerformance.deal_owner = $scope.deal.deal_owner._id ;
      ratePerformance.deal_name  = $scope.deal.deal_name ;
      ratePerformance.email      = $scope.userData.profiledata.email ;

        DealService.postRatingDealPerformance(ratePerformance).success(function(data){
          
          console.log(data);

          $ionicLoading.hide();
          $rootScope.$broadcast('getTotalCount', true);
          
          if (data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    'Deal PerformanceRated Successfully!',
                template: 'Your rating has been posted successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

          } else {

            var alertPopup = $ionicPopup.alert({
                title:    'Anonymously failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          }

        });

    };  

    /************ POSTING RATING ON SINGLE DEAL PAGE ***********/

    $scope.postRating = function(){
      var rating = {};
      rating.ratedby    = $scope.session_id ;
      rating.deal_id    = $scope.dealId ;
      rating.deal_owner = $scope.deal.deal_owner._id ;
      DealService.getDynamicRating().then(function (value) {
        rating.rating = value;
        // $scope.newRating = console.log('New rating valuekey: "value",  '+value);
        DealService.postRatingOnDeal(rating).success(function(data){
          
          console.log(data);

          $ionicLoading.hide();
          
          if (data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    'Rated Successfully!',
                template: 'Your rating has been posted successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

            // $state.go('app.deals');

          } else {

            var alertPopup = $ionicPopup.alert({
                title:    'Anonymously failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          }

          $scope.closeLogin(1);

        });
      });
    };  
   
    /********** OPEN LINK **************/

    $scope.openLink = function(link) {
      window.open(link, '_system', 'location=yes'); 
      return false;
    }

    $scope.trustSrc = function(src) {
      return $sce.trustAsResourceUrl(src);
    }

    /************ CHANGE DEAL STATUS DEAL ***********/

    $scope.publishDeal = function () {
      $rootScope.tempDealData = $scope.deal;
      $rootScope.unpublishedDealId = $scope.deal._id;
      // console.log($rootScope.unpublishedDealId)
      $state.go('app.createDeal')
    }

    $scope.changeDealStatus = function (id, deal_publish, publish_text) {

      DealService.publishUnpublishDeal(deal_publish, id, $scope.userData.session_id).then(function (data) {
        // console.log(data.data);
          if (data.data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    publish_text+' Successfully!',
                template: 'Your deal has been '+publish_text+' successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

            $state.go($state.current, {}, {reload: true});

          } else {

            var alertPopup = $ionicPopup.alert({
                title:    'Anonymously failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          }

      });
    };

})
.controller('EditDealCtrl', function($scope, $state, $rootScope, $stateParams, $ionicLoading, $ionicPopup, $timeout, DealService, CreditsService) {
       
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    $scope.showEdit = $rootScope.showEdit;
    $scope.countries = COUNTRIES;
    $scope.dealImagePath  = DEAL_IMAGE;
    $scope.dealIconPath   = DEAL_ICON;
    $scope.profilePicPath = PROFILE_PIC;
    $scope.userData = JSON.parse(window.localStorage['userData']);
    $scope.session_id = $scope.userData.session_id;

    DealService.findAllDealCategories().then(function (categories) {
      $scope.dealMenuCategories = categories.data.data;    
      $ionicLoading.hide();
    });

    DealService.findAllBusinessAddr($scope.userData.session_id).then(function (address) {
      $scope.businessAddress = address.data.data;    
      $ionicLoading.hide();
    });

    DealService.hourValues().then(function (data) {
      $scope.hourValues = data.data.data;    
      $ionicLoading.hide();
    });

    CreditsService.getCredits($scope.userData.session_id).then(function (credits) {
      $scope.credits = credits.data.data[0];

      $scope.hourdataArray = $scope.credits;

    //console.log($scope.hourdataArray);
   

    //console.log($scope.hourdataArray.credit_balance)

    //console.log($scope.hourdataArray.credit_bought)

    $scope.hourValuesArray = []; 

     for(var i=1 ;i<=100;i++){
     $scope.hourValuesArray[i] = {
            salevalue:(parseInt($scope.hourdataArray.credit_bought)*i)/$scope.hourdataArray.credit_balance ,
            hour: i
         }
     }
      var creditsAlert = $ionicPopup.show({
          template: '',
          title: 'Current Hours',
          subTitle: 'You have <strong>'+$scope.credits.credit_remain_amount+'</strong> Hours in your account.',
          scope: $scope,
          buttons: [
            {
              text: 'OK',
              type: 'pink-white-theme-color',
              onTap: function(e) {
                
                $timeout(function () {
                  if ($scope.credits.credit_remain_amount <='2' ) {
                    var buyCredits = $ionicPopup.show({
                        template: '',
                        title: 'Low Hours',
                        subTitle: 'Your hours are critically low to create a Deal. You have to buy more hours.',
                        scope: $scope,
                        buttons: [
                          {
                            text: 'Buy Hours',
                            type: 'pink-white-theme-color',
                            onTap: function(e) {
                              $location.path('app/credits')
                            }
                          },
                          {
                            text: 'Cancel',
                            onTap: function(e) {
                              console.log('Ok')
                            }
                          }
                        ]
                    });
                  };
                }, 3000);
              }
            }
          ]
      });
    });

    if($rootScope.tempDealData){
      $scope.deal = $rootScope.tempDealData;
    } 

    DealService.findDealById($stateParams.dealId).then(function(deal) {
      console.log(deal.data.data)
        $scope.deal   = deal.data.data;
        $scope.dealId = $stateParams.dealId;
        $scope.deal.from_date = new Date(deal.data.data.deal_from);
        $scope.deal.from_time = new Date(deal.data.data.deal_from);
        $scope.deal.to_date = new Date(deal.data.data.deal_to);
        $scope.deal.to_time = new Date(deal.data.data.deal_to);
        $scope.deal.bizAddrId = deal.data.data.biz_address_id[0];
        // $scope.deal.to_hours  = deal.data.data.deal_hour;
        $scope.deal.dealCat   = deal.data.data.deal_category._id;

        $scope.bill_credit   = Number($scope.deal.deal_salevalue);
        $scope.bill_hour     = Number($scope.deal.deal_hour);
        $scope.bill_notify   = Number($scope.deal.notify_hours);
        $scope.bill_active   = $scope.bill_hour - $scope.bill_notify;
       
        var today_date = new Date();
        if (today_date > $scope.deal.to_date || today_date > $scope.deal.from_date) {
          var alert = $ionicPopup.show({
          title: 'Dates selection validation',
          subTitle: 'Start/End Date Time of this deal has been passed , Please fill the Deal Duration again .',
          scope: $scope,
          buttons: [
            { 
              text: 'OK',
              type: 'pink-white-theme-color'
             
            }
          ]
          });
          $scope.deal.to_hours  = "";
          $scope.bill_credit    = "";
          $scope.bill_hour      = "";
          $scope.bill_notify    = "";
          $scope.bill_active    = "";
          $scope.deal.to_date   = "";
          $scope.deal.from_date = "";
          $scope.deal.to_time   = "";
          $scope.deal.from_time = "";
          
        }
        $scope.deal.to_hours = '{"salevalue":'+$scope.deal.deal_salevalue+',"hour":'+$scope.deal.deal_hour+'}';
        // $scope.deal.bizAddrId = $scope.deal.biz_address_id[0]
        document.getElementById('keyword_1_value').value = deal.data.data.deal_keyword;
        document.getElementById('keyword_2_value').value = deal.data.data.deal_keyword_2;
        document.getElementById('keyword_3_value').value = deal.data.data.deal_keyword_3;
        $ionicLoading.hide(); 
    });



    $scope.editDeal = function(deal) {
    
      console.log(deal);

      $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });
      
      $scope.userData = JSON.parse(window.localStorage['userData']);
      
      if ( deal.newBizAddr == undefined) { deal.newBizAddr = '' };
      if ( deal.bizAddrId  == undefined) { deal.bizAddrId ='' };
      if ( deal.favourite  == undefined) { deal.favourite ='0' };    
      if ( deal.deal_price == undefined) { deal.deal_price ='' };      
      if ( deal.deal_location_type == undefined) { deal.deal_location_type ='' };
      if ( typeof deal.deal_keyword   == 'undefined' || typeof deal.deal_keyword   == 'object' ) { deal.deal_keyword   = document.getElementById('keyword_1_value').value; }else{deal.deal_keyword   = ''};
      if ( typeof deal.deal_keyword_2 == 'undefined' || typeof deal.deal_keyword_2 == 'object' ) { deal.deal_keyword_2 = document.getElementById('keyword_2_value').value; }else{deal.deal_keyword_2 = ''};
      if ( typeof deal.deal_keyword_3 == 'undefined' || typeof deal.deal_keyword_3 == 'object' ) { deal.deal_keyword_3 = document.getElementById('keyword_3_value').value; }else{deal.deal_keyword_3 = ''};
      if ( deal.favourite  == true) { deal.favourite ='1' };
      if ( deal.deal_video) {video_arr = deal.deal_video.split("=");deal.deal_video = 'http://www.youtube.com/embed/'+video_arr[1];}else{deal.deal_video = '';};
      deal.deal_zipcode = 0;
      deal.id = $stateParams.dealId;

      deal.dealImageData = $scope.dealImageData;
      deal.dealIconData  = $scope.dealIconData;
      deal.dealOwner     = $scope.userData.session_id;
      deal.deal_lat       = '';
      deal.deal_long      = '';
      // deal.deal_country   = '';
      deal.deal_continent = '';

      // Getting location of deal's Business Address

      if(deal.newBizAddr != ''){
        var promise = AddressService.getLatLongByLocation(deal.newBizAddr);
        promise.then(function(payload) {

            var userLocationData  = payload.data;
            if(userLocationData.results.length > 0){

              deal.deal_lat       = userLocationData.results[0].geometry.location.lat;
              deal.deal_long      = userLocationData.results[0].geometry.location.lng;

              formatted_address   = userLocationData.results[0].formatted_address;
              addressArray        = formatted_address.split(",");
              // deal.deal_country   = addressArray[addressArray.length-1].trim();
              address_components  = userLocationData.results[0].address_components; 
              deal.deal_continent = CONTINENTS[address_components[address_components.length-2].short_name];
              
            }
            
            $scope.createDealLastStep(deal);
        });
      }else{
        $scope.createDealLastStep(deal);
      }    
    }

    // HITTING CREATE DEAL SERVICE

    $scope.createDealLastStep = function(deal) {

      console.log(deal);

      DealService.editDeal(deal).success(function(data){
          
          console.log(data);

          $ionicLoading.hide();
          
          if (data.code == 200) {

              var alertPopup = $ionicPopup.alert({
                  title:    'Deal Edited Successfully!',
                  template: 'Your deal has been Successfully edited. You may now check it in your My Deals section.',
                  buttons:[
                    {
                      text: '<b>Ok</b>',
                      type: 'pink-white-theme-color'
                    }
                  ]
              });

              $state.go('app.myPublishedDeals');

          } else if(data.code == 101){

              var alertPopup = $ionicPopup.alert({
                  title:    'Anonymously failed!',
                  template: 'Oop\'s! it seems like something went wrong.',
                  buttons:[
                    {
                      text: '<b>Ok</b>',
                      type: 'pink-white-theme-color'
                    }
                  ]
              });

          } else {

              var alertPopup = $ionicPopup.alert({
                  title:    'Anonymously failed!',
                  template: 'Oop\'s! it seems like something went wrong.',
                  buttons:[
                    {
                      text: '<b>Ok</b>',
                      type: 'pink-white-theme-color'
                    }
                  ]
              });

          }    

      });
    }

    /* GALLERY AND CAMERA OPTIONS FOR DEAL IMAGE UPLOAD */

    $scope.takePic = function() {
        var options =   {
            quality: 50,
            destinationType: Camera.DestinationType.DATA_URL,
            sourceType: 0,      // 0:Photo Library, 1=Camera, 2=Saved Photo Album
            encodingType: 0     // 0=JPG 1=PNG
        }
        navigator.camera.getPicture($scope.onSuccess,$scope.onFail,options);
    }
    $scope.onSuccess = function(DATA_URL) {
      
        // $scope.dealImageData = "data:image/jpeg;base64," + DATA_URL;
        $scope.dealImageData = DATA_URL;
        var image = document.getElementById('dealImage');
        image.src = "data:image/jpeg;base64," + DATA_URL;
        image.style.display = "block";
        document.getElementById('padding-picture').style.display = "block";    
        // document.getElementById('uploadDealImageButton').style.display = "none";
    };
    $scope.onFail = function(e) {
      console.log("On fail " + e);
    }

    $scope.getBill = function(deal){


        if(!deal.from_time && !deal.from_time){
          var alert = $ionicPopup.show({
            template: '',
            title: 'Timings Error!',
            subTitle: 'Please select complete deal durations first.',
            scope: $scope,
            buttons: [
              { 
                text: 'OK',
                type: 'pink-white-theme-color'
               
              }
            ]
          });
          $scope.deal.to_hours = '';
          return;
        }

        
        // Deal Duration Time Manipulation
        if (deal.from_date == "" || deal.from_time == "" || deal.to_date == "" || deal.to_time == "") {
          var alert = $ionicPopup.show({
          template: '',
          title: 'Dates Duration',
          subTitle: 'Please select Deal Date Timings first',
          scope: $scope,
          buttons: [
            { 
              text: 'OK',
              type: 'pink-white-theme-color'
             
            }
          ]
          });
          $scope.deal.to_hours = "";
        }
        else
        {
        
        var onlydate = new Date(deal.from_date);

        var month = onlydate.getMonth()+1;
        var day   = onlydate.getDate();
        var year  = onlydate.getFullYear();

        var onlytime = new Date(deal.from_time);

        var hour = onlytime.getHours();
        if (hour < 10)
            hour = "0"+hour;

        var min = onlytime.getMinutes();
        if (min < 10)
            min = "0"+min;

        var sec = onlytime.getSeconds();
        if (sec < 10)
            sec = "0"+sec;

        deal.from = month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;
        
        ///////////////  Deal end time start///////////////////////////////////////////
        
        var end_date2 = new Date(deal.to_date);

        var month = end_date2.getMonth()+1;
        var day   = end_date2.getDate();
        var year  = end_date2.getFullYear();

        var end_time2 = new Date(deal.to_time);

        var hour = end_time2.getHours();
        if (hour < 10)
            hour = "0"+hour;

        var min = end_time2.getMinutes();
        if (min < 10)
            min = "0"+min;

        var sec = end_time2.getSeconds();
        if (sec < 10)
            sec = "0"+sec;

        deal.to =month+'/'+day+'/'+year+' '+hour+':'+min+':'+sec;
        
        
        var newToDateObj = new Date(deal.to);
        
        
        /////////////// Deal end time end ///////////////////////////////////////
        
        var from_date_obj = new Date(deal.from);
        if (from_date_obj > newToDateObj)
        {
          //////////////////////////////////////////////////////////////////////////////////
          var alert = $ionicPopup.show({
          title: 'Dates selection validation',
          subTitle: 'Start Date Time should be less than End Date Time',
          scope: $scope,
          buttons: [
            { 
              text: 'OK',
              type: 'pink-white-theme-color'
             
            }
          ]
          });
          //////////////////////////////////////////////////////////////////////////////////
        }else{
              deal.active_hours = Math.round(newToDateObj - from_date_obj) / 36e5;
              if (Number(JSON.parse(deal.to_hours).hour) >= deal.active_hours)
              {
                var notify_time = Number(JSON.parse(deal.to_hours).hour) - deal.active_hours; 
                from_date_obj.setHours(from_date_obj.getHours() - notify_time);
                
                var month = from_date_obj.getMonth()+1;
                var day   = from_date_obj.getDate();
                var year  = from_date_obj.getFullYear();
                var hour  = from_date_obj.getHours();
                if (hour < 10)
                    hour  = "0"+hour;
            
                var min   = from_date_obj.getMinutes();
                if (min < 10)
                    min   = "0"+min;
            
                var sec   = from_date_obj.getSeconds();
                if (sec < 10)
                    sec   = "0"+sec;
            
                deal.notify_date_time   = year+'-'+month+'-'+day+' '+hour+':'+min+':'+sec;
                deal.notify_hour        = notify_time;
                
                $scope.bill_credit = Math.round((Number(JSON.parse(deal.to_hours).salevalue))* 10)/10;
                $scope.bill_hour   = Math.round((Number(JSON.parse(deal.to_hours).hour))* 10)/10;
                $scope.bill_notify = Math.round((Number(notify_time))* 10)/10;
                $scope.bill_active = $scope.bill_hour - $scope.bill_notify;
                console.log($scope.bill_notify+' '+$scope.bill_active)
                          
                return true;
              }
              else
              {
                var alert = $ionicPopup.show({
                template: '',
                title: 'Dates Duration',
                subTitle: 'Deal Duration should be minimum '+Math.ceil(deal.active_hours) + ' Hour',
                scope: $scope,
                buttons: [
                  { 
                    text: 'OK',
                    type: 'pink-white-theme-color'
                   
                  }
                ]
                });
                $scope.deal.to_hours = "";
                $scope.bill_credit = "";
                $scope.bill_hour   = "";
                $scope.bill_notify = "";
                $scope.bill_active = "";
              
              } 
          
        }
      }
    }

})
.controller('CatDealsCtrl', function($scope, $location, $stateParams, DealService, LocationService, $cordovaGeolocation, $ionicLoading, $ionicPopover, $ionicPopup, $state, AddressService) {

  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;
  $scope.catId    = $stateParams.catId;
  $scope.catName  = $stateParams.catName;
  $scope.filter ={}
  var date = new Date();
  

  if (localStorage.getItem("userData") === null) {
    $state.go('landing');
  }else{
    $scope.userData = JSON.parse(window.localStorage['userData']);
    $scope.session_id = $scope.userData.session_id;
  }
 
  // console.log($stateParams.sortType);
  if(typeof window.localStorage['user_range'] != 'undefined'){    
    var range = window.localStorage['user_range'];
    $scope.filter.range = Number(window.localStorage['user_range']);
  }else{
    var range = '';
  }
  if(typeof window.localStorage['deal_keyword'] != 'undefined'){    
    var deal_keyword = window.localStorage['deal_keyword'];
    $scope.filter.deal_keyword = window.localStorage['deal_keyword'];
  }else{
    var deal_keyword = '';
  }
  if(typeof window.localStorage['deal_search_zipcode'] != 'undefined'){    
    var deal_search_zipcode = window.localStorage['deal_search_zipcode'];
    $scope.filter.deal_search_zipcode = window.localStorage['deal_search_zipcode'];
  }else{
    var deal_search_zipcode = '';
  }

  
  if (  (
          window.localStorage['deal_search_zipcode'] != '' 
          && typeof window.localStorage['deal_search_zipcode'] != 'undefined'
        )||
        (
          window.localStorage['deal_keyword'] != '' 
          && typeof window.localStorage['deal_keyword'] != 'undefined'
        )
    ) {

    console.log(window.localStorage['deal_keyword'], window.localStorage['deal_search_zipcode'])

    if (  window.localStorage['deal_search_zipcode'] != '' 
          && typeof window.localStorage['deal_search_zipcode'] != 'undefined' 
    ){
        var type = 1;
        $cordovaGeolocation
        .getCurrentPosition(POS_OPTIONS)
        .then(function (position) {
            var promise = AddressService.getLatLongByLocation($scope.filter.deal_search_zipcode).then(function(payload) {          
                // console.log(payload)
                LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                    
                    $scope.timezone = data.data.timeZoneId;
                    console.log($scope.timezone)

                    window.localStorage['timezone']  = $scope.timezone;
                    $scope.user_range = window.localStorage['user_range'];

                    if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
                      $scope.timezone = "America/Los_Angeles"
                    };
                    if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
                      $scope.user_range = "0"
                    };

                    var userLocationData  = payload.data;
                    if(userLocationData.results.length > 0){
                      latitude       = userLocationData.results[0].geometry.location.lat;
                      longitude      = userLocationData.results[0].geometry.location.lng;
                      DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, $scope.user_range, type, $scope.timezone, $scope.catId).then(function (deals) {
                        $scope.deals = deals.data.data;
                        $scope.futuredeals = deals.data.futuredeals;
                        $ionicLoading.hide();
                      });
                    }else{
                      DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, position.coords.latitude, position.coords.longitude, $scope.user_range, type, $scope.timezone, $scope.catId).then(function (deals) {
                        $scope.deals = deals.data.data;
                        $scope.futuredeals = deals.data.futuredeals;
                        console.log($scope.deals)
                        $ionicLoading.hide();
                      });
                    }

                })

            })
          }, function(err) {
            latitude  = undefined;
            longitude = undefined;
            DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, '', type, '', $scope.catId).then(function (deals) {
              $scope.deals = deals.data.data;
              console.log($scope.deals)
              $scope.futuredeals = deals.data.futuredeals;
              $ionicLoading.hide();
            }); 
          });
    }else{
        var type = 2;
        $cordovaGeolocation
        .getCurrentPosition(POS_OPTIONS)
        .then(function (position) {
            LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                    
                $scope.timezone = data.data.timeZoneId;

                window.localStorage['timezone']  = $scope.timezone;
                $scope.user_range = window.localStorage['user_range'];

                if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
                  $scope.timezone = "America/Los_Angeles"
                };
                if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
                  $scope.user_range = "0"
                };
                DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, position.coords.latitude, position.coords.longitude, $scope.user_range, type, $scope.timezone, $scope.catId).then(function (deals) {
                  $scope.deals = deals.data.data;
                  console.log($scope.deals)
                  $scope.futuredeals = deals.data.futuredeals;
                  $ionicLoading.hide();
                });
            });
        }, function(err) {
          latitude  = undefined;
          longitude = undefined;
          DealService.findDealByKeyword($scope.filter.deal_keyword, $scope.userData.session_id, latitude, longitude, '', type, '', $scope.catId).then(function (deals) {
            $scope.deals = deals.data.data;
            console.log($scope.deals)
            $scope.futuredeals = deals.data.futuredeals;
            $ionicLoading.hide();
          }); 
        });
    }
    
    
  }else{

    $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      // window.localStorage['currentlatitude']  = position.coords.latitude;
      // window.localStorage['currentlongitude'] = position.coords.longitude;

      LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
        $scope.timezone = data.data.timeZoneId;
        console.log($scope.timezone)

        window.localStorage['timezone']  = $scope.timezone;
        $scope.user_range = window.localStorage['user_range'];

        if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
          $scope.timezone = "America/Los_Angeles"
        };
        if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
          $scope.user_range = "0"
        };

        var promise = LocationService.getLocationByLatLong(position.coords.latitude, position.coords.longitude);
          promise.then(function(payload) {

              var userLocationData  = payload.data;
              formatted_address     = userLocationData.results[1].formatted_address;
              var addressArray      = formatted_address.split(",");
              country               = addressArray[addressArray.length-1].trim();
          
            console.log(country)

        DealService.findCatDeals($scope.catId,$scope.userData.session_id,country,position.coords.latitude, position.coords.longitude, $scope.timezone, $scope.user_range).then(function (deals) {
          $scope.deals = deals.data.data;
          window.localStorage['currentcount'] = deals.data.data.length;
          $scope.futuredeals = deals.data.futuredeals;
          $scope.nationaldeals = deals.data.national;
          console.log($scope.nationaldeals)
          $ionicLoading.hide();
        });
         });
      });

    }, function(err) {
       latitude  = undefined;
      longitude = undefined;
      if (typeof $scope.timezone == 'undefined' || $scope.timezone =='') {
        $scope.timezone = "America/Los_Angeles"
      };
      if (typeof $scope.user_range == 'undefined' || $scope.user_range =='' || typeof $scope.user_range == undefined) {
        $scope.user_range = "0"
      };
      DealService.findAllDeals($scope.userData.session_id, latitude, longitude, $scope.timezone, $scope.user_range).then(function (deals) {
        $scope.deals = deals.data.data;
        $scope.futuredeals = deals.data.futuredeals;
        $ionicLoading.hide();
      }); 
      }); 

  };
  
  
  
  // DEALS FILTER POPOVER

  $ionicPopover.fromTemplateUrl('templates/deals/deal-filter-popover.html', {
    scope: $scope,
    // focusFirstInput: true
  }).then(function(popover) {
    $scope.popover = popover;    
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });


  /************** SET DEAL RANGE ***********/

  $scope.setDealRange = function(filter){
    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    console.log(filter)
    DealService.setDealRange(filter.range, $scope.userData.session_id).then(function (data) {
      console.log(data.data)
      if (data.data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    'Range Updated Successfully!',
                template: 'Your area circle range has been updated Successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });


            
            if (typeof filter.range != 'undefined'){
              window.localStorage['user_range']           = filter.range;
            }else{
              window.localStorage['user_range']           = '0';
            }
            if (typeof filter.deal_search_zipcode != 'undefined' && filter.deal_search_zipcode != ''){
              window.localStorage['deal_search_zipcode']  = filter.deal_search_zipcode;
            }else{
              window.localStorage['deal_search_zipcode']  = '';
            }
            if (typeof filter.deal_keyword != 'undefined' && filter.deal_keyword != ''){
              window.localStorage['deal_keyword']         = filter.deal_keyword;
            }else{
              window.localStorage['deal_keyword']         = '';
            }
           
           
            $state.go($state.current, {}, {reload: true});

        } else{                
            var alertPopup = $ionicPopup.alert({
                title:    'Anonymously failed!',
                template: 'Sorry for the inconvenience. Please try again later.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        }
      $ionicLoading.hide();
    }); 
  }



  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };


    /************** DEAL SHARING ***********/  

  $scope.share = function(dealId, deal_owner, shareVia, message, subject, file, link){
    
    var image = '';
    // console.log('hey ' + shareVia);
    
    if( shareVia == 'fb' ){
      
      $cordovaSocialSharing
        .shareViaFacebook(message, image, link)
        .then(function(result) {
          /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
          SharingService.addShare(dealId, $scope.session_id, deal_owner, 'facebook');
          $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Facebook app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'tw' ){
      $cordovaSocialSharing
        .shareViaTwitter(message, image, link)
        .then(function(result) {
            /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'twitter');
            $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Twitter app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'insta' ){
      
      
      window.plugins.socialsharing.shareViaInstagram(message, '',  function(){
            var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                // template: 'Your deal has been Successfully shared. '+result,
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            $scope.modal.hide();            
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'google+');
          }, function(msg) {
            var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                // template: 'No Instagram app found in this device. '+msg,
                template: 'No Instagram app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
      
      /*
      var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Instagram app found in this device. '+err,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });$scope.modal.hide();*//*
      window.plugins.socialsharing.shareVia('com.instagram.android', message, null, null, null,  function(){
            var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared. '+result,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            $scope.modal.hide();            
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'google+');
          }, function(msg) {
            var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Instagram app found in this device. '+err,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });*/
    }else if( shareVia == 'wp' ){
      $cordovaSocialSharing
        .shareViaWhatsApp(message, image, link)
        .then(function(result) {
            /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'twitter');
            $scope.modal.hide();
        }, function(err) {
          var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No WhatsApp app found in this device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          $scope.modal.hide();
        });
    }else if( shareVia == 'gp' ){
      window.plugins.socialsharing.shareVia('com.google.android.apps.plus', message, null, null, null,  function(){
            var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared. '+result,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            $scope.modal.hide();            
            SharingService.addShare(dealId, $scope.session_id, deal_owner, 'google+');
          }, function(msg) {
            var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'No Google+ app found in this device. '+err,
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
    }else if( shareVia == 'all' ){
      $cordovaSocialSharing
      .share(message, subject, file, link) // Share via native share sheet
      .then(function(result) {
        /*var alertPopup = $ionicPopup.alert({
                title:    'Deal Shared Successfully!',
                template: 'Your deal has been Successfully shared.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
        SharingService.addShare(dealId, $scope.session_id, deal_owner._id, 'all');
        $scope.modal.hide();
      }, function(err) {
        var alertPopup = $ionicPopup.alert({
                title:    'Error in sharing!',
                template: 'Sorry for the interuption but their is no sharable app in your device.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        $scope.modal.hide();
      });
    }   
  };

  /*
  DealService.findCatDeals($scope.catId, $scope.userData.session_id, ).then(function (deals) {
    $scope.catDeals = deals.data.data;
    $ionicLoading.hide();
  });
  */

})
.controller('MyDeals', function($scope, $rootScope,$window, $state, $stateParams, $cordovaGeolocation, DealService, LocationService, CreditsService, $ionicPopup, $location, $ionicLoading) {

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;
  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
  });

  $scope.userData = JSON.parse(window.localStorage['userData']);
  DealService.findMyDeals($scope.userData.session_id).then(function (deals) {
    $scope.mydeals = deals.data.data;
    $ionicLoading.hide();
    // console.log($scope.mydeals);
  });


  $scope.deleteDeal=function(dealId){

if ($window.confirm("Do you want to continue?"))
{

  DealService.removeDeal(dealId).then(function (data) {
              //  console.log('Delete Unpublished Data: ',data)

          if (data.status == 200) {

          var alertPopup = $ionicPopup.alert({
              title: 'Deal has been deleted Successfully!',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });

          $state.go($state.current, {}, {reload: true});

        }
        });
}



}

  CreditsService.getCredits($scope.userData.session_id).then(function (credits) {
    $scope.credits = credits.data.data[0];
  });

  var date = new Date();
  $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
        $scope.timezone = data.data.timeZoneId;
        window.localStorage['timezone'] = $scope.timezone;

        var filter = {};
        filter.from_date = ''
        filter.to_date = ''
        filter.sort_by = ''

        DealService.findMyActiveDeals($scope.userData.session_id, $scope.timezone, filter).then(function (deals) {
          $scope.myActiveDeals = deals.data.data;          
        });

        DealService.findMyPastDeals($scope.userData.session_id, $scope.timezone, filter).then(function (deals) {
          $scope.myPastDeals = deals.data.data;
        });
      });     
    }, function(err) {
      latitude  = undefined;
      longitude = undefined;
    });

  

  /************ CHANGE DEAL STATUS DEAL ***********/

  $scope.publishDeal = function (id) {
    DealService.findDealById(id, $scope.userData.session_id).then(function(deal) {      
      $scope.deal                   = deal.data.data;
      $rootScope.tempDealData       = $scope.deal;
      $rootScope.unpublishedDealId  = $scope.deal._id;
      $state.go('app.createDeal')
    })        
  }

  $scope.changeDealStatus = function (id, deal_publish, publish_text) {

    DealService.publishUnpublishDeal(deal_publish, id, $scope.userData.session_id).then(function (data) {
      // console.log(data.data);
        if (data.data.code == 200) {

          var alertPopup = $ionicPopup.alert({
              title:    publish_text+' Successfully!',
              template: 'Your deal has been '+publish_text+' successfully.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });

          $state.go($state.current, {}, {reload: true});

        } else {

          var alertPopup = $ionicPopup.alert({
              title:    'Anonymously failed!',
              template: 'Oop\'s! it seems like something went wrong.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });
        }

    });
  };

  /************ CLONE THE DEAL ***********/

  $scope.clone = function(deal_id){
    $location.path( "app/clone-deal/"+deal_id );      
  };

  /************ REMOVE PARTICULAR DEAL ***********/

  $scope.removeDeal = function (dealId) {

    DealService.removeDeal(dealId).then(function (data) {

        if (data.data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    'Deleted Successfully!',
                template: 'Your deal has been deleted successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

            $state.go($state.current, {}, {reload: true});

        } else {

          var alertPopup = $ionicPopup.alert({
              title:    'Anonymously failed!',
              template: 'Oop\'s! it seems like something went wrong.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });
        }

    });
  };

  /************ REMOVE PARTICULAR DEAL ***********/

  $scope.editDeal = function(deal_id, key){

    var dateNotifyTime = new Date($scope.mydeals[key].notify_date_time);
    if (date > dateNotifyTime) {
      console.log(date,dateNotifyTime)
      console.log('time khatam')
    };

    // $location.path( "app/edit-deal/"+deal_id );      
  };

  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

})
.controller('MyFutureDeals', function($scope, $rootScope, $state, $stateParams, $cordovaGeolocation, DealService, LocationService, CreditsService, $ionicPopup, $location, $ionicLoading) {

  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;
  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;
  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
  });

  $scope.userData = JSON.parse(window.localStorage['userData']);
  var date = new Date();
  $cordovaGeolocation
    .getCurrentPosition(POS_OPTIONS)
    .then(function (position) {
      LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
        $scope.timezone = data.data.timeZoneId;
        window.localStorage['timezone'] = $scope.timezone;
        DealService.findMyFutureDeals($scope.userData.session_id, $scope.timezone).then(function (deals) {
          $scope.myFutureDeals = deals.data.data;
          $ionicLoading.hide();
        });
      });     
    }, function(err) {
      DealService.findMyFutureDeals($scope.userData.session_id, '').then(function (deals) {
        $scope.myFutureDeals = deals.data.data;
        $ionicLoading.hide();
      });
    });


  /************ EDIT PARTICULAR DEAL ***********/

  $scope.editDeal = function(deal_id, key){

    /*
    var dateNotifyTime = new Date($scope.findMyFutureDeals[key].notify_date_time);
    if (date > dateNotifyTime) {
      console.log(date,dateNotifyTime)
      console.log('time khatam')
    };*/
    $rootScope.showEdit = true;
    $location.path( "app/edit-deal/"+deal_id );      
  };

  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

})
.controller('ActiveDeals', function($scope, $stateParams, DealService, LocationService, CreditsService, $cordovaGeolocation, $ionicPopup, $location, $state, $ionicLoading, $ionicPopover, $rootScope) {

  $scope.totalDealsCreated = $rootScope.dealsCountsData.publish;
  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;
  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;

  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
  
  var date = new Date();
  $scope.userData = JSON.parse(window.localStorage['userData']);

  $scope.getActiveData = function(filter){
    if(!filter){
      var filter = {from_date:'',to_date:'',sort_by:''};    
    }
    $cordovaGeolocation
      .getCurrentPosition(POS_OPTIONS)
      .then(function (position) {
        LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
          $scope.timezone = data.data.timeZoneId;
          window.localStorage['timezone'] = $scope.timezone;

          DealService.findMyActiveDeals($scope.userData.session_id, $scope.timezone, filter).then(function (deals) {
            $scope.mydeals = deals.data.data;
            $ionicLoading.hide();
            // console.log($scope.mydeals);
          });

          var pastFilter = {from_date:'',to_date:'',sort_by:''};
            DealService.findMyPastDeals($scope.userData.session_id, $scope.timezone, pastFilter).then(function (deals) {
              $scope.myPastDeals = deals.data.data;
            });

        });     
      }, function(err) {
        latitude  = undefined;
        longitude = undefined;
      });
  }
  $scope.getActiveData();


  CreditsService.getCredits($scope.userData.session_id).then(function (credits) {
    $scope.credits = credits.data.data[0];
  });

 

  /************ CLONE THE DEAL ***********/

  $scope.clone = function(deal_id){
    $location.path( "app/clone-deal/"+deal_id );      
  };

  // DEALS FILTER POPOVER

  $ionicPopover.fromTemplateUrl('templates/deals/past-active-filter-popover.html', {
    scope: $scope,
    // focusFirstInput: true
  }).then(function(popover) {
    $scope.popover = popover;    
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  $scope.setHistoryRange = function(filter){
    
    if (filter) {
      console.log(filter)
      filter.user_id = $scope.userData.session_id;
      if(filter.from_date && filter.to_date){
        $scope.getActiveData(filter);  
      }else{
        var alertPopup = $ionicPopup.alert({
          title:    'Error',
          template: 'You have to select both From & To date.',
          buttons:[
            {
              text: '<b>Ok</b>',
              type: 'pink-white-theme-color'
            }
          ]
        });
      }
      
    }else{
      var alertPopup = $ionicPopup.alert({
          title:    'Error',
          template: 'Select any filter parameter first.',
          buttons:[
            {
              text: '<b>Ok</b>',
              type: 'pink-white-theme-color'
            }
          ]
        });
    }
  }

  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

})
.controller('ReviewsCtrl', function($scope, $stateParams, ReviewsService, $ionicLoading, $ionicPopup) {
  
  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $scope.userData = JSON.parse(window.localStorage['userData']);
  ReviewsService.findMyReveiws($scope.userData.session_id).then(function (reviews) {
    $scope.reviews = reviews.data.data;
    $ionicLoading.hide();
    // console.log( $scope.reviews );
  });

  $scope.deleteMyReveiw = function(review_id, $index){

    $ionicLoading.show({
        content: 'Loading',
        animation: 'fade-in',
        showBackdrop: true,
        maxWidth: 200,
        showDelay: 0
      });

    var status = 0;
    ReviewsService.updateMyReview(status, review_id).then(function (data) {
      console.log(data);
      $scope.reviews.splice($index, 1);
      $ionicLoading.hide();
      if (data.data.code == 200) {

           var alertPopup = $ionicPopup.alert({
                title:    'Deleted',
                template: 'Your review has been deleted successfully',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

        } else {        

            var alertPopup = $ionicPopup.alert({
                title:    'Error!',
                template: 'Sorry for the inconvenience. Please try again later.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        }
    });
  }

})
.controller('CreditsCtrl', function($scope, $rootScope, $ionicPopover, $location, $stateParams, CreditsService, $ionicLoading, $ionicPopup, $cordovaInAppBrowser, $cordovaToast) {
  
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.userData = JSON.parse(window.localStorage['userData']);
  CreditsService.getCredits($scope.userData.session_id).then(function (credits) {
    $scope.credits = credits.data.data[0];
   
  if(credits.data.hour[0]!=undefined && credits.data.hour[0].sale_value!=undefined){
    $scope.totalSaleValue = credits.data.hour[0].sale_value.toFixed(1);
  }

    $ionicLoading.hide();
  });
  CreditsService.getPackages().then(function (packages) {
    $scope.packages = packages.data.data;
    $scope.formula = packages.data.formula;
    $scope.credit_formula = JSON.parse($scope.formula.values).credit_formula;
  });
  CreditsService.getPurchaseHistory($scope.userData.session_id).then(function (credits) {
    $scope.purchaseHistory = credits.data.data;
    $scope.totalPackages = Object.keys($scope.purchaseHistory).length;
  });

  $scope.buyCredits = function(id) {
    
    $scope.password = {}

    var buyCredits = $ionicPopup.show({
      template: '',
      title: 'Buy Package',
      subTitle: 'Choose your method to buy',
      scope: $scope,
      buttons: [
        {
          text: 'Paypal',
          onTap: function(e) {
            $scope.buyPackageViaPaypal(id)
          }
        },
        {
          text: 'Credit Card',
          type: 'pink-white-theme-color',
          onTap: function(e) {
            $location.path('app/buy-creditcard-credits/'+id)
          }
        }
      ]
    });
    buyCredits.then(function(res) {
      // console.log('Tapped!', res);
    });
  };

  $scope.buyPackageViaPaypal = function(id){

    $ionicLoading.show({
      template: 'Connecting to PayPal...',
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    CreditsService.buyPackageViaPaypal(id, $scope.userData.session_id).then(function (data) {
      
      // console.log("@@@@@@@@");

      // console.log(data.data.data.PAYMENTURL);

      // console.log(data.data.data.links[1].href);

      // console.log("@@@@@@@@ALLLDATRATA");
      //console.log(data);

      $ionicLoading.hide();
      //$scope.paypalLink     = data.data.data.links[1].href;
      $scope.paypalLink = data.data.data.PAYMENTURL
      
      var options = {
        location: 'no',
        clearcache: 'yes',
        toolbar: 'no'
      };
      // alert('$scope.paypalLink: '+ $scope.paypalLink)

      $cordovaInAppBrowser.open($scope.paypalLink, '_blank', options)
        .then(function(event) {
          //alert('Success: ' + event.url)
        })
        .catch(function(event) {
          //alert('error: ' + event.url)
          // error
        });


        // CASE:LOAD START
        $rootScope.$on('$cordovaInAppBrowser:loadstart', function(e, event){
          
          // PAYMENT CANCELLED
          var n = event.url.indexOf("cancelPayment");
          if( n > 1 ){

            $cordovaToast.show('Payment has been cancelled.', 'long', 'center');
            /*
            $cordovaInAppBrowser.close();
            var alertPopup = $ionicPopup.alert({
                title:    'Payment Cancelled',
                template: 'Your payment has been cancelled.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/

          }

          
          // PAYMENT SUCCESS
          var urlArray = $scope.QueryString(event.url);
          if( 
              // ("paymentId"  in urlArray) && 
              ("PayerID"    in urlArray) && 
              ("token"      in urlArray)
            ){
            $cordovaInAppBrowser.close();
            
            if($rootScope.createDeal){

              $cordovaToast.show('Payment done. Now you continue creating deal.', 'long', 'center');
              $state.go('app.createDeal')
            }else{

              $cordovaToast.show('Your payment has been completed successfully. Please check your hours.', 'long', 'center');
              $location.path('app/purchase-history')  
              // $state.go($state.current, {}, {reload: true});
              // $state.go('app.purchaseHistory');
            };

            /*
            var buyCreditsSuccess = $ionicPopup.show({
              template: '',
              title: 'Payment Successfully Done',
              subTitle: 'Your payment has been completed successfully.',
              scope: $scope,
              buttons: [
                {
                  text: 'OK',
                  type: 'pink-white-theme-color',
                  onTap: function(e) {
                    if($rootScope.createDeal){
                      $state.go('app.createDeal')
                    }else{
                      $state.go($state.current, {}, {reload: true});
                    };
                  }
                }
              ]
            });*/
            
          }
          
        });

        // CASE:LOAD STOP
        $rootScope.$on('$cordovaInAppBrowser:loadstop', function(e, event){
          // $ionicLoading.hide();
          // PAYMENT CANCELLED
          var n = event.url.indexOf("cancelPayment");
          if( n > 1 ){

            $cordovaInAppBrowser.close();

            $cordovaToast.show('Your payment has been cancelled.', 'long', 'center');
            /*
            var alertPopup = $ionicPopup.alert({
                title:    'Payment Cancelled',
                template: 'Your payment has been cancelled.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
            
          }

          // PAYMENT SUCCESS
          
          var urlArray = $scope.QueryString(event.url);
          if( 
              ("paymentId"  in urlArray) && 
              ("PayerID"    in urlArray) && 
              ("token"      in urlArray)
            ){

            /*
            $cordovaInAppBrowser.close();
            var alertPopup = $ionicPopup.alert({
                title:    'Payment Successfully Done',
                template: 'Your payment has been Successfully completed.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/
            /*
            var buyCreditsSuccess = $ionicPopup.show({
              template: '',
              title: 'Payment Successfully Done',
              subTitle: 'Your payment has been Successfully completed.',
              scope: $scope,
              buttons: [
                {
                  text: 'OK',
                  type: 'pink-white-theme-color',
                  onTap: function(e) {
                    if($rootScope.createDeal){
                      $state.go('app.createDeal')
                    };
                  }
                }
              ]
            });*/
            $cordovaToast.show('Your payment has been completed successfully.' , 'long', 'center');
          }
          

        });

        // CASE:LOAD ERROR
        $rootScope.$on('$cordovaInAppBrowser:loaderror', function(e, event){

          $cordovaInAppBrowser.close();
          $cordovaToast.show('There is server problem. Your transaction can\'nt be completed now.', 'long', 'center');
          
          /*
          var alertPopup = $ionicPopup.alert({
                title:    'Payment Error!',
                template: 'There is server problem. Your transaction can\'nt be completed now.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          */

        });

        // CASE:INAPP BROWSER EXIT
        $rootScope.$on('$cordovaInAppBrowser:exit', function(e, event){
          
        });

    });
  };

  $scope.QueryString = function(link) {
    var query_string = {};
    var urlSplit  = link.split("?");        
    var query     = urlSplit[1];
    var vars      = query.split("&");
    for (var i=0;i<vars.length;i++) {
      var pair = vars[i].split("=");
      if (typeof query_string[pair[0]] === "undefined") {
        query_string[pair[0]] = decodeURIComponent(pair[1]);
      } else if (typeof query_string[pair[0]] === "string") {
        var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
        query_string[pair[0]] = arr;
      } else {
        query_string[pair[0]].push(decodeURIComponent(pair[1]));
      }
    } 
      return query_string;
  };

  // DEALS FILTER POPOVER

  $ionicPopover.fromTemplateUrl('templates/pages/purchase-history-filter.html', {
    scope: $scope,
    // focusFirstInput: true
  }).then(function(popover) {
    $scope.popover = popover;    
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });
  // Execute action on hide popover
  $scope.$on('popover.hidden', function() {
    // Execute action
  });
  // Execute action on remove popover
  $scope.$on('popover.removed', function() {
    // Execute action
  });

  $scope.setHistoryRange = function(filter){
    filter.user_id = $scope.userData.session_id;
    CreditsService.filterPurchaseHistory(filter).then(function (history) {
      $scope.purchaseHistory = history.data.data;
      console.log($scope.purchaseHistory)
      $scope.popover.hide()
    });
  }

})
.controller('CreditHistoryCtrl', function($scope, $rootScope, $location, $stateParams, CreditsService, $ionicLoading, $ionicPopup, $cordovaInAppBrowser) {
  
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.userData = JSON.parse(window.localStorage['userData']);
  CreditsService.getPurchaseHistory($scope.userData.session_id).then(function (credits) {
    $scope.credits = credits.data.data;
    console.log($scope.credits)  
    $ionicLoading.hide();
  });

})
.controller('CreditUsedHistoryCtrl', function($scope, $ionicLoading, DealService) {
  
  $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $scope.userData = JSON.parse(window.localStorage['userData']);
  DealService.findMyDeals($scope.userData.session_id).then(function (deals) {
    $scope.credits = deals.data.data;
    $ionicLoading.hide();
    console.log($scope.credits);
  });

})
.controller('BuyCreditsCtrl', function($scope, $rootScope, $state, $location, $stateParams, CreditsService, $ionicLoading, $ionicPopup) {

  $scope.buyPackageViaCC = function(details){

    $ionicLoading.show({
      template: 'Payment in progress...',
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    details.package_id  = $stateParams.id;
    details.mode        = 'credit';
    details.user_id     = $scope.userData.session_id;

    // console.log(details);

    CreditsService.buyPackageViaCC(details).then(function (data) {

    // console.log(data);

      $ionicLoading.hide();

      if (data.data.code == 200) {

            var buyCreditsSuccess = $ionicPopup.show({
              template: '',
              title: 'Payment Successfully Done',
              subTitle: 'Your package has been successfully bought. Please check your account for more info.',
              scope: $scope,
              buttons: [
                {
                  text: 'OK',
                  type: 'pink-white-theme-color',
                  onTap: function(e) {                    
                    if($rootScope.createDeal){
                      $cordovaToast.show('Payment done. Now you continue creating deal.', 'long', 'center');
                      $state.go('app.createDeal')
                    }else{
                      $cordovaToast.show('Your payment has been completed successfully. Please check your hours.', 'long', 'center');
                      $location.path('app/purchase-history')  
                      //$state.go($state.current, {}, {reload: true});
                      // $location.path('app/credits')  
                    };  
                  }
                }
              ]
            });

            /*
            var alertPopup = $ionicPopup.alert({
                title:    'Payment Success',
                template: 'Your package has been successfully bought. Please check your account for more info.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });*/          

        } else {

            var alertPopup = $ionicPopup.alert({
                title:    'Payment Error!',
                template: 'Sorry for the inconvenience. Please try again later. Or there might be some credentials problem.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
        }
    });
    
  }

})
.controller('BizCtrl', function($scope, $state, $window, $stateParams, DealService, $ionicModal, $ionicLoading, $ionicPopup, AddressService, $rootScope, $location) {
  
  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  /**** GETTING BIZ ADDRESS ****/
  $scope.userData = JSON.parse(window.localStorage['userData']);
  DealService.findAllBusinessAddr($scope.userData.session_id).then(function (address) {
    $scope.businessAddress = address.data.data;
    $ionicLoading.hide();
  });

  $scope.update = function(place){
    console.log(place)
    

    $scope.latitude  = place.geometry.location.lat();
    $scope.longitude = place.geometry.location.lng();
     
    $scope.biz_zipcode = '';
    $scope.country = '';
    $scope.state = '';
    $scope.city = '';

    // FINDING ZIP
    if (place.address_components[place.address_components.length-1].types[0] == 'postal_code') {
      $scope.biz_zipcode = place.address_components[place.address_components.length-1].long_name;
    };


    // FINDING COUNTRY
    if (place.address_components[place.address_components.length-1].types[0] == 'country' || 
        place.address_components[place.address_components.length-2].types[0] == 'country') {
      if(place.address_components[place.address_components.length-1].types[0] == 'country'){
        $scope.country = place.address_components[place.address_components.length-1].long_name;  
      }else{
        $scope.country = place.address_components[place.address_components.length-2].long_name;  
      }
    };

    // FINDING STATE
    if (place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_1' || 
        place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_1' ||
        place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_1') {
      
      if(place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_1'){
        $scope.state = place.address_components[place.address_components.length-1].long_name;
      }else if(place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_1'){
        $scope.state = place.address_components[place.address_components.length-2].long_name;  
      }else{
        $scope.state = place.address_components[place.address_components.length-3].long_name;  
      }
    };

    // FINDING CITY
    if (place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_2' || 
        place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_2' ||
        place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_2' ||
        place.address_components[place.address_components.length-4].types[0] == 'administrative_area_level_2' ||

        place.address_components[place.address_components.length-1].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-2].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-3].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-4].types[0] == 'sublocality_level_1' ) {
    
      if(place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_2' || 
        place.address_components[place.address_components.length-1].types[0] == 'sublocality_level_1'){
        $scope.city = place.address_components[place.address_components.length-1].long_name;
      }else if( place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_2' || 
                place.address_components[place.address_components.length-2].types[0] == 'sublocality_level_1'){
        $scope.city = place.address_components[place.address_components.length-2].long_name;  
      }else if( place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_2' || 
                place.address_components[place.address_components.length-3].types[0] == 'sublocality_level_1'){
        $scope.city = place.address_components[place.address_components.length-3].long_name;  
      }else{
        $scope.city = place.address_components[place.address_components.length-4].long_name;  
      }    
    };

  }

  // Create the business modal that we will use later
  $ionicModal.fromTemplateUrl('templates/pages/create-biz-addr.html', {
    id: '1', // We need to use and ID to identify the modal that is firing the event!
    scope: $scope,
    backdropClickToClose: false,
    animation: 'slide-in-up'
  }).then(function(modal) {
    $scope.modal = modal;
  });

  // Triggered in the business modal to close it
  $scope.closeModal = function(index) {
    $scope.modal.hide();
  };

  // Open the Business modal
  $scope.createBizAddrModal = function(index) {
    $scope.modal.show();
  };

  // Listen for broadcasted messages
  $scope.$on('modal.shown', function(event, modal) {
    console.log('Modal ' + modal.id + ' is shown!');
  });

  $scope.$on('modal.hidden', function(event, modal) {
    console.log('Modal ' + modal.id + ' is hidden!');
  });

  // Cleanup the modal when we're done with it!
  $scope.$on('$destroy', function() {
    console.log('Destroying modals...');
    $scope.modal.remove();
  });

  /*************** CREATE BIZ ADDRESS  *************/

  $scope.createBizAddr = function(place, city, state, country, biz_zipcode, biz_name) {
    $scope.modal.hide();

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    // Getting location from lat long
    var promise = AddressService.getLatLongByLocation(place);
    promise.then(function(payload) {
        var address = {};

        var userLocationData  = payload.data;
        
        if (payload.data.results.length > 0) {
          address.biz_lat   = userLocationData.results[0].geometry.location.lat;
          address.biz_long  = userLocationData.results[0].geometry.location.lng;
        }else{
          address.biz_lat   = $scope.latitude;
          address.biz_long  = $scope.longitude;
        }
        address.biz_address = place.formatted_address;
        address.biz_city    = city;
        address.biz_state   = state;
        address.biz_country = country;
        address.biz_zipcode = biz_zipcode;        
        address.biz_owner   = $scope.userData.session_id;    
        address.biz_name    = biz_name;    
        
        /*
        formatted_address   = userLocationData.results[0].formatted_address;
        var addressArray    = formatted_address.split(",");
        address.biz_country = addressArray[addressArray.length-1].trim();
        */
        
        $scope.saveAddrLastStep(address);
    });
    

    $scope.saveAddrLastStep = function(address){
      AddressService.addAddress(address).success(function(data){
          
          console.log(data);

          $ionicLoading.hide();        
          
          if (data.code == 200) {
            var alertPopup = $ionicPopup.alert({
                title:    'Address Added Successfully!',
                template: 'Your Address has been added Successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            alertPopup.then(function(res) {
              // $window.location.reload(true);
            });

            var pushBizAddr = {
              _id : data.data._id,
              biz_address : address.biz_address
            };
            $scope.businessAddress.push(pushBizAddr);

          } else {
            var alertPopup = $ionicPopup.alert({
                title:    'Failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          }
      });
    }

  };


  /*************** DELETE BIZ ADDRESS  *************/

  $scope.deleteBizAddr = function(id, $index) {
    console.log(id);

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });
    var address = {
      biz_id : id,
      biz_status : '0'
    };
    AddressService.deleteAddress(address).success(function(data){
        
        $scope.businessAddress.splice($index, 1);  
        $ionicLoading.hide();       
        
          if (data.code == 200) {
            var alertPopup = $ionicPopup.alert({
                title:    'Address Deleted Successfully!',
                template: 'Your Address has been deleted Successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

          } else {
            var alertPopup = $ionicPopup.alert({
                title:    'Failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          }

    });
  };
 
   /*************** VIEW BIZ ADDRESS  *************/

  $scope.viewAddr = function(biz_id, biz_zipcode, biz_address, biz_city, biz_state, biz_country, biz_name) {
    var addArr = {
      'biz_id':biz_id,
      'biz_zipcode':biz_zipcode,
      'biz_address':biz_address,      
      'biz_city':biz_city,      
      'biz_state':biz_state,      
      'biz_country':biz_country,
      'biz_name':biz_name      
    }
    $rootScope.singleBizAddress = addArr;
    $location.path('app/biz-address/'+biz_id)
  };

})
.controller('SingleBizCtrl', function($scope, $stateParams, $ionicLoading, $ionicPopup, AddressService, DealService, $rootScope, $location ) {
  
  $scope.address = $rootScope.singleBizAddress;

  $scope.createBizAddr = function(address) {
    
    console.log(address);

    $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

    var promise = AddressService.getLatLongByLocation(address.biz_address);
    promise.then(function(payload) {
        // var address = {};

        var userLocationData  = payload.data;
        
        if (payload.data.results.length > 0) {
          address.biz_lat   = userLocationData.results[0].geometry.location.lat;
          address.biz_long  = userLocationData.results[0].geometry.location.lng;
          console.log('payload')
          console.log(address.biz_lat, address.biz_long)
        }else{
          address.biz_lat   = $scope.latitude;
          address.biz_long  = $scope.longitude;
          console.log('payload no')
          console.log(address.biz_lat, address.biz_long)
        }
        address.biz_owner = $scope.userData.session_id;    
        /*
        address.biz_address = biz_address;
        address.biz_city    = city;
        address.biz_state   = state;
        address.biz_country = country;
        address.biz_zipcode = biz_zipcode;        
        address.biz_owner   = $scope.userData.session_id;    */
        
        $scope.saveAddrLastStep(address);
    });

    /*
    // Getting location from lat long
    var promise = AddressService.getLatLongByLocation(address.biz_address);
    promise.then(function(payload) {
        var userLocationData  = payload.data;
        address.biz_lat   = userLocationData.results[0].geometry.location.lat;
        address.biz_long  = userLocationData.results[0].geometry.location.lng;
        address.biz_owner = $scope.userData.session_id;    

        formatted_address   = userLocationData.results[0].formatted_address;
        var addressArray    = formatted_address.split(",");
        address.biz_country = addressArray[addressArray.length-1].trim();
        
        $scope.saveAddrLastStep(address);
        // console.log(address.biz_lat +','+ address.biz_long)
    });
    */

    $scope.saveAddrLastStep = function(){
      AddressService.updateBizAddress(address).success(function(data){
          
          console.log(data);

          $ionicLoading.hide();        
          
          if (data.code == 200) {
            var alertPopup = $ionicPopup.alert({
                title:    'Address Updated Successfully!',
                template: 'Your Address has been added Updated.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
            alertPopup.then(function(res) {
              // $window.location.reload(true);
            });
            $location.path('app/biz-address')

          } else {
            var alertPopup = $ionicPopup.alert({
                title:    'Failed!',
                template: 'Oop\'s! it seems like something went wrong.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });
          }
      });
    };
  };

  $scope.update = function(place){
    console.log(place)
    // $scope.address = {}

    $scope.latitude  = place.geometry.location.lat();
    $scope.longitude = place.geometry.location.lng();

    $scope.address.biz_zipcode = '';
    $scope.address.biz_country = '';
    $scope.address.biz_state = '';
    $scope.address.biz_city = '';

    // FINDING ZIP
    if (place.address_components[place.address_components.length-1].types[0] == 'postal_code') {
      $scope.address.biz_zipcode = place.address_components[place.address_components.length-1].long_name;
    };

    // FINDING COUNTRY
    if (place.address_components[place.address_components.length-1].types[0] == 'country' || 
        place.address_components[place.address_components.length-2].types[0] == 'country') {
      if(place.address_components[place.address_components.length-1].types[0] == 'country'){
        $scope.address.biz_country = place.address_components[place.address_components.length-1].long_name;  
      }else{
        $scope.address.biz_country = place.address_components[place.address_components.length-2].long_name;  
      }      
    };

    // FINDING STATE
    if (place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_1' || 
        place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_1' ||
        place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_1') {
      
      if(place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_1'){
        $scope.address.biz_state = place.address_components[place.address_components.length-1].long_name;
      }else if(place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_1'){
        $scope.address.biz_state = place.address_components[place.address_components.length-2].long_name;  
      }else{
        $scope.address.biz_state = place.address_components[place.address_components.length-3].long_name;  
      }
    };

    // FINDING CITY
    if (place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_2' || 
        place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_2' ||
        place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_2' ||
        place.address_components[place.address_components.length-4].types[0] == 'administrative_area_level_2' ||

        place.address_components[place.address_components.length-1].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-2].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-3].types[0] == 'sublocality_level_1' ||
        place.address_components[place.address_components.length-4].types[0] == 'sublocality_level_1' ) {
    
      if(place.address_components[place.address_components.length-1].types[0] == 'administrative_area_level_2' || 
        place.address_components[place.address_components.length-1].types[0] == 'sublocality_level_1'){
        $scope.address.biz_city = place.address_components[place.address_components.length-1].long_name;
      }else if( place.address_components[place.address_components.length-2].types[0] == 'administrative_area_level_2' || 
                place.address_components[place.address_components.length-2].types[0] == 'sublocality_level_1'){
        $scope.address.biz_city = place.address_components[place.address_components.length-2].long_name;  
      }else if( place.address_components[place.address_components.length-3].types[0] == 'administrative_area_level_2' || 
                place.address_components[place.address_components.length-3].types[0] == 'sublocality_level_1'){
        $scope.address.biz_city = place.address_components[place.address_components.length-3].long_name;  
      }else{
        $scope.address.biz_city = place.address_components[place.address_components.length-4].long_name;  
      }    
    };

  }

})
.controller('AboutCtrl', function($scope, AboutService, $ionicLoading) {
  
  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  /* GETTING ABOUT CONTENT */
  
  AboutService.getAboutContent().then(function (data) {
    $scope.aboutContent = $scope.htmlToPlaintext(data.data.data.values);
    $ionicLoading.hide();
  });

  $scope.htmlToPlaintext = function (text) {
    return text ? String(text).replace(/<[^>]+>/gm, '') : '';
  };

})
.controller('NotificationCtrl', function($scope, NotificationService, $ionicLoading, $location) {
  
  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  /* GETTING NOTIFICATION CONTENT */

  $scope.userData = JSON.parse(window.localStorage['userData']);
  NotificationService.getNotifications($scope.userData.session_id).then(function (data) {
    $scope.notifications = data.data.data;
    console.log($scope.notifications)
    $ionicLoading.hide();
  });

  $scope.viewNotification = function(dealId) {

    NotificationService.seeNotification($scope.userData.session_id, dealId).then(function (data) {
      $scope.seenotifications = data.data;
      console.log($scope.seenotifications)
      $location.path( "app/single-deal/"+dealId );
    });

    
  };

})
.controller('MyFavoritesCtrl', function($scope, DealService, $ionicLoading, $location) {

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;

  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  /**** GETTING USER'S FAV DEALS ****/
  
  $scope.userData = JSON.parse(window.localStorage['userData']);
  DealService.findUserFavoriteDeals($scope.userData.session_id).then(function (deals) {
    $scope.favdeals = deals.data;
   //$scope.favdeals.ratedata=$scope.favdeals.sharedata;
     
    $ionicLoading.hide();
      if($scope.favdeals.ratedata==""){
           $scope.favdeals.ratedata=Array();
      }
      if($scope.favdeals.sharedata==""){
          $scope.favdeals.sharedata=Array();
      }
      if($scope.favdeals.reviewdata==""){
        $scope.favdeals.reviewdata=Array();
      }
      $scope.favdealconcat = $scope.favdeals.ratedata.concat($scope.favdeals.sharedata);
      $scope.favdealsmerged = $scope.favdealconcat.concat($scope.favdeals.reviewdata);
   //console.log($scope.favdealsmerged)
  });

  $scope.view = function(dealId) {
    $location.path( "app/single-deal/"+dealId );       
  };

})
.controller('FaqCtrl', function($scope, FaqService, $ionicLoading, $location) {

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;

  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  /**** GETTING FAQ's ****/
  
  FaqService.getFaq().then(function (data) {
    $scope.faqs = data.data.data;
    $ionicLoading.hide();
    console.log($scope.faqs);
  });

})
.controller('ContactCtrl', function($scope, ContactService, $ionicPopup, $state) {

  $scope.contact = function(user) {
    ContactService.contactAdmin(user).success(function(data){
      if (data.code == 200) {
        var alertPopup = $ionicPopup.alert({
          title:    'Message Sent Successfully',
          template: 'Your message has been sent successfully. Our team will revert back you soon.',
          buttons:[
            {
              text: '<b>Ok</b>',
              type: 'pink-white-theme-color'
            }
          ]
        });
        $state.go('app.deals');

      } else {
        var alertPopup = $ionicPopup.alert({
          title:    'Error!',
          template: 'Sorry for the inconvenience. Please try again later.',
          buttons:[
            {
              text: '<b>Ok</b>',
              type: 'pink-white-theme-color'
            }
          ]
        });
      }
    });
  };

})
.controller('PastDeals', function($scope, $stateParams, $ionicPopover, DealService, LocationService, CreditsService, $cordovaGeolocation, $ionicPopup, $location, $state, $ionicLoading) {

  $scope.shouldShowDelete = false;
  $scope.shouldShowReorder = false;
  $scope.listCanSwipe = true;

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;

  $ionicLoading.show({
      content: 'Loading',
      animation: 'fade-in',
      showBackdrop: true,
      maxWidth: 200,
      showDelay: 0
    });

  $scope.getPastDeals = function(filter){
    if(!filter){
      var filter = {from_date:'',to_date:'',sort_by:''};
    }
    var date = new Date();
    $cordovaGeolocation
      .getCurrentPosition(POS_OPTIONS)
      .then(function (position) {
        LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
          $scope.timezone = data.data.timeZoneId;
          window.localStorage['timezone'] = $scope.timezone;

          $scope.userData = JSON.parse(window.localStorage['userData']);

          DealService.findMyPastDeals($scope.userData.session_id, $scope.timezone, filter).then(function (deals) {
            $scope.pastDeals = deals.data.data;
            $ionicLoading.hide();
          });

        });     
      }, function(err) {
        latitude  = undefined;
        longitude = undefined;
      });
  }
  $scope.getPastDeals();
  

  CreditsService.getCredits($scope.userData.session_id).then(function (credits) {
    $scope.credits = credits.data.data[0];
  });


  /************ CHANGE DEAL STATUS DEAL ***********/

  $scope.changeDealStatus = function (id, deal_publish, publish_text) {

    DealService.publishUnpublishDeal(deal_publish, id, $scope.userData.session_id).then(function (data) {
      // console.log(data.data);
        if (data.data.code == 200) {

            var alertPopup = $ionicPopup.alert({
                title:    publish_text+' Successfully!',
                template: 'Your deal has been '+publish_text+' successfully.',
                buttons:[
                  {
                    text: '<b>Ok</b>',
                    type: 'pink-white-theme-color'
                  }
                ]
            });

            $state.go($state.current, {}, {reload: true});

        } else {

          var alertPopup = $ionicPopup.alert({
              title:    'Anonymously failed!',
              template: 'Oop\'s! it seems like something went wrong.',
              buttons:[
                {
                  text: '<b>Ok</b>',
                  type: 'pink-white-theme-color'
                }
              ]
          });
        }

    });
  };

  /************ CLONE THE DEAL ***********/

  $scope.clone = function(deal_id){
    $location.path( "app/clone-deal/"+deal_id );      
  };

  // DEALS FILTER POPOVER

  $ionicPopover.fromTemplateUrl('templates/deals/past-active-filter-popover.html', {
    scope: $scope,
    // focusFirstInput: true
  }).then(function(popover) {
    $scope.popover = popover;    
  });

  $scope.openPopover = function($event) {
    $scope.popover.show($event);
  };
  $scope.closePopover = function() {
    $scope.popover.hide();
  };
  //Cleanup the popover when we're done with it!
  $scope.$on('$destroy', function() {
    $scope.popover.remove();
  });

  $scope.setHistoryRange = function(filter){
    
    if (filter) {
      $scope.filter = filter;
      console.log(filter)
      filter.user_id = $scope.userData.session_id;
      if(filter.from_date && filter.to_date){
        $scope.getPastDeals(filter);  
      }else{
        var alertPopup = $ionicPopup.alert({
          title:    'Error',
          template: 'You have to select both From & To date.',
          buttons:[
            {
              text: '<b>Ok</b>',
              type: 'pink-white-theme-color'
            }
          ]
        });
      }
      
    }else{
      var alertPopup = $ionicPopup.alert({
          title:    'Error',
          template: 'Select any filter parameter first.',
          buttons:[
            {
              text: '<b>Ok</b>',
              type: 'pink-white-theme-color'
            }
          ]
        });
    }
  }

  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

  $scope.dynamicOrderFunction = function(deal) {
    if ($scope.filter) {
      console.log($scope.filter)
      if ($scope.filter.sort_by=='Reviews') {
          console.log('inside reviews')
          return deal[$scope.filter.sort_by];
      }
      else {
          return myCalculatedValueFunction;
      }
    }else{
      // return '-deal_review_count';
      console.log($scope.filter)
    }
  }

})
.controller('DealsToBeNotifyCtrl', function($scope, $ionicLoading, DealService, $location) {

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;

  $scope.userData = JSON.parse(window.localStorage['userData']);
  $scope.timezone = window.localStorage['timezone'] ;
  DealService.findToBeNotifyDeals($scope.userData.session_id, $scope.timezone).then(function (deals) {
    $scope.deals = deals.data.data;
    console.log($scope.deals)
    $ionicLoading.hide();
  });

  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

})
.controller('FavotriteAndReviewedDeals', function($scope, $ionicLoading, DealService, $location) {

  $scope.dealImagePath = DEAL_IMAGE;
  $scope.dealIconPath  = DEAL_ICON;
  $scope.userData = JSON.parse(window.localStorage['userData']);
  DealService.findFavotriteAndReviewedDeals($scope.userData.session_id).then(function (deals) {
      $scope.favourite = deals.data.sharedata;
      $scope.reviewdata = deals.data.reviewdata;
      $ionicLoading.hide();
    });

  /*************** VIEW SINGLE DEAL ***************/
  
  $scope.view = function(dealId){
    $location.path( "app/single-deal/"+dealId );
  };

});



/************************ APP FILTERS *********************/


angular.module('deals.controllers')
.filter('time', function($filter)
  {
   return function(input)
   {
    if(input == null){ return ""; } 
   
    var _date = $filter('date')(new Date(input), 'MMMM d, y');
   
    return _date.toUpperCase();
   };
  })
.filter('ratingstar', function() {
  return function(input, total) {
    total = parseInt(total);
    for (var i=0; i<total; i++)
      input.push(i);
    return input;
  };
});


/************************ APP DIRECTIVES *********************/


angular.module('deals.controllers')
.directive('errSrc', function() {
  return {
    link: function(scope, element, attrs) {
      element.bind('error', function() {
        if (attrs.src != attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
      attrs.$observe('ngSrc', function(value) {
        if (!value && attrs.errSrc) {
          attrs.$set('src', attrs.errSrc);
        }
      });
    }
  }
})
.directive('map',['$http', 'LocationService', 'DealService', '$cordovaGeolocation',function($http, LocationService, DealService, $cordovaGeolocation){
     return{
        
        restrict : 'A',

        link : function(scope,elements,attr){

            $cordovaGeolocation
              .getCurrentPosition(POS_OPTIONS)
              .then(function (position) {      
                
                var latitude  = position.coords.latitude;
                var longitude = position.coords.longitude;

                // console.log(latitude + ' : ' + longitude);
                putMarkerLastStep(latitude, longitude);                
                
            }, function(err) {        
                console.log(err);
                var latitude  = 28.6100;
                var longitude = 77.2300;
                putMarkerLastStep(latitude, longitude);  
            });


            /**** this rendering of markers via ng resource using service Locations ****/

            var putMarkerLastStep = function (latitude, longitude) {
      
                var myOptions = {
                      center: new google.maps.LatLng(latitude, longitude),
                      zoom: 7,
                      mapTypeId: google.maps.MapTypeId.ROADMAP
                    };
              
                var map = new google.maps.Map(document.getElementById("map"),myOptions);

                var userData  = JSON.parse(window.localStorage['userData']);
                var user_id   = userData.session_id;

                DealService.findLocalDeals(latitude, longitude, user_id).then(function (deals) {
                    
                    // console.log(deals.data.business[0][0].coordinates[0]);
                    // console.log(deals.data.business[0][0].coordinates[1]);
                    // console.log(deals.data.data);

                    var business_coordinates = deals.data;
                    var loan = 'loan';

                    for(var i=0;i<deals.data.data.length;i++)
                    {                      
                        var latdata     = deals.data.data[i].location[0].coordinates[1];
                        var longdata    = deals.data.data[i].location[0].coordinates[0];
                        latlongDataset  = new google.maps.LatLng(latdata, longdata);
                        var marker      = new google.maps.Marker({
                            map: map, 
                            title: loan ,
                            position : latlongDataset
                        });
                        map.setCenter(marker.getPosition())
                        
                        var content     = deals.data.data[i]._id;
                        var infowindow  = new google.maps.InfoWindow()

                        google.maps.event.addListener(marker,'click', (function(marker, content, infowindow){ 
                            return function() {
                              
                              var date = new Date();
                              $cordovaGeolocation
                                  .getCurrentPosition(POS_OPTIONS)
                                  .then(function (position) {
                                    LocationService.getTimezoneByLatLong(position.coords.latitude, position.coords.longitude, (date.getTime()/10)).then(function (data) {
                                      var timezone = data.data.timeZoneId;
                                      DealService.findDealsByBizId(content,timezone).then(function (data) {
                                          if(data.data.data.length == 0){
                                            var windowContent = 'We\'ve No Deal on this Address for now.';
                                          }else{
                                            var windowContent="<strong>Deals:</strong><br>"
                                            for(var j=0;j<data.data.data.length;j++){
                                             windowContent += '<br> <a class="pink-colo-font" href="#/app/single-deal/'+data.data.data[j]._id+'">'+data.data.data[j].deal_name+'</a>';
                                          }
                                          }
                                          // console.log(data.data.data.length)                                
                                          infowindow.setContent(windowContent);
                                          infowindow.open(map,marker);
                                        });
                                    });     
                                  }, function(err) {
                                    latitude  = undefined;
                                    longitude = undefined;
                                  });



                              
                                
                            };
                        })(marker,content,infowindow)); 

                        marker.setMap(map);
                        infowindow.setMap(map);
                    }

                });
            
                // google.maps.event.addDomListener(window, 'load', initialize);

            };
        }
      }
}])
.directive('myMap', function() {
    // directive link function
    var link = function(scope, element, attrs) {
        var map, infoWindow;
        var markers = [];
        
        // map config
        var mapOptions = {
            center: new google.maps.LatLng(50, 2),
            zoom: 4,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            scrollwheel: false
        };
        
        // init the map
        function initMap() {
            if (map === void 0) {
                map = new google.maps.Map(element[0], mapOptions);
            }
        }    
        
        // place a marker
        function setMarker(map, position, title, content) {
            var marker;
            var markerOptions = {
                position: position,
                map: map,
                title: title,
                icon: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png'
            };

            marker = new google.maps.Marker(markerOptions);
            markers.push(marker); // add marker to array
            
            google.maps.event.addListener(marker, 'click', function () {
                // close window if not undefined
                if (infoWindow !== void 0) {
                    infoWindow.close();
                }
                // create new window
                var infoWindowOptions = {
                    content: content
                };
                infoWindow = new google.maps.InfoWindow(infoWindowOptions);
                infoWindow.open(map, marker);
            });
        }
        
        // show the map and place some markers
        initMap();
        
        setMarker(map, new google.maps.LatLng(51.508515, -0.125487), 'London', 'Just some content');
        setMarker(map, new google.maps.LatLng(52.370216, 4.895168), 'Amsterdam', 'More content');
        setMarker(map, new google.maps.LatLng(48.856614, 2.352222), 'Paris', 'Text here');
    };
    
    return {
        restrict: 'A',
        template: '<div id="gmaps"></div>',
        replace: true,
        link: link
    };
});


/************************ APP OTHER METHODS *********************/


angular.module('ionic.rating', [])
.constant('ratingConfig', {
    max: 5,
    stateOn: null,
    stateOff: null
  })
.controller('RatingController', function($scope, $attrs, ratingConfig, DealService) {
    var ngModelCtrl;
    ngModelCtrl = {
      $setViewValue: angular.noop
    };
    this.init = function(ngModelCtrl_) {
      var max, ratingStates;
      ngModelCtrl = ngModelCtrl_;
      ngModelCtrl.$render = this.render;
      this.stateOn = angular.isDefined($attrs.stateOn) ? $scope.$parent.$eval($attrs.stateOn) : ratingConfig.stateOn;
      this.stateOff = angular.isDefined($attrs.stateOff) ? $scope.$parent.$eval($attrs.stateOff) : ratingConfig.stateOff;
      max = angular.isDefined($attrs.max) ? $scope.$parent.$eval($attrs.max) : ratingConfig.max;
      ratingStates = angular.isDefined($attrs.ratingStates) ? $scope.$parent.$eval($attrs.ratingStates) : new Array(max);
      return $scope.range = this.buildTemplateObjects(ratingStates);
    };
    this.buildTemplateObjects = function(states) {
      var i, j, len, ref;
      ref = states.length;
      for (j = 0, len = ref.length; j < len; j++) {
        i = ref[j];
        states[i] = angular.extend({
          index: 1
        }, {
          stateOn: this.stateOn,
          stateOff: this.stateOff
        }, states[i]);
      }
      return states;
    };
    $scope.rate = function(value) {

      DealService.setDynamicRating(value).then(function () {
        console.log('New rating valuekey: "value",  '+value);
      });

      console.log('rate me! '+value);
      if (!$scope.readonly && value >= 0 && value <= $scope.range.length) {
        ngModelCtrl.$setViewValue(value);
        return ngModelCtrl.$render();
      }
    };
    $scope.reset = function() {
      $scope.value = ngModelCtrl.$viewValue;
      return $scope.onLeave();
    };
    $scope.enter = function(value) {
      if (!$scope.readonly) {
        $scope.value = value;
      }
      return $scope.onHover({
        value: value
      });
    };
    $scope.onKeydown = function(evt) {
      if (/(37|38|39|40)/.test(evt.which)) {
        evt.preventDefault();
        evt.stopPropagation();
        return $scope.rate($scope.value + (evt.which === 38 || evt.which === 39 ? {
          1: -1
        } : void 0));
      }
    };
    this.render = function() {
      return $scope.value = ngModelCtrl.$viewValue;
    };
    return this;
  })
.directive('rating', function() {
    return {
      restrict: 'EA',
      require: ['rating', 'ngModel'],
      scope: {
        readonly: '=?',
        onHover: '&',
        onLeave: '&'
      },
      controller: 'RatingController',
      template: '<ul class="rating" ng-mouseleave="reset()" ng-keydown="onKeydown($event)">' + '<li ng-repeat="r in range track by $index" ng-click="rate($index + 1)"><i class="icon" ng-class="$index < value && (r.stateOn || \'ion-ios-star\') || (r.stateOff || \'ion-ios-star-outline\')"></i></li>' + '</ul>',
      replace: true,
      link: function(scope, element, attrs, ctrls) {
        var ngModelCtrl, ratingCtrl;
        ratingCtrl = ctrls[0];
        ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          return ratingCtrl.init(ngModelCtrl);
        }
      }
    };
})
.directive('onlyrating', function() {
    return {
      restrict: 'EA',
      require: ['onlyrating', 'ngModel'],
      scope: {
        readonly: '=?',
        onHover: '&',
        onLeave: '&'
      },
      controller: 'RatingController',
      template: '<ul class="rating onlyrating" ng-mouseleave="reset()" ng-keydown="onKeydown($event)">' + '<li ng-repeat="r in range track by $index"><i class="icon" ng-class="$index < value && (r.stateOn || \'ion-ios-star\') || (r.stateOff || \'ion-ios-star-outline\')"></i></li>' + '</ul>',
      replace: true,
      link: function(scope, element, attrs, ctrls) {
        var ngModelCtrl, ratingCtrl;
        ratingCtrl = ctrls[0];
        ngModelCtrl = ctrls[1];
        if (ngModelCtrl) {
          return ratingCtrl.init(ngModelCtrl);
        }
      }
    };
})
.directive('disableTap', function($timeout) {
  return {
    link: function() {

      $timeout(function() {
        document.querySelector('.pac-container').setAttribute('data-tap-disabled', 'true')
      },500);
    }
  };
});