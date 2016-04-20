#Heroku Run

[![Build Status](https://travis-ci.org/amarczuk/herokuRun.svg?branch=master)](https://travis-ci.org/amarczuk/herokuRun)

Simple module that allows to run commands on one-off heroku dynos from within the node applications.
May beused for task automation.

##How to nstall

``` bash
$ npm install herokuRun --save
```

##How to use

Run simple command (_demo/command.js_):

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

Run ```bash``` and interact with dyno (_demo/bash.js_):

``` javascript
var herokuRun = require( 'herokuRun' ),
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
``` 


##How to test

Add heroku credentials to _tests/conf/heroku.json_ for end-to-end test to pass.

``` json
{
	"herokutoken": "placeholder_for_valid_heroku_token",
	"app": "placeholder_for_valid_heroku_app_name"
}
``` 

Run ```npm install && npm test```.
