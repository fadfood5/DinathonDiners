angular.module("App", ['ngMaterial'])
    .controller("HelloController", function($scope, $http, $window, $mdDialog, $mdToast) {
        'ngReact';
        //Global Declarations
        this.$scope = $scope;
        this.$mdDialog = $mdDialog;
        this.$mdToast = $mdToast;

        //Login
        $scope.mailLogin = "fadfood5@gmail.com";
        $scope.passLogin = "12341234";

        this.login = function() {
            $http.post('http://localhost/login', {
                "em": this.$scope.mailLogin,
                "pass": this.$scope.passLogin
            }).then(function(success) {
                console.log("authenticated");
                console.log(success);
                window.location.href = '/home';
            }, function(error) {
                console.log(error);
            });
        }

        //Register
        $scope.mailRegister = "";
        $scope.passRegister = "";
        $scope.passRegisterConfirm = "";

        this.register = function() {
            $http.post('http://localhost/register', {
                "email": this.$scope.mailRegister,
                "password": this.$scope.passRegister,
                "passwordConfirm": this.$scope.passRegisterConfirm
            }).then(function(success) {
                console.log("authenticated");
                console.log(success);
                //window.location.href = '/admin';
            }, function(error) {
                console.log(error);
            });
        }

        //Logout
        this.logout = function() {
            $http.post('http://localhost/logout').then(function(success) {
                console.log("Logout");
                console.log(success);
            }, function(error) {
                console.log(error);
            });
        }

        $scope.names = [];
        $scope.nameHeader = [];
        $scope.rowSel = "";
        this.names = function() {
            $http({
                method: 'GET',
                url: 'http://localhost:80/getNames'
            }).then(function(result) {
                console.log("ok");
                console.log(result.data.n.user[0].eventName[0].names);
                $scope.names = result.data.n.user[0].eventName[0].names;
                $scope.nameHeader = result.data.n.user[0].eventName[0].names[0].food;
                //console.log($scope.names);
                //console.log($scope.nameHeader.food);
            }, function(error) {
                console.log(error);
            });
        }
        this.names();

        this.goToNames = function() {
            window.location.href = '/names';
        }

        $scope.logMe = function(i) {
            console.log(i);
            return true;
        }

        $scope.eventName = "";

        this.uploadNames = function() {
            var that = this;
            $http.post('http://localhost/addNames', {
                "event": this.$scope.eventName,
            }).then(function(success) {
                console.log(success);
                window.location.href = '/names';
            }, function(error) {
                console.log(error);
            });
        }
        $scope.checkInStudentId = '';
        $scope.status = '';
        $scope.currentFood = 0;
        $scope.showCheckIn = false;
        $scope.selected = [];
        this.showCheckIn = function(i) {
            this.$scope.currentFood = i;
            console.log(this.$scope.currentFood);
            this.$scope.showCheckIn = true;
        }

        this.chooseCurrentFood = function(i) {
            $scope.currentFood = i;
        }


        $scope.success = false;
        $scope.noSuccess = false;
        this.switch = function(i) {
            if (i == 0) {
                $scope.success = true;
                $scope.noSuccess = false;
            } else if (i == 1) {
                $scope.success = false;
                $scope.noSuccess = true;
            }
        }

        $scope.counter = 0;
        this.checkInUser = function(i, j) {
						this.$scope.checkInStudentId = '';
            if ($scope.counter == 0) {
                $scope.selected.push(i);
                $scope.status = "Success!";
                this.switch(0);
                $scope.counter++;
                $http.post('http://localhost/checkInUser', {
                    "id": i,
                    "curr": j,
                }).then(function(success) {
                    console.log(success);
                    var t = success.data.s;
                    // if (t === "Success") {
                    //     $scope.status = "Success!"
                    // } else if (t === "Exists") {
                    //     $scope.status = "Already got food :(";
                    // }
                }, function(error) {
                    console.log(error);
                });
            } else {
                console.log(this.$scope.currentFood);
                if (!$scope.selected.includes(i)) {
                    $scope.selected.push(i);
                    this.switch(0);
                    $scope.status = "Success!";
                    $http.post('http://localhost/checkInUser', {
                        "id": i,
                        "curr": j,
                    }).then(function(success) {
                        console.log(success);
                        var t = success.data.s;
                        // if (t === "Success") {
                        //     $scope.status = "Success!"
                        // } else if (t === "Exists") {
                        //     $scope.status = "Already got food :(";
                        // }
                    }, function(error) {
                        console.log(error);
                    });
                } else {
                    this.switch(1);
                    $scope.status = "Already got food :(";
                }
                $scope.counter++;
            }
            console.log($scope.selected);
        }
    });
