(function(){
    "use strict";

    angular.module('app.services').factory('VectorlayerService', function(){

        return{
          data:{
            layer: '',
            name:'23_countries'
          },
          setLayer: function(l){
            return this.data.layer = l;
          },
          getLayer: function(){
            return this.data.layer;
          },
          getName: function(){
            return this.data.name;
          }
        }
    });

})();
