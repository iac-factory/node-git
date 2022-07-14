var buildFlags = require( "../utils/buildFlags" );
var spawn = require( "child_process" ).spawn;
var path = require( "path" );

module.exports = function install() {
  console.log( "[@iac-factory/node-git] Running Installation Executable" );

  var nodePreGyp = "node-pre-gyp";

  if ( process.platform === "win32" ) {
    nodePreGyp += ".cmd";
  }

  var args = [ "install" ];

  if ( buildFlags.mustBuild ) {
    console.info( "[@iac-factory/node-git] Pre-Built Download Disabled (Local)" );
    console.info( "[@iac-factory/node-git] Building the Binding from Source" );

    args.push( "--build-from-source" );

    if ( buildFlags.debugBuild ) {
      console.info( "[@iac-factory/node-git] Building with Debug Parameter(s)" );

      args.push( "--debug" );
    }
  } else {
    args.push( "--fallback-to-build" );
  }

  return new Promise( function (resolve, reject) {
    var spawnedNodePreGyp = spawn( nodePreGyp, args, {
      env: Object.assign( {}, process.env, {
        npm_config_node_gyp: path.join( __dirname, "..", "node_modules",
          "node-gyp", "bin", "node-gyp.js" )
      } )
    } );

    spawnedNodePreGyp.stdout.on( "data", function (data) {
      console.info( data.toString().trim() );
    } );

    spawnedNodePreGyp.stderr.on( "data", function (data) {
      console.error( data.toString().trim() );
    } );

    spawnedNodePreGyp.on( "close", function (code) {
      if ( !code ) {
        resolve( void 0 );
      } else {
        reject( code );
      }
    } );
  } )
    .then( function () {
      console.info( "[@iac-factory/node-git] Completed Installation Successfully" );
    } );
};

// Called on the command line
if ( require.main === module ) {
  module.exports()
    .catch( function (e) {
      console.error( "[@iac-factory/node-git] ERROR - Exception(s) Caused Installation Failure" );
      console.error( "[@iac-factory/node-git] ERROR - Signal via Error Code" + ":", e );
      process.exit( e );
    } );
}
