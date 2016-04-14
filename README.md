#Heroku Run

Simple module that allows to run commands on one-off heroku dynos from within the node applications.

##How to nstall

``` bash
$ npm install herokuRun --save
```

##How to use

``` javascript
var herokuRun = require( 'herokuRun' ),
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
``` 


##How to test

Add heroku credentials to _tests/conf/heroku.json_ for end-to-end test to pass.

``` json
{
	"heroku" : { "token": "placeholder_for_valid_heroku_token" },
	"app": "placeholder_for_valid_heroku_app_name"
}
``` 
