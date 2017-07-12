var deals = angular.module('deals.services', ['ngResource']);
    
    /*
    deals.config(['$httpProvider', function ($httpProvider) {
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        $httpProvider.defaults.headers.post['Accept'] = 'application/json, text/javascript';
        $httpProvider.defaults.headers.post['Content-Type'] = 'application/json; charset=utf-8';
        $httpProvider.defaults.headers.post['Access-Control-Max-Age'] = '1728000';
        $httpProvider.defaults.headers.common['Access-Control-Max-Age'] = '1728000';
        $httpProvider.defaults.headers.common['Accept'] = 'application/json, text/javascript';
        $httpProvider.defaults.headers.common['Content-Type'] = 'application/json; charset=utf-8';
        $httpProvider.defaults.useXDomain = true;
    }]);
    */

    deals.factory('DealService',        function($q, $http, $resource) {
        
        var rating = '5';

        // We use promises to make this api asynchronous. This is clearly not necessary when using in-memory data
        // but it makes this service more flexible and plug-and-play. For example, you can now easily replace this
        // service with a JSON service that gets its data from a remote server without having to changes anything
        // in the modules invoking the data service since the api is already async.

        return {
            
            findAllDeals: function(id,country,type,latitude, longitude, timezone, user_range, perPage, page) {

                if(!perPage){perPage = 1}
                if(!page){page = 0}

                var promise = $http({
                    url: DEALS_LISTING,
                    method: 'POST',
                    data:   'user_id='      +id+
                            '&country='     +country+
                            '&type='        +type+
                            '&user_lat='    +Number(latitude)+
                            '&user_lng='    +Number(longitude)+
                            '&timezone='    +timezone+
                            '&user_range='  +user_range+
                            '&perPage='     +Number(perPage)+
                            '&page='        +Number(page),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findDealsCount: function(id, timezone) {

                var promise = $http({
                    url: DEALS_COUNTS,
                    method: 'POST',
                    data:   'deal_owner='  +id+
                            '&timezone='   +timezone,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findLatestDeals: function(id, latitude, longitude) {

                var promise = $http({
                    url: LATEST_DEALS,
                    method: 'POST',
                    data:   'user_id='     +id+
                            '&user_lat='   +Number(latitude)+
                            '&user_lng='   +Number(longitude),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findMyFutureDeals: function(id,timezone) {

                var promise = $http({
                    url: BIZ_USER_FUTURE_DEAL,
                    method: 'POST',
                    data:   'deal_owner='  +id+
                            '&timezone='   +timezone,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findPopularDeals: function(id, latitude, longitude) {

                var promise = $http({
                    url: POPULAR_DEALS,
                    method: 'POST',
                    data:   'user_id='     +id+
                            '&user_lat='   +Number(latitude)+
                            '&user_lng='   +Number(longitude),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findFavoriteDeals: function(id, latitude, longitude) {

                var promise = $http({
                    url: FAVORITE_DEALS,
                    method: 'POST',
                    data:   'user_id='     +id+
                            '&user_lat='   +Number(latitude)+
                            '&user_lng='   +Number(longitude),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findLowToHighPriceDeals: function(sort_type) {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(PRICE_LOW_HIGH_DEALS+'/'+sort_type));
                return deferred.promise;

            },
            findHighToLowPriceDeals: function(sort_type) {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(PRICE_HIGH_LOW_DEALS+'/'+sort_type));
                return deferred.promise;

            },
            findLocalDeals: function(latitude, longitude, id) {

                var promise = $http({
                    url: LOCAL_BIZ_IDS,
                    method: 'POST',
                    data:   'user_id='     +id+
                            '&user_lat='   +Number(latitude)+
                            '&user_lng='   +Number(longitude),
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;            

            },
            findNationalDeals: function(country, timezone) {

                var promise = $http({
                    url: NATIONAL_DEALS,
                    method: 'POST',
                    data:   'deal_country='         +country+
                            '&timezone='            +timezone+
                            '&deal_location_type='  +'national',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;            

            },
            findDealByKeyword: function(deal_keyword, id, latitude, longitude, range, type, timezone, cat_id) {

                var promise = $http({
                    url: SEARCH_DEAL,
                    method: 'POST',
                    data:   'deal_keyword=' +deal_keyword+
                            '&id='          +id+
                            '&lat='         +latitude+
                            '&lng='         +longitude+
                            '&range='       +range+
                            '&timezone='    +timezone+
                            '&type='        +type+
                            '&cat_id='      +cat_id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findDealsByBizId: function(id,timezone) {

                // var deferred = $q.defer(); 
                // deferred.resolve($http.get(PARTICULAR_BIZ_DEALS+'/'+id+'/'+timezone));
                // return deferred.promise;
                var promise = $http({
                    url: PARTICULAR_BIZ_DEALS,
                    method: 'POST',
                    data:   'id='    +id+
                            '&timezone='+timezone,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;
            },
            findCatDeals: function(cat_id,user_id,country,latitude, longitude, timezone, user_range, perPage, page) {

                var promise = $http({
                    url: CAT_DEALS,
                    method: 'POST',
                    data:   'user_id='    +user_id+
                            '&country='    +country+ 
                            '&id='        +cat_id+
                            '&timezone='  +timezone+
                            '&latitude='  +latitude+
                            '&longitude=' +longitude+
                            '&user_range='+user_range,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findMyDeals: function(session_id) {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(MY_DEALS+'/'+session_id));
                return deferred.promise;

            },
            findMyActiveDeals: function(deal_owner, timezone, filter) {

                var promise = $http({
                    url: ACTIVE_DEALS,
                    method: 'POST',
                    data:   'deal_owner='   +deal_owner+
                            '&timezone='    +timezone+
                            '&from_date='   +filter.from_date+
                            '&to_date='     +filter.to_date+
                            '&sort_by='     +filter.sort_by,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findMyPastDeals: function(session_id, timezone, filter) {

                // var deferred = $q.defer();
                // deferred.resolve($http.get(PAST_DEALS+'/'+session_id));
                // return deferred.promise;

                var promise = $http({
                    url: PAST_DEALS,
                    method: 'POST',
                    data:   'user_id='      +session_id+
                            '&timezone='    +timezone+
                            '&from_date='   +filter.from_date+
                            '&to_date='     +filter.to_date+
                            '&sort_by='     +filter.sort_by,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findFavotriteAndReviewedDeals: function(session_id) {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(FAV_N_REVIEWED_DEALS+'/'+session_id));
                return deferred.promise;

            },
            findUserFavoriteDeals: function(session_id) {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(FAVORITE_USER_DEALS+'/'+session_id));
                return deferred.promise;

            },
            findToBeNotifyDeals: function(deal_owner, timezone) {

                 var promise = $http({
                    url: DEAL_TO_BE_NOTIFY,
                    method: 'POST',
                    data:   'deal_owner='       +deal_owner+
                            '&timezone='        +timezone,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findAllDealCategories: function() {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(DEAL_CATEGORIES));
                return deferred.promise;

            },
            findAllBusinessAddr: function(session_id) {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(BUSINESS_ADDRESS+'/'+session_id));
                return deferred.promise;

            },
            findAllBusinessAddrLatLong: function() {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(GET_LAT_LONG));
                return deferred.promise;

            },
            findDealById: function(dealId,viewerId) {
                
                var deferred = $q.defer();                
                deferred.resolve($http.get(SINGLE_DEAL+'/'+dealId+'/'+viewerId));
                return deferred.promise;
            },

            getDealRating: function (dealId) {
                var deferred = $q.defer();                
                deferred.resolve($http.get(GET_RATING+'/'+dealId));
                return deferred.promise;
            },

            getDealReviews: function (dealId) {
                var deferred = $q.defer();                
                deferred.resolve($http.get(GET_REVIEWS+'/'+dealId));
                return deferred.promise;
            },

            getDynamicRating: function () {
                var deferred = $q.defer(); 
                deferred.resolve(rating);
                return deferred.promise;
            },

            setDynamicRating: function (ratingValue) {
                var deferred = $q.defer();
                rating = ratingValue;     
                deferred.resolve(rating);
                return deferred.promise; 
            },

            createDeal: function (deal) {
                var promise = $http({
                    url: CREATE_DEAL,
                    method: 'POST',
                    data:   'biz_address_id='     +deal.bizAddrId+
                            '&newBizAddr='        +deal.newBizAddr+
                            '&deal_category='     +deal.dealCat+
                            '&deal_link='         +deal.deal_link+
                            '&deal_name='         +deal.deal_name+
                            '&deal_description='  +deal.deal_description+
                            '&deal_from='         +deal.from+
                            '&deal_price='        +deal.deal_price+
                            '&deal_short_desc='   +deal.deal_short_desc+
                            '&dealImage='         +encodeURIComponent(deal.dealImageData)+
                            '&dealIcon='          +encodeURIComponent(deal.dealIconData)+
                            '&deal_keyword='      +deal.deal_keyword+
                            '&deal_keyword_2='    +deal.deal_keyword_2+
                            '&deal_keyword_3='    +deal.deal_keyword_3+
                            '&deal_to='           +deal.to+
                            '&to_hours='          +deal.to_hours+
                            '&deal_video='        +deal.deal_video+
                            '&deal_zipcode='      +deal.deal_zipcode+
                            '&deal_favourite='    +deal.favourite+
                            '&deal_owner='        +deal.dealOwner+
                            '&deal_lat='          +deal.deal_lat+
                            '&deal_long='         +deal.deal_long+
                            '&deal_country='      +deal.deal_country+
                            '&deal_continent='    +deal.deal_continent+
                            '&deal_publish='      +deal.deal_publish+
                            '&deal_location_type='+deal.deal_location_type+
                            '&notify_date_time='  +deal.notify_date_time+
                            '&notify_hours='      +deal.notify_hours,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },

            editDeal: function (deal) {
                var promise = $http({
                    url: EDIT_DEAL,
                    method: 'POST',
                    data:   'biz_address_id='     +deal.bizAddrId+
                            '&newBizAddr='        +deal.newBizAddr+
                            '&deal_category='     +deal.dealCat+
                            '&deal_link='         +deal.deal_link+
                            '&deal_name='         +deal.deal_name+
                            '&deal_description='  +deal.deal_description+
                            '&deal_price='        +deal.deal_price+
                            '&deal_short_desc='   +deal.deal_short_desc+
                            '&dealImage='         +encodeURIComponent(deal.dealImageData)+
                            '&dealIcon='          +encodeURIComponent(deal.dealIconData)+
                            '&deal_keyword='      +deal.deal_keyword+
                            '&deal_keyword_2='    +deal.deal_keyword_2+
                            '&deal_keyword_3='    +deal.deal_keyword_3+
                            '&deal_video='        +deal.deal_video+
                            '&deal_zipcode='      +deal.deal_zipcode+
                            '&deal_favourite='    +deal.favourite+
                            '&deal_owner='        +deal.dealOwner+
                            '&deal_lat='          +deal.deal_lat+
                            '&deal_long='         +deal.deal_long+
                            '&deal_country='      +deal.deal_country+
                            '&deal_continent='    +deal.deal_continent+
                            '&deal_publish='      +deal.deal_publish+
                            '&deal_location_type='+deal.deal_location_type+
                            '&id='                +deal.id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },

            postReviewsOnDeal: function (reviews) {
                var promise = $http({
                    url: POST_REVIEWS,
                    method: 'POST',
                    data:   'deal_id='     +reviews.deal_id+
                            '&review='     +reviews.review+
                            '&reviewby='   +reviews.reviewby+
                            '&deal_owner=' +reviews.deal_owner,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },

            postRatingOnDeal: function (rating) {
                var promise = $http({
                    url: POST_RATING,
                    method: 'POST',
                    data:   'deal_id='      +rating.deal_id+
                            '&rating='      +rating.rating+
                            '&ratedby='     +rating.ratedby+
                            '&deal_owner='  +rating.deal_owner,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },

            postRatingDealPerformance: function (ratePerformance) {
                var promise = $http({
                    url: POST_DEAL_PERFORMANCE,
                    method: 'POST',
                    data:   'deal_id='      +ratePerformance.deal_id+
                            '&grade='       +ratePerformance.rating+
                            '&user='        +ratePerformance.user+
                            '&deal_owner='  +ratePerformance.deal_owner+
                            '&comment='     +ratePerformance.comment+
                            '&deal_name='   +ratePerformance.deal_name+
                            '&email='       +ratePerformance.email,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },

            publishUnpublishDeal: function (deal_publish, deal_id, deal_owner) {
                var promise = $http({
                    url: UNPUBLISH_DEAL,
                    method: 'POST',
                    data:   'deal_publish=' +deal_publish+
                            '&id='          +deal_id+
                            '&deal_owner='  +deal_owner,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },

            flagDeal: function (deal_id, deal_owner, flagby) {
                var promise = $http({
                    url: FLAG_DEAL,
                    method: 'POST',
                    data:   'deal_id='      +deal_id+
                            '&deal_owner='  +deal_owner+
                            '&flagby='      +flagby,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },

            setDealRange: function (deal_range, id) {
                var promise = $http({
                    url: DEAL_RANGE,
                    method: 'POST',
                    data:   'deal_range='   +deal_range+
                            '&id='          +id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },

            removeDeal: function (dealId) {
                var deferred = $q.defer();                
                deferred.resolve($http.get(DELETE_DEAL+'/'+dealId));
                return deferred.promise;
            },

            hourValues: function () {
                var deferred = $q.defer();                
                deferred.resolve($http.get(DEAL_SALE_HOURS));
                return deferred.promise;
            }

        }
    }).factory('LoginService',          function($q, $http, $window) {
        return {
            loginUser: function(user) {
                                
                var promise = $http({
                    url: USER_LOGIN,
                    method: 'POST',
                    data:   'username='         +user.email+
                            '&password='        +user.password+
                            '&device_id='       +user.deviceId+
                            '&device_type='     +user.device_type+
                            '&latitude='        +user.latitude+
                            '&longitude='       +user.longitude+
                            '&user_location='   +user.user_location+
                            '&country='         +user.country+
                            '&continent='       +user.continent,
                    headers: {
                        "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
                        "Accept": "application/json",
                        // "Access-Control-Allow-Credentials":true,
                        // 'authorization':'Basic dGF4aTphcHBsaWNhdGlvbg=='
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                    console.log(data);
                });    

                return promise;
                // 'username=manojks@smartdatainc.net&password=manojks'            
            },
            getLocationByLatLong: function(latitude,longitude) {

                var deferred = $q.defer();                
                deferred.resolve($http.get(GET_ADDR + latitude + ',' + longitude +'&key='+GEOCODER_API_KEY));
                return deferred.promise;

            }
        }
    }).factory('RegisterService',       function($q, $http) {
        return {
            registerUser: function(user) {

                var promise = $http({
                    url: USER_REGISTER,
                    method: 'POST',
                    data:   'first_name='   +user.firstname+
                            '&last_name='   +user.lastname+
                            '&phone='       +user.phone+
                            '&email='       +user.email+
                            '&password='    +user.password+
                            '&gender='      +user.gender+
                            '&zipcode='     +user.zip+
                            '&dob='         +user.dob+
                            '&profilePic='  +encodeURIComponent(user.profilePic)+
                            '&agree='       +user.agree+
                            '&role='        +user.role+
                            '&latitude='    +user.latitude+
                            '&longitude='   +user.longitude+
                            '&country='     +user.country+
                            '&continent='   +user.continent+
                            '&device_id='   +user.deviceId,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 

                // 'username=manojks@smartdatainc.net&password=manojks'

            }
        }
    }).factory('ContactService',        function($q, $http) {
        return {
            contactAdmin: function(user) {

                var promise = $http({
                    url: ADMIN_CONTACT,
                    method: 'POST',
                    data:   'first_name='   +user.firstname+
                            '&last_name='   +user.lastname+
                            '&phone='       +user.phone+
                            '&email='       +user.email+
                            '&message='     +user.message+                            
                            '&role='        +user.role,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 

                // 'username=manojks@smartdatainc.net&password=manojks'

            }
        }
    }).factory('ForgotService',         function($q, $http) {
        return {
            forgotUser: function(email) {

                // console.log(user);

                var promise = $http({
                    url: USER_FORGOT,
                    method: 'POST',
                    data:   'email='   +email,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 

                // 'username=manojks@smartdatainc.net&password=manojks'

            }
        }
    }).factory('LocationService',       function($q, $http) {
        return {
            getLocations: function() {
                var promise = $http.get(DEALS_LISTING).success(function(data, status, headers, config) {               
                    return data;
                });
                return promise;
            },
            getLocationByLatLong: function(latitude,longitude) {

                var deferred = $q.defer();                
                deferred.resolve($http.get(GET_ADDR + latitude + ',' + longitude +'&key='+GEOCODER_API_KEY));
                return deferred.promise;

            },
            getTimezoneByLatLong: function(latitude,longitude,timestamp) {

                var deferred = $q.defer();                 
                deferred.resolve($http.get(GET_TIMEZONE + latitude + ',' + longitude + '&timestamp=' + timestamp + '&key=' + GEOCODER_API_KEY));
                return deferred.promise;

            }
        }
    }).factory('AddressService',        function($q, $http) {
        return {
            addAddress: function (address) {
                var promise = $http({
                    url: ADD_BIZ_ADDRESS,
                    method: 'POST',
                    data:   'biz_address='  +address.biz_address+
                            '&biz_city='    +address.biz_city+
                            '&biz_state='   +address.biz_state+
                            '&biz_lat='     +address.biz_lat+
                            '&biz_long='    +address.biz_long+
                            '&biz_owner='   +address.biz_owner+
                            '&biz_country=' +address.biz_country+
                            '&biz_zipcode=' +address.biz_zipcode+
                            '&biz_name='    +address.biz_name,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },
            deleteAddress: function (address) {
                var promise = $http({
                    url: DELETE_BIZ_ADDRESS,
                    method: 'POST',
                    data:   'id='           +address.biz_id+
                            '&biz_status='  +address.biz_status,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },
            updateBizAddress: function (address) {
                var promise = $http({
                    url: UPDATE_BIZ_ADDRESS,
                    method: 'POST',
                    data:   'id='           +address.biz_id+
                            '&biz_address=' +address.biz_address+
                            '&biz_zipcode=' +address.biz_zipcode+
                            '&biz_lat='     +Number(address.biz_lat)+
                            '&biz_long='    +Number(address.biz_long)+
                            '&biz_owner='   +address.biz_owner+
                            '&biz_country=' +address.biz_country+
                            '&biz_city=' +address.biz_city+
                            '&biz_state=' +address.biz_state+
                            '&biz_name=' +address.biz_name,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },
            getLatLongByLocation: function(address) {

                var deferred = $q.defer();                
                deferred.resolve($http.get(GET_LAT_LONG + address +'&key='+GEOCODER_API_KEY));
                return deferred.promise;
                
            },
            getSingleBusinessAddress: function(id) {

                var deferred = $q.defer();                
                deferred.resolve($http.get(GET_SINGLE_BIZ+'/'+id));
                return deferred.promise;
                
            }
        }
    }).factory('CreditsService',        function($q, $http) {
        return {
            getCredits: function (user_id) {
               var deferred = $q.defer();                
                deferred.resolve($http.get(CHECK_CREDITS+'/'+user_id));
                return deferred.promise;
            },
            getPackages: function () {
               var deferred = $q.defer();                
                deferred.resolve($http.get(GET_PACKAGES));
                return deferred.promise;
            },
            getPurchaseHistory: function (user_id) {
               var deferred = $q.defer();                
                deferred.resolve($http.get(PURCHASE_HISTORY+'/'+user_id));
                return deferred.promise;
            },
            buyPackageViaCC: function (details) { 
                var promise = $http({
                    url: CREATE_PAYMENT,
                    method: 'POST',
                    data:   'user_id='          +details.user_id+
                            '&cc_number='       +details.cc_number+
                            '&cc_type='         +details.cc_type+
                            '&expire_month='    +details.expire_month+
                            '&expire_year='     +details.expire_year+
                            '&cvv='             +details.cvv+
                            '&first_name='      +details.first_name+
                            '&last_name='       +details.last_name+
                            '&mode='            +details.mode+
                            '&package_id='      +details.package_id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },
            buyPackageViaPaypal: function (id, user_id) { 
                var promise = $http({
                    url: CREATE_PAYMENT,
                    method: 'POST',
                    data:   '&mode=paypal'   +
                            '&package_id='   +id+
                            '&user_id='      +user_id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            },
            filterPurchaseHistory: function (filter) { 
                var promise = $http({
                    url: FILTER_HISTORY,
                    method: 'POST',
                    data:   '&user_id=' +filter.user_id+
                            '&from='    +filter.from_date+
                            '&to='      +filter.to_date,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            }
        }
    }).factory('ReviewsService',        function($q, $http) {
        return {
            findMyReveiws: function (user_id) {
               var deferred = $q.defer();                
                deferred.resolve($http.get(MY_REVIEWS+'/'+user_id));
                return deferred.promise;
            },
            updateMyReview: function (status, review_id) {
               var promise = $http({
                    url: UPDATE_REVIEW_STATUS,
                    method: 'POST',
                    data:   'id='  +review_id+
                            '&status='    +status,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            }
        }
    }).factory('SharingService',        function($q, $http) {
        return {
            getShares: function (id) {
               var deferred = $q.defer();                
                deferred.resolve($http.get(GET_SHARES+'/'+id));
                return deferred.promise;
            },
            addShare: function (deal_id, shareby, deal_owner, type) {
               var promise = $http({
                    url: POST_SHARE,
                    method: 'POST',
                    data:   'deal_id='      +deal_id+
                            '&shareby='     +shareby+
                            '&deal_owner='  +deal_owner+
                            '&type='        +type,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 
            }
        }
    }).factory('ProfileService',        function($q, $http) {
        return {
            editProfile: function(userProfileData) {

                var promise = $http({
                    url: USER_PROFILE_EDIT,
                    method: 'POST',
                    data:   'first_name='   +userProfileData.first_name+
                            '&last_name='   +userProfileData.last_name+
                            '&phone='       +userProfileData.phone+
                            '&zipcode='     +userProfileData.zipcode+
                            '&dob='         +userProfileData.dob+
                            '&_id='         +userProfileData._id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 

                // 'username=manojks@smartdatainc.net&password=manojks'

            },
            changeSharingText: function(userProfileData) {

                var promise = $http({
                    url: USER_PROFILE_EDIT,
                    method: 'POST',
                    data:   'share_message='            +userProfileData.share_message+
                            '&enable_share_message='    +userProfileData.enable_share_message+
                            '&_id='                     +userProfileData.user_id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            changeAppInviteText: function(userProfileData) {

                var promise = $http({
                    url: USER_PROFILE_EDIT,
                    method: 'POST',
                    data:   'invite_message='          +userProfileData.invite_message+
                            '&enable_invite_message='  +userProfileData.enable_invite_message+
                            '&_id='                    +userProfileData.user_id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise;

            },
            findProfileDetailsById: function(user_id) {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(USER_PROFILE_DETAIL+'/'+user_id));
                return deferred.promise;

            },
            changePassword: function(id, password) {

                var promise = $http({
                    url: USER_CHANGE_PASSWORD,
                    method: 'POST',
                    data:   'id='           +id+
                            '&password='    +password.newpass+
                            '&oldpassword=' +password.oldpass,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 

            }
        }
    }).factory('AboutService',          function($q, $http) {
        return {
            getAboutContent: function() {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(GET_ABOUT));
                return deferred.promise;

            }
        }
    }).factory('NotificationService',   function($q, $http) {
        return {
            getNotifications: function(user_id) {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(GET_NOTIFICATIONS + '/' + user_id));
                return deferred.promise;

            },
            seeNotification: function(id, deal_id) {

                var promise = $http({
                    url: SEEN_NOTIFICATIONS,
                    method: 'POST',
                    data:   'id='       +id+
                            '&deal_id=' +deal_id,
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded'
                    }
                }).success(function(data, status, headers, config) {
                    return data;
                });
                return promise; 

            }
        }
    }).factory('FaqService',            function($q, $http) {
        return {
            getFaq: function() {

                var deferred = $q.defer(); 
                deferred.resolve($http.get(GET_FAQ));
                return deferred.promise;

            }
        }
    }).factory('CheckService'  ,        function($q, $http, $state, $ionicPopup, $ionicModal){
        var obj = {}
        this.access = false;

        obj.checkPermission = function(){

            userData = JSON.parse(window.localStorage['userData']); 
            var deferred = $q.defer();                
            deferred.resolve($http.get(BUSINESS_ADDRESS+'/'+userData.session_id));

            deferred.promise.then(function (address) {
                businessAddress = address.data.data;
                if(businessAddress.length < 1){
                    
                    var alertPopup = $ionicPopup.alert({
                        title:    'No Bussiness Address Found!',
                        template: 'You\'ve to create atleast one Business Address to create deal.',
                        buttons:[
                          {
                            text: '<b>Ok</b>',
                            type: 'pink-white-theme-color'
                          }
                        ]
                    });

                    $state.go('app.bizAddress')
                }
            });


            return true;             
        }
        return obj;
    }).factory('AppInit'       ,        function($q, $cordovaSplashscreen, $ionicPlatform, $timeout) {
        return {
            splash: function() {

                var deferred = $q.defer();

                $ionicPlatform.ready(function(){
                    $timeout(function(){
                        $cordovaSplashscreen.hide();
                        deferred.resolve();
                    }, 1500);
                });

                return deferred.promise;
                
            }
        };
    });
