var herokuRun = require( '../lib/herokuRun.js' ),
    should = require( 'should' ),
    nconf   = require( 'nconf' );

nconf.argv().env().file( __dirname + '/conf/heroku.json' );

suite('EndToEnd Test for herokuRun', function () {
  
    test('runs command on heroku one-off dyno', function (done) {
        this.timeout(20000);

        var runner = herokuRun( nconf.get( 'herokutoken' ), nconf.get( 'app' ), { size: "free" } );

        runner.run( 'pwd', function( err, logger ) {

                should.not.exist( err );

                var fullData = '', 
                    dataReceived = false, 
                    connected = false;

                logger
                    .on( 'connected', function( auth ) {
                        auth.should.be.true;
                        connected = true;
                    })
                    .on( 'data', function( data ) {
                        fullData += data.toString();
                        dataReceived = true;
                    })
                    .on( 'end', function() {
                        connected.should.be.true;
                        dataReceived.should.be.true;
                        fullData.should.containEql( 'rendezvous' );
                        fullData.should.containEql( '/app' );
                        done();
                    });
            } );
    });

    test('runs bash on heroku one-off dyno and sends exit command', function (done) {
        this.timeout(30000);

        var runner = herokuRun( nconf.get( 'herokutoken' ), nconf.get( 'app' ), { size: "free" } );

        runner.run( 'bash', function( err, logger ) {

                should.not.exist( err );

                var fullData = '', 
                    dataReceived = false, 
                    connected = false;

                logger
                    .on( 'connected', function( auth ) {
                        auth.should.be.true;
                        connected = true;
                    })
                    .on( 'data', function( data ) {
                        fullData += data.toString();
                        if ( !dataReceived && fullData.indexOf( '$' ) != -1 ) {
                            dataReceived = true;
                            logger.send( 'pwd && exit\u000D' );
                        }
                    })
                    .on( 'end', function() {
                        connected.should.be.true;
                        dataReceived.should.be.true;
                        fullData.should.containEql( 'rendezvous' );
                        fullData.should.containEql( '/app' );
                        fullData.should.containEql( 'exit' );
                        done();
                    });
            } );
    });

    test('errors when app does not exist', function (done) {
        this.timeout(20000);

        var runner = herokuRun( nconf.get( 'herokutoken' ), 'iamnonexistingapp' );

        runner.run( 'pwd', function( err, logger ) {
                should.not.exist( logger );
                err.message.should.containEql( '404' );
                done();
            } );
    });

    test('errors when using wrong token', function (done) {
        this.timeout(20000);

        var runner = herokuRun( 'wrongtoken', nconf.get( 'app' ) );

        runner.run( 'pwd', function( err, logger ) {
                should.not.exist( logger );
                err.message.should.containEql( '401' );
                done();
            } );
    });

});