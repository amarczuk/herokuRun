"use strict";

var tls     = require( 'tls' ),
    url     = require( 'url' ),
    merge   = require( 'merge' ),
    attachedOutput = require( './attachedOutput' ),
    defaultOptions = {
        attach: true,
        env: { 
            COLUMNS: "80",
            LINES: "24" 
        },
        size: "standard-1X"
    };

function herokuRunner( heroku, app, options ) {
    this.app     = app;
    this.heroku  = heroku;
    this.options = merge.recursive( true, defaultOptions, options ); 
};

herokuRunner.prototype.run = function( cmd, size, callback ) {

    if ( !cmd ) {
        callback( new Error( 'Command not specified' ) );
        return this;
    }

    var options = merge( true, this.options );

    if ( size && callback ) options.size = size;
    if ( !callback ) callback = size;

    options.command = cmd;
 
    this.heroku
        .apps( this.app )
        .dynos()
        .create( options,
                 function( err, info ) {                     
                    if ( err ) {
                        callback( err );
                        return;
                    }
                    callback( null, 
                              new attachedOutput( info['attach_url'] )
                            );
                 } );
    return this;
};

exports = module.exports = herokuRunner;