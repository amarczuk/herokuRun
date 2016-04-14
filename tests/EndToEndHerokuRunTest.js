var herokuRun = require( '../lib/herokuRun.js' ),
    should = require( 'should' ),
    conf   = require( __dirname + '/conf/heroku.json' );

suite('EndToEnd Test for herokuRun', function () {

  
    test('runs command on heroku one-off dyno', function (done) {
        this.timeout(20000);

        var runner = herokuRun( conf.heroku.token, conf.app );

        runner.run( 'pwd', function( err, logger ) {

                should.not.exist( err );

                var fullData = '';
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

    test('errors when app does not exist', function (done) {
        this.timeout(20000);

        var runner = herokuRun( conf.heroku.token, 'iamnonexistingapp' );

        runner.run( 'pwd', function( err, logger ) {
                should.not.exist( logger );
                err.message.should.containEql( '404' );
                done();
            } );
    });

    test('errors when using wrong token', function (done) {
        this.timeout(20000);

        var runner = herokuRun( 'wrongtoken', conf.app );

        runner.run( 'pwd', function( err, logger ) {
                should.not.exist( logger );
                err.message.should.containEql( '401' );
                done();
            } );
    });

});