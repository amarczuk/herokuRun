var herokuRunner = require( '../lib/herokuRunner' ),
    attachedOutput = require( '../lib/attachedOutput' ),
    should = require( 'should' ),
    sinon  = require( 'sinon' ),
    heroku = function() {
        return {
            apps: function() {},
            dynos: function() {},
            create: function() {}
        }
    };

suite('Unit Test for herokuRunner', function () {

    var fakes;

    setup(function () {
        fakes = sinon.sandbox.create();
    });

    teardown(function () {
        fakes.restore();
    });

    test('run creates connection and returns attached output', function (done) {
        
        var herokuMock = new heroku();
        var size = 'dyno-size';
        var options = {
            env : { LINES : "40" }
        }
        var cmd = 'runme';
        var app = 'appname';
        var info = {
            attach_url: 'http://localhost:10101'
        }
        var herokuFake = fakes.mock( herokuMock );

        herokuFake.expects( 'apps' ).once().withArgs( app ).returnsThis();
        herokuFake.expects( 'dynos' ).once().returnsThis();
        herokuFake.expects( 'create' ).once().withArgs( sinon.match( {
            attach: true,
            command: cmd,
            env: {
                COLUMNS: "80",
                LINES: options.env.LINES
            },
            size: size
        } ) ).yields( null, info );

        var runner = new herokuRunner( herokuMock, app, options );

        runner.run( cmd, size, function( err, logger ) {
            
            should.equal( err, null );
            ( logger instanceof attachedOutput ).should.be.true;
            logger.on( 'error', function( err ) {} );
            fakes.verify();
            done();
        });
        
    });

    test('run errors when command is missing', function (done) {
        
        var herokuMock = new heroku();
        var size = 'dyno-size';
        var options = {
            env : { LINES : "40" }
        }
        var cmd = 'runme';
        var app = 'appname';
        var info = {
            attach_url: 'http://localhost:10101'
        }
        var herokuFake = fakes.mock( herokuMock );

        herokuFake.expects( 'apps' ).never();

        var runner = new herokuRunner( herokuMock, app, options );

        runner.run( null, size, function( err, logger ) {
            
            err.message.should.equal( 'Command not specified' );
            should.not.exist( logger );

            fakes.verify();
            done();
        });
        
    });

    test('Defaults options and size', function (done) {
        
        var herokuMock = new heroku();
        var size = null;
        var options = {
        }
        var cmd = 'runme';
        var app = 'appname';
        var info = {
            attach_url: 'http://localhost:10101'
        }
        var herokuFake = fakes.mock( herokuMock );

        herokuFake.expects( 'apps' ).once().withArgs( app ).returnsThis();
        herokuFake.expects( 'dynos' ).once().returnsThis();
        herokuFake.expects( 'create' ).once().withArgs( sinon.match( {
            attach: true,
            command: cmd,
            env: {
                COLUMNS: "80",
                LINES: "24"
            },
            size: "standard-1X"
        } ) ).yields( null, info );

        var runner = new herokuRunner( herokuMock, app, options );

        runner.run( cmd, size, function( err, logger ) {
            
            should.equal( err, null );
            ( logger instanceof attachedOutput ).should.be.true;
            logger.on( 'error', function( err ) {} );
            
            fakes.verify();
            done();
        });
        
    });

    test('run errors if dyno is not created', function (done) {
        
        var herokuMock = new heroku();
        var size = null;
        var options = {
        }
        var cmd = 'runme';
        var app = 'appname';
        var info = {
            attach_url: 'http://localhost:10101'
        }
        var herokuFake = fakes.mock( herokuMock );

        herokuFake.expects( 'apps' ).once().withArgs( app ).returnsThis();
        herokuFake.expects( 'dynos' ).once().returnsThis();
        herokuFake.expects( 'create' ).once().withArgs( sinon.match( {
            attach: true,
            command: cmd,
            env: {
                COLUMNS: "80",
                LINES: "24"
            },
            size: "standard-1X"
        } ) ).yields( 'Heroku Error!' );

        var runner = new herokuRunner( herokuMock, app, options );

        runner.run( cmd, size, function( err, logger ) {
            
            should.equal( err, 'Heroku Error!' );
            should.not.exist( logger );

            fakes.verify();
            done();
        });
        
    });

});