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

    var options = merge( true, this.options );

    if ( size && callback ) options.size = size;
    if ( !callback && size && typeof size == 'function' ) {
        callback = size;
    } else if ( !callback && size ) {
        options.size = size;
    }

    options.command = cmd;
    var that = this;

    if ( !cmd && callback ) {
        callback( new Error( 'Command not specified' ) );
        return this;
    }

    if ( !cmd ) {
        return Promise.reject( new Error( 'Command not specified' ) );
    }
 
    var run = function(resolve, reject) {
        that.heroku
            .apps( that.app )
            .dynos()
            .create( options,
                     function( err, info ) {                     
                        if ( err ) {
                            if (reject) {
                                reject( err );
                            } else {
                                resolve( err );
                            }
                            return;
                        }
                        if (!reject) {
                            resolve( null, new attachedOutput( info['attach_url'] ) );
                        } else {
                            resolve( new attachedOutput( info['attach_url'] ) );
                        }
                     } );
    };

    if (!callback) {
        return new Promise(run);
    }

    run(callback);

    return this;
};

exports = module.exports = herokuRunner;