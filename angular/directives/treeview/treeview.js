(function () {
	"use strict";

	angular.module('app.controllers').controller('TreeviewCtrl', function ($filter) {
		//
		var vm = this;
		vm.selectedItem = selectedItem;
		vm.childSelected = childSelected;
		vm.toggleItem = toggleItem;
		vm.onDragComplete = onDragComplete;
		vm.onDropComplete = onDropComplete;

		function onDragComplete(data,evt){
       console.log("drag success, data:", data);
    }
    function onDropComplete(index, data,evt){
				return vm.items.splice(index, 1);
    }

		function selectedItem(item) {
			if(typeof vm.item === "undefined") return false;
			var found = false;
			angular.forEach(vm.item[vm.options.type], function (entry, key) {
				if (entry.id == item.id) {
					found = true;
				}
			});
			return found;
		}
		function childSelected(children){
			var found = false;
			angular.forEach($filter('flatten')(children), function(child){
					if(selectedItem(child)){
						found = true;
					}
			});
			return found;
		}
		function toggleItem(item){
			if(typeof vm.item[vm.options.type] === "undefined") vm.item[vm.options.type] = [];
			var found = false, index = -1;
			angular.forEach(vm.item[vm.options.type], function(entry, i){
				if(entry.id == item.id){
					found = true;
					index = i;
				}
			})
			index === -1 ? vm.item[vm.options.type].push(item) : vm.item[vm.options.type].splice(index, 1);
		}
	});

})();