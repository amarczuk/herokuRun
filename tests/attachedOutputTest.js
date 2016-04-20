var attachedOutput = require( '../lib/attachedOutput' ),
    should = require( 'should' ),
    fs     = require( 'fs' ),
    tls    = require( 'tls' );

var createTLSServer = function( auth, message, input, callback ) {
    var options = {
      key: fs.readFileSync( __dirname + '/key/server-key.pem' ),
      cert: fs.readFileSync( __dirname + '/key/server-cert.pem' ),
      rejectUnauthorized: false
   };

    var server = tls.createServer( options, function( socket ) {
        
        var authDone = false;

        socket.setEncoding('utf8');

        socket.on( 'error', function( error ) {
        });

        socket.on( 'data', function( data ) {
            if ( !authDone ) {
                data.toString().should.equal( auth );
                authDone = true;
            } else {
                data.toString().should.equal( input );
                setTimeout( function() {
                    try {
                        socket.end();
                    } catch(e) {};
                }, 150 );
            }
        });

        setTimeout( function() {
            socket.write( message );
        }, 100 );

        if ( !input ) {
            setTimeout( function() {
                try {
                    socket.end();
                } catch(e) {};
            }, 200 );
        }
        
    });

    server.listen( 8000, function() {
        callback();
    });

    return server;
}

suite('Unit Test for heroku attached log output', function () {

    var tlsServer;

    teardown(function () {
        if ( tlsServer ) {
            try {
                tlsServer.close();
            } catch(e) {};
        }
    });

    test('creates tsl connection to given url, sends auth code and passes data', function (done) {
        
        var auth = 'test1',
            msg  = 'I am heroku output',
            logurl = 'tls://localhost:8000/' + auth,
            connected = false,
            dataReceived = false;

        tlsServer = createTLSServer( auth, msg, null, function() {

            new attachedOutput( logurl, { rejectUnauthorized: false } )
                .on( 'connected', function( auth ) {
                    auth.should.be.false;
                    connected = true;
                })
                .on( 'data', function( data ) {
                    data.toString().should.equal( msg );
                    dataReceived = true;
                })
                .on( 'end', function() {
                    connected.should.be.true;
                    dataReceived.should.be.true;
                    done();
                });

        } );

    });

    test('emits error when cannot connect', function (done) {
        
        var auth = 'test1',
            msg  = 'I am heroku output',
            logurl = 'tls://localhost:8000/' + auth,
            connected = false,
            dataReceived = false;

        tlsServer = createTLSServer( auth, msg, null, function() {

            new attachedOutput( logurl )
                .on( 'connected', function( auth ) {
                    connected = true;
                })
                .on( 'data', function( data ) {
                    dataReceived = true;
                })
                .on( 'error', function( err ) {
                    err.message.toLowerCase().replace( /_/g, ' ' ).should.containEql( 'unable to verify' );
                    connected.should.be.false;
                    dataReceived.should.be.false;
                    done();
                });

        } );

    });

    test('writes back to the server', function (done) {
        
        var auth = 'test1',
            msg  = 'I am heroku output',
            logurl = 'tls://localhost:8000/' + auth,
            toWrite = 'my command',
            connected = false,
            dataReceived = false;

        tlsServer = createTLSServer( auth, msg, toWrite, function() {

            var logger = new attachedOutput( logurl, { rejectUnauthorized: false } );

            logger
                .on( 'connected', function( auth ) {
                    auth.should.be.false;
                    connected = true;
                })
                .on( 'data', function( data ) {
                    data.toString().should.equal( msg );
                    dataReceived = true;
                    logger.send( toWrite );
                })
                .on( 'end', function() {
                    connected.should.be.true;
                    dataReceived.should.be.true;
                    done();
                });

        } );

    });

});