(function () {
	"use strict";

	angular.module('app.controllers').controller('IndexCtrl', function ($scope, $rootScope,$filter, $state, $timeout, ToastService, VectorlayerService, initialData, leafletData, DataService) {
		// Variable definitions
		var vm = this;
		vm.map = null;
		vm.dataServer = initialData.data;
		vm.structureServer = initialData.indexer;
		vm.structure = "";
		vm.mvtScource = VectorlayerService.getLayer();
		vm.nodeParent = {};
		vm.selectedTab = 0;
		vm.current = "";
		vm.tabContent = "";
		vm.toggleButton = 'arrow_drop_down';
		vm.menueOpen = true;
		vm.info = false;
		vm.closeIcon = 'close';
		vm.compare = {
			active: false,
			countries: []
		};
		vm.display = {
			selectedCat: ''
		};

		//Function definitons
		vm.showTabContent = showTabContent;
		vm.setTab = setTab;
		vm.setState = setState;
		vm.setCurrent = setCurrent;
		vm.setSelectedFeature = setSelectedFeature;
		vm.getRank = getRank;
		vm.getOffset = getOffset;
		vm.getTendency = getTendency;
		vm.mapGotoCountry = mapGotoCountry;
		vm.checkComparison = checkComparison;
		vm.toggleOpen = toggleOpen;
		vm.toggleInfo = toggleInfo;
		vm.toggleDetails = toggleDetails;
		vm.toggleComparison = toggleComparison;
		vm.toggleCountrieList = toggleCountrieList;


		vm.calcTree = calcTree;

		activate();

		function activate() {
			vm.structureServer.then(function(structure){
				vm.dataServer.then(function(data){
					vm.data = data;
					vm.structure = structure;
					createCanvas();
					drawCountries();
					if($state.params.item){
						vm.setState($state.params.item);
						calcRank();
					}
				})
			});

		}

		function showTabContent(content) {
			if (content == '' && vm.tabContent == '') {
				vm.tabContent = 'rank';
			} else {
				vm.tabContent = content;
			}
			vm.toggleButton = vm.tabContent ? 'arrow_drop_up' : 'arrow_drop_down';
		};
		function setState(item) {
			vm.setCurrent(getNationByIso(item));
			fetchNationData(item);
		};

		function toggleOpen() {
			vm.menueOpen = !vm.menueOpen;
			vm.closeIcon = vm.menueOpen == true ? 'chevron_left' : 'chevron_right';
		}
		function setCurrent(nat) {
			vm.current = nat;
			vm.setSelectedFeature();
		};

		function setSelectedFeature(iso) {
			if (vm.mvtSource) {
				$timeout(function () {
					vm.mvtSource.layers.countries_big_geom.features[vm.current.iso].selected = true;
				})
			}
		};
		function calcRank() {
			if(!vm.current){
				return;
			}
			var rank = 0;
			angular.forEach(vm.data, function(item) {
				item[vm.structure.score_field_name] = parseFloat(item[vm.structure.score_field_name]);
				item['score'] = parseInt(item['score']);
			})
			var filter = $filter('orderBy')(vm.data, [vm.structure.score_field_name, "score"], true);
			for (var i = 0; i < filter.length; i++) {
				if (filter[i].iso == vm.current.iso) {
					rank = i + 1;
				}
			}
			vm.current[vm.structure.score_field_name+'_rank'] = rank;
			vm.circleOptions = {
					color:vm.structure.color,
					field:vm.structure.score_field_name+'_rank'
			}
		}
		function getRank(country){
			var filter = $filter('orderBy')(vm.data, [vm.structure.score_field_name, "score"], true);
			var rank = 0;
			angular.forEach(filter, function(item, key){
				if(item.country == country.country){
					rank = key;
				}
			});
			return rank+1;
		}
		function toggleInfo() {
			vm.info = !vm.info;
		};

		function toggleDetails() {
			return vm.details = !vm.details;
		};
		function fetchNationData(iso){
			DataService.getOne('nations', iso).then(function (data) {
				vm.country = data;
				mapGotoCountry(iso);
			});
		}
		function mapGotoCountry(iso) {
			DataService.getOne('nations/bbox', [iso]).then(function (data) {
				vm.bbox = data;
			});
		}

		function checkComparison(want) {
			if (want && !vm.compare.active || !want && vm.compare.active) {
				vm.toggleComparison();
			}
		}

		function toggleComparison() {
			vm.compare.countries = [vm.current];
			vm.compare.active = !vm.compare.active;
			if (vm.compare.active) {
				vm.setTab(2);
				$rootScope.greyed = true;
				vm.mvtSource.options.mutexToggle = false;
				vm.mvtSource.setStyle(invertedStyle);
			} else {
				$rootScope.greyed = false;
				angular.forEach(vm.mvtSource.layers.countries_big_geom.features, function (feature) {
					feature.selected = false;
				});
				vm.mvtSource.layers.countries_big_geom.features[vm.current.iso].selected = true;
				vm.mvtSource.options.mutexToggle = true;
				vm.mvtSource.setStyle(countriesStyle);
				DataService.getOne('nations/bbox', [vm.current.iso]).then(function (data) {
					vm.bbox = data;
				});
			}
		};

		function toggleCountrieList(country) {
			var found = false;
			angular.forEach(vm.compare.countries, function (nat, key) {
				if (country == nat && nat != vm.current) {
					vm.compare.countries.splice(key, 1);
					found = true;
				}
			});
			if (!found) {
				vm.compare.countries.push(country);
			};
			var isos = [];
			angular.forEach(vm.compare.countries, function (item, key) {
				isos.push(item.iso);
			});
			if (isos.length > 1) {
				DataService.getOne('nations/bbox', isos).then(function (data) {
					vm.bbox = data;
				});
			}

			return !found;
		};

		function getOffset() {
			if (!vm.current) {
				return 0;
			}
			return (vm.getRank(vm.current) - 2) * 16;
		};

		function getTendency() {
			if (!vm.current) {
				return 'arrow_drop_down'
			}
			return vm.current.percent_change > 0 ? 'arrow_drop_up' : 'arrow_drop_down';
		};

		function setTab(i) {
			vm.activeTab = i;
		}

		function getParent(data) {
			var items = [];
			angular.forEach(data.children, function (item) {
				if (item.column_name == vm.display.selectedCat.type) {
					vm.nodeParent = data;
				}
				getParent(item);
			});
			return items;
		}

		function calcTree() {
			getParent(vm.structure);
		};

		function getNationByName(name) {
			var nation = {};
			angular.forEach(vm.data, function (nat) {
				if (nat.country == name) {
					nation = nat;
				}
			});
			return nation;
		};

		function getNationByIso(iso) {
			var nation = {};
			angular.forEach(vm.data, function (nat) {
				if (nat.iso == iso) {
					nation = nat;
				}
			});
			return nation;
		};

		function createCanvas(colors) {

			vm.canvas = document.createElement('canvas');
			vm.canvas.width = 256;
			vm.canvas.height = 10;
			vm.ctx = vm.canvas.getContext('2d');
			var gradient = vm.ctx.createLinearGradient(0, 0, 280, 10);
			gradient.addColorStop(1, 'rgba(255,255,255,0)');
			gradient.addColorStop(0.53, vm.structure.color || 'rgba(128, 243, 198,1)');
			gradient.addColorStop(0, 'rgba(102,102,102,1)');
			vm.ctx.fillStyle = gradient;
			vm.ctx.fillRect(0, 0, 270, 10);
			vm.palette = vm.ctx.getImageData(0, 0, 256, 1).data;
			document.getElementsByTagName('body')[0].appendChild(vm.canvas);
		}

		function updateCanvas(color) {
			var gradient = vm.ctx.createLinearGradient(0, 0, 280, 10);
			gradient.addColorStop(1, 'rgba(255,255,255,0)');
			gradient.addColorStop(0.53, color);
			gradient.addColorStop(0, 'rgba(102,102,102,1)');
			vm.ctx.fillStyle = gradient;
			vm.ctx.fillRect(0, 0, 270, 10);
			vm.palette = vm.ctx.getImageData(0, 0, 256, 1).data;
		};

		function invertedStyle(feature) {
			var style = {};
			var iso = feature.properties.adm0_a3;
			var nation = getNationByIso(iso);
			var field = vm.display.selectedCat.type || 'score';


			var colorPos = parseInt(256 / 100 * nation[field]) * 4;
			var color = 'rgba(' + vm.palette[colorPos] + ', ' + vm.palette[colorPos + 1] + ', ' + vm.palette[colorPos + 2] + ',' + vm.palette[colorPos + 3] + ')';
			style.color = 'rgba(0,0,0,0)';
			style.outline = {
				color: 'rgba(0,0,0,0)',
				size: 0
			};
			style.selected = {
				color: color,
				outline: {
					color: 'rgba(0,0,0,0.3)',
					size: 2
				}
			};
			return style;
		};

		function countriesStyle(feature) {

			var style = {};
			var iso = feature.properties.adm0_a3;
			var nation = getNationByIso(iso);
			var field = vm.structure.score_field_name || 'score';
			var type = feature.type;
			switch (type) {
			case 3: //'Polygon'
				if (nation[field]) {
					var colorPos = parseInt(256 / 100 * nation[field]) * 4;
					var color = 'rgba(' + vm.palette[colorPos] + ', ' + vm.palette[colorPos + 1] + ', ' + vm.palette[colorPos + 2] + ',' + vm.palette[colorPos + 3] + ')';
					style.color = 'rgba(' + vm.palette[colorPos] + ', ' + vm.palette[colorPos + 1] + ', ' + vm.palette[colorPos + 2] + ',0.7)'; //color;
					style.outline = {
						color: color,
						size: 1
					};
					style.selected = {
						color: 'rgba(' + vm.palette[colorPos] + ', ' + vm.palette[colorPos + 1] + ', ' + vm.palette[colorPos + 2] + ',0.3)',
						outline: {
							color: 'rgba(66,66,66,0.9)',
							size: 2
						}
					};
					break;
				} else {
					style.color = 'rgba(255,255,255,0)';
					style.outline = {
						color: 'rgba(255,255,255,0)',
						size: 1
					};
				}
			}
			if (feature.layer.name === 'countries_big_geom_label') {
				style.staticLabel = function () {
					var style = {
						html: feature.properties.name,
						iconSize: [125, 30],
						cssClass: 'label-icon-text'
					};
					return style;
				};
			}
			return style;
		};

		$scope.$watch('vm.current', function (n, o) {
			if (n === o) {
				return;
			}
			if(n.iso) {
				if(o.iso){
					vm.mvtSource.layers.countries_big_geom.features[o.iso].selected = false;
				}
				calcRank();
				fetchNationData(n.iso);
				$state.go('app.index.show.selected', {
					index: $state.params.index,
					item: n.iso
				});
			} else {
				$state.go('app.index.show',{
					index: $state.params.index
				});
			}
		});
		$scope.$watch('vm.display.selectedCat', function (n, o) {
			if (n === o) {
				return
			}
			if (n)
				updateCanvas(n.color);
			else {
				updateCanvas('rgba(128, 243, 198,1)');
			};
			vm.calcTree();
			if (vm.compare.active) {
				$timeout(function () {
					vm.mvtSource.setStyle(invertedStyle);
				});
			} else {
				$timeout(function () {
					vm.mvtSource.setStyle(countriesStyle);
				});
			}
			if (vm.current.iso) {
				$state.go('app.index.show.selected', {
					index: n.name,
					item: vm.current.iso
				})
			} else {
				$state.go('app.index.show', {
					index: n.name
				})
			}

		});
		$scope.$watch('vm.bbox', function (n, o) {
			if (n === o) {
				return;
			}
			var lat = [n.coordinates[0][0][1],
					[n.coordinates[0][0][0]]
				],
				lng = [n.coordinates[0][2][1],
					[n.coordinates[0][2][0]]
				]
			var southWest = L.latLng(n.coordinates[0][0][1], n.coordinates[0][0][0]),
				northEast = L.latLng(n.coordinates[0][2][1], n.coordinates[0][2][0]),
				bounds = L.latLngBounds(southWest, northEast);
			var pad = [
				[350, 200],
				[0, 200]
			];
			if (vm.compare.active) {
				pad = [
					[350, 0],
					[0, 0]
				];
			}
			vm.map.fitBounds(bounds, {
				paddingTopLeft: pad[0],
				paddingBottomRight: pad[1],
				maxZoom: 6
			});
		});

		$scope.$on("$stateChangeSuccess", function (event, toState, toParams, fromState, fromParams) {

			/*console.log($)
			if (toState.name == "app.index.show") {
					vm.current = "";
			} else if (toState.name == "app.index.show.selected") {

				if(toParams.index != fromParams.index){
					console.log('anders')
				}
				console.log(toParams.item);
				vm.setState(toParams.item);
				calcRank();
				//vm.mvtSource.options.mutexToggle = true;
				DataService.getOne('nations', vm.current.iso).then(function (data) {
					vm.current.data = data;
					DataService.getOne('nations/bbox', [vm.current.iso]).then(function (data) {
						vm.bbox = data;
					});
				});
			} else if (toState.name == "app.index.show.selected.compare") {
				vm.setState(toParams.item);
				//$scope.activeTab = 2;
				/*DataService.getOne('nations', toParams.item).then(function (data) {
					vm.country = data;
					DataService.getOne('nations/bbox', [vm.country.iso]).then(function (data) {
						vm.bbox = data;
					});
				});
			} else {
				vm.current = "";
			}*/
		});

		function drawCountries() {
			leafletData.getMap('map').then(function (map) {
				vm.map = map;
				vm.mvtSource = VectorlayerService.getLayer();
				console.log(vm.mvtSource);
				$timeout(function () {
					vm.mvtSource.setStyle(countriesStyle);
				});
				vm.mvtSource.options.onClick = function (evt, t) {
					if (!vm.compare.active) {
						var c = getNationByIso(evt.feature.properties.adm0_a3);
						if (typeof c.rank != "undefined") {
							vm.current = getNationByIso(evt.feature.properties.adm0_a3);
						} else {
							ToastService.error('No info about this location!');
						}
					} else {
						var c = getNationByIso(evt.feature.properties.adm0_a3);
						if (typeof c.rank != "undefined") {
							vm.toggleCountrieList(c);
						} else {
							ToastService.error('No info about this location!');
						}
					}
				}
			});
		};
	});
})();