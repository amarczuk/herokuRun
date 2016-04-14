var attachedOutput = require( '../lib/attachedOutput' ),
    should = require( 'should' ),
    fs     = require( 'fs' ),
    tls    = require( 'tls' );

var createTLSServer = function( auth, message, callback ) {
    var options = {
      key: fs.readFileSync( __dirname + '/key/server-key.pem' ),
      cert: fs.readFileSync( __dirname + '/key/server-cert.pem' ),
      rejectUnauthorized: false
   };

    var server = tls.createServer( options, function( socket ) {
        
        socket.setEncoding('utf8');

        socket.on( 'error', function( error ) {
            console.log( error );
        });

        socket.on( 'data', function( data ) {
            data.toString().should.equal( auth );
        });

        setTimeout( function() {
            socket.write( message );
        }, 100 );

        setTimeout( function() {
            socket.end();
        }, 200 );
        
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
            tlsServer.close();
        }
    });

    test('creates tsl connection to given url, sends auth code and passes data', function (done) {
        
        var auth = 'test1',
            msg  = 'I am heroku output',
            logurl = 'tls://localhost:8000/' + auth,
            connected = false,
            dataReceived = false;

        tlsServer = createTLSServer( auth, msg, function() {

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

        tlsServer = createTLSServer( auth, msg, function() {

            new attachedOutput( logurl )
                .on( 'connected', function( auth ) {
                    connected = true;
                })
                .on( 'data', function( data ) {
                    dataReceived = true;
                })
                .on( 'error', function( err ) {
                    err.message.should.equal( 'unable to verify the first certificate' );
                    connected.should.be.false;
                    dataReceived.should.be.false;
                    done();
                });

        } );

    });

});