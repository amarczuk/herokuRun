var herokuRun = require( '../lib/herokuRun' ),
	runner = herokuRun( 'token', 'my-app-name' );
 
runner.run( 'pwd && ls', function( err, logger ) {
 
        if ( err ) {
        	console.log( err );
        	return;
        }
 
        logger
            .on( 'connected', function( auth ) {
               	console.log( 'connected' );
               	console.log( (auth) ? 'authorized' : 'unauthorized' );
            })
            .on( 'data', function( data ) {
                process.stdout.write( data.toString() );
            })
            .on( 'end', function() {
                console.log( 'connection ended' );
            });
    } );