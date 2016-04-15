var herokuRun = require( '../lib/herokuRun' ),
	runner = herokuRun( 'token', 'my-app-name' );
 
runner.run( 'bash', function( err, logger ) {
 
        if ( err ) {
        	console.log( err );
        	return;
        }
 
        logger
            .on( 'connected', function( auth ) {
               	console.log( 'connected' );
               	console.log( (auth) ? 'authorized' : 'unauthorized' );
                process.stdin.on('data', function(chunk) {
                    logger.send(chunk);
                });

            })
            .on( 'data', function( data ) {
                process.stdout.write( data.toString() );
            })
            .on( 'end', function() {
                console.log( 'connection ended' );
                process.stdin.end();
            });
    } );