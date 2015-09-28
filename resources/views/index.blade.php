<!doctype html>
<html ng-app="app">

<head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <link rel="stylesheet" href="/css/vendor.css">
    <link rel="stylesheet" href="/css/app.css">
    <title>23°</title>
    <!--[if lte IE 10]>
    <script type="text/javascript">document.location.href = '/unsupported-browser'</script>
    <![endif]-->
</head>
<body>
    <header ui-view="header"></header>
    <div ui-view="map" class="Map_Container"></div>
    <div ui-view="sidebar"></div>
    <div ui-view="main" class="Page"></div>
    <div class="cssload-container" ng-if="stateIsLoading">
        <div class="cssload-whirlpool"></div>
    </div>
    <script src="https://cdn.rawgit.com/jondavidjohn/hidpi-canvas-polyfill/master/dist/hidpi-canvas.min.js"></script>
    <script src="https://cdn.rawgit.com/mbostock/d3/master/d3.min.js"></script>
    <script src="https://cdn.rawgit.com/devTristan/pbf/master/dist/pbf.min.js"></script>
    <script src="https://rawgit.com/devTristan/vector-tile-js/master/dist/vectortile.min.js"></script>

    <script src="/js/vendor.js"></script>
    <script src="https://cdn.rawgit.com/devTristan/hoverboard/master/dist/hoverboard.js"></script>
    <script src="js/Leaflet.MapboxVectorTile.js"></script>
    <script src="/js/app.js"></script>
    {{--livereload--}} @if ( Config::get('app.debug') )
    <script type="text/javascript">
        document.write('<script src="//localhost:35729/livereload.js?snipver=1" type="text/javascript"><\/script>')
    </script>
    @endif
</body>

</html>
