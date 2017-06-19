/**
 * Created by ajayguptapnp on 13-06-2017.
 */
var scotchTodo = angular.module('hotelManagement', ['ngAnimate', 'ui.bootstrap']);
scotchTodo.config(['$qProvider', function ($qProvider) {
    $qProvider.errorOnUnhandledRejections(false);
}]);
angular.module('hotelManagement').controller('mainController', function ($scope, $http, $sce,$q,$uibModal ) {


    $scope.selected = undefined;
    var service = new google.maps.places.AutocompleteService();

   var placeservice = new google.maps.places.PlacesService(document.createElement('div'));



    //Type ahead search for just location
    $scope.getLoc = function (val) {
        var deferred = $q.defer();
        service.getQueryPredictions({ input: val,
            types :['locality','sublocality','postal_code','country']}, function(predictions, status) {

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var places = [];
                for (var i = 0; i < predictions.length; ++i) {
                    places.push({
                        id: predictions[i].place_id,
                        value: predictions[i].description,
                        label: predictions[i].description,
                        type:"location"
                    });
                }

                    deferred.resolve(places);

            }


         })
        return deferred.promise;

    };

    //Type ahead search for location and hotels
    $scope.searchHotelAndLoc=function (val) {
        var deferred = $q.defer();
        service.getQueryPredictions({ input: val,
            types :['locality','sublocality','postal_code','country']}, function(predictions, status) {

            if (status === google.maps.places.PlacesServiceStatus.OK) {
                var places = [];
                for (var i = 0; i <(predictions.length>2?2:predictions.length); ++i) {
                    places.push({
                        id: predictions[i].place_id,
                        value: predictions[i].description,
                        label: predictions[i].description,
                        type:"location"
                    });
                }
                $http.get('/api/searchHotels',{
                    params:{
                        key:val
                    }
                }).then(function(data){
                    var hotels=data.data
                    if(hotels.length!=0){
                        for (var i = 0; i <hotels.length; ++i) {
                            places.push({
                                id: hotels[i]._id,
                                value: hotels[i].name,
                                label: hotels[i].description,
                                type: "hotel"
                            });
                        }
                    }


                    console.log(data.data)
                    deferred.resolve(places);
                },function(data){
                    deferred.resolve(places);
                    alert("entered here1")
                })

            }


        })
        return deferred.promise;

    };

    //Get place details by placeId
    $scope.getPlaceDetails=function(placeId){
        placeservice.getDetails({placeId:placeId},function(placeDetails,status){

            $scope.selectedLocation={}
            $scope.selectedLocation.addressLine1=placeDetails.formatted_address
            $scope.selectedLocation.longitude = placeDetails.geometry.location.lng()
            $scope.selectedLocation.latitude = placeDetails.geometry.location.lat()
            angular.forEach(placeDetails.address_components, function (val, i) {
                if (val.types[0] == "postal_code") {
                    $scope.selectedLocation.postalCode = val.long_name;

                }
                if (val.types[0] == "country") {
                    $scope.selectedLocation.country = val.long_name;

                }
                if(val.types[0] == "administrative_area_level_1"){
                    $scope.selectedLocation.state = val.long_name;
                }
                //city :- "administrative_area_level_2"
                if (val.types[0] == "locality" && val.long_name != null) {
                    $scope.selectedLocation.city = val.long_name;

                } else if (($scope.selectedLocation.city == null || $scope.selectedLocation.city == undefined || $scope.selectedLocation.city == '') && val.types[0] == "administrative_area_level_2") {
                    $scope.selectedLocation.city = val.long_name;

                }else if (($scope.selectedLocation.city == null || $scope.selectedLocation.city == undefined || $scope.selectedLocation.city == '') && val.types[0] == "administrative_area_level_3") {
                    $scope.selectedLocation.city = val.long_name;

                }else if (($scope.selectedLocation.city == null || $scope.selectedLocation.city == undefined || $scope.selectedLocation.city == '') && val.types[0] == "administrative_area_level_1") {
                    $scope.selectedLocation.city = val.long_name;

                }
            })
           console.log( $scope.selectedLocation)

        })
    }

    //Create Hotel
   $scope.createHotel=function(){
       var formData={
           name:$scope.formData.name,
           description:$scope.formData.desc,
           address:JSON.stringify($scope.selectedLocation)
       }
       $http.post("/api/createHotel",formData).then(function(data){
           alert("Hotel Created")
       },function(data){
           alert(data.data.message)
       })
   }

    //Open details of Hotel
    $scope.openHotelsDetail=function(val){
        if(val.type=='hotel'){
            $http.get('/api/getHotelById',{
                params:{
                    key:val.id
                }
            }).then(function(data){
                $scope.selectedHotel=data.data;

                $("#myModal").modal("show")
            },function(err){
                console.log(err.data)
            })
        }

    }
})