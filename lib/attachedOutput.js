"use strict";

var tls     = require( 'tls' ),
    url     = require( 'url' ),
    util    = require( 'util' ),
    EventEmitter = require( 'events').EventEmitter;

function attachedOutput( logurl, options ) {

    var that = this;

    if ( !options ) {
        options = {};
    }

    var parsedUrl = url.parse( logurl );

    try {
        this.socket = tls.connect( parsedUrl.port, parsedUrl.hostname, options, function() {
            that.emit( 'connected', that.socket.authorized );
            that.socket.write( parsedUrl.path.replace( '/', '' ) );
        });
    } catch ( err ) {
        this.emit( 'error', err );
        return;
    }
    
    this.socket.setEncoding( 'utf8' );

    this.socket.on('data', function( data ) {
        that.emit( 'data', data );
    });

    this.socket.on('error', function( err ) {
        that.emit( 'error', err );
    });

    this.socket.on('end', function() {
        that.emit( 'end' );
    });

};

util.inherits( attachedOutput, EventEmitter );

attachedOutput.prototype.kill = function() {
    this.socket.destroy();
    return this;
};

exports = module.exports = attachedOutput;