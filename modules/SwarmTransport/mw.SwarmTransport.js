/**
 * Add the messages text: 
 */
 
mw.includeAllModuleMessages();

/** 
* Define mw.SwarmTransport object: 
*/
mw.SwarmTransport = {
	
	addPlayerHooks: function(){	
		var _this = this; 
		// Bind some hooks to every player:
		$j( mw ).bind( 'newEmbedPlayerEvent', function( event, swapedPlayerId ) {
			// Setup local reference to embedPlayer interface
			var embedPlayer = $j( '#' + swapedPlayerId ).get(0);
											
			// Setup the "embedCode" binding to swap in an updated url
			
			$j( embedPlayer ).bind( 'checkPlayerSourcesEvent', function( event, callback ) {		
				// Confirm SwarmTransport add-on is available ( defines swarmTransport var )  
				if( typeof window['swarmTransport'] != 'undefined' ){					
					// Add the swarm source
					mw.log(" SwarmTransport :: checkPlayerSourcesEvent " + swapedPlayerId);
					_this.addSwarmSource( embedPlayer, callback );
				} else {								
					// No swarm support just directly issue the callback 
					callback();	
				}
			} );
			
			// Check if we have a "recommend" binding and provide an xpi install link			
			mw.log('bind::addControlBindingsEvent');
			$j( embedPlayer ).bind( 'addControlBindingsEvent', function(){				
				if( mw.getConfig( 'SwarmTransport.recommend' ) &&  
					typeof window['swarmTransport'] == 'undefined' &&
					$j.browser.mozilla ) 
				{
					embedPlayer.controlBuilder.doWarningBindinng( 
						'recommendSwarmTransport',
						_this.getRecomendSwarmMessage()						
					);
				}
			});
					
		} );	
		
		
		// Add the swarmTransport player to available player types: 
		$j( mw ).bind( 'EmbedPlayerManagerReady', function( event ) {
			// Add the swarmTransport playerType	
			mw.EmbedTypes.players.defaultPlayers['video/swarmTransport'] = ['Native'];
			
			// Build the swarm Transport Player
			var swarmTransportPlayer = new mediaPlayer( 'swarmTransportPlayer', ['video/swarmTransport' ], 'Native' );
			
			// Add the swarmTransport "player"
			mw.EmbedTypes.players.addPlayer( swarmTransportPlayer );	
		});
					
	},
	
	addSwarmSource: function( embedPlayer, callback ) {
		var _this = this;

		// xxx todo: also grab the webm source if supported.  
		var source = embedPlayer.mediaElement.getSources( 'video/ogg' )[0];	
		if( ! source ){
			mw.log("Warning: addSwarmSource: could not find video/ogg source to generate torrent from");
			callback();
			return ;
		}		
		// Setup the torrent request:
		var torrentLookupRequest = {
			'url' : mw.absoluteUrl( source.getSrc() )
		};
				
		// Setup function to run in context based on callback result
		$j.getJSON(
			mw.getConfig( 'SwarmTransport.torrentLookupUrl' ) + '?jsonp=?', 
			torrentLookupRequest, 
			function( data ){
				// Check if the torrent is ready:
				if( !data.torrent ){
					mw.log( "SwarmTransport:  Torrent not ready status: " + data.status.text );
					callback();
					return ;
				} 					
				mw.log( 'SwarmTransport: addSwarmSource for: ' + source.getSrc()  + "\n\nGot:" + data.torrent );				
				embedPlayer.mediaElement.tryAddSource( 
					$j('<source />')
					.attr( {
						'type' : 'video/swarmTransport',
						'title': gM('mwe-swarmtransport-stream-ogg'), 
						'src': 'tribe://' + data.torrent,
						'default' : true // Mark as default source
					} )
					.get( 0 )
				);				
				callback();
			}
		);		
	}, 
	
	getRecomendSwarmMessage: function(){
		//xxx an xpi link would be nice ( for now just link out to the web site ) 
		return gM( 'mwe-swarmtransport-recommend', 'http://wikipedia.p2p-next.org/download/' );			
	}
	
};

// Add player bindings for swarm Transport 
mw.SwarmTransport.addPlayerHooks();