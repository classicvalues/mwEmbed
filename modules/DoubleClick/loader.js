( function( mw, $){

mw.addResourcePaths({
	"mw.DoubleClick": "mw.DoubleClick.js"
});

$( mw ).bind( 'newEmbedPlayerEvent', function( event, embedPlayer ){
	$( embedPlayer ).bind( 'KalturaSupport_CheckUiConf', function( event, $uiConf, callback ){
		if( embedPlayer.getKalturaConfig( 'doubleClickIMA', 'plugin' ) ){
			mw.load( 'mw.DoubleClick', function(){
				new mw.DoubleClickIMA( embedPlayer, callback );
			});
		} else {
			callback();
		}
	});
});

})( window.mw, jQuery);
