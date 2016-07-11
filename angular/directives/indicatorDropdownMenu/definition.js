(function(){
	"use strict";

	/**
	 * @ngdoc directive
	 * @name app.directive:indicatorDropdownMenu
	 * @restrict EA
	 * @param {object} ng-model Object to build the dropdown tree of, must have the following format:
	 * {
	 * 	[
	 * 	 	{
	 * 	 	name: "",
			icon: "",
			onClick: "",
			children: [...]
			},
			...
	 * 	]
	 * }
	 * @param {boolean} root Set true for first use, needed because this directive calls itself recursively
	 * @description
	 * This directive builds a drop down menu out of an object, with all its nested children etc.
	 */
	angular.module('app.directives').directive( 'indicatorDropdownMenu', function() {

		return {
			restrict: 'EA',
			templateUrl: 'views/directives/indicatorDropdownMenu/indicatorDropdownMenu.html',
			controller: 'IndicatorDropdownMenuCtrl',
			controllerAs: 'vm',
			scope: {
				ngModel: '=',
				root: '='
			},
			link: function( scope, element, attrs){
				//

				console.log(scope.ngModel);
			}
		};

	});

})();
