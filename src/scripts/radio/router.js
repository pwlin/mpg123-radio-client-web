/**
 * @include "../../../config.js"
 * @include "./index.js"
 * @include "./nowplaying.js"
 */
radio.router = {};

radio.router.instance = null;

radio.router.setRoutes = function() {
    radio.router.instance = new Router();
	
    radio.router.instance.get('#/nowplaying', function(req, next) {
        radio.nowPlaying.index(req, next);
    });
    
    radio.router.instance.errors(404, function() {
        radio.router.instance.redirect('#/nowplaying');
    });
    radio.router.instance.run();
};