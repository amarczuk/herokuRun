"use strict"

var herokuRunner = require( './herokuRunner.js' ),
	heroku 		 = require( 'heroku-client' );

function herokuRun( token, app, options ) {
	var client = new heroku( { token: token } );
    return new herokuRunner( client, app, options );
};

exports = module.exports = herokuRun;