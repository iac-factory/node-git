var buildFlags = require( "../utils/buildFlags" );
var subprocess = require( "child_process" );
var path = require( "path" );
var os = require("os");

module.exports = function install() {
  console.log( "[@iac-factory/node-git] Running Installation Executable" );

  if (os.platform() === "darwin") {
      console.log();
      console.log("NOTICE");
      console.log();
      console.log("IaC-Factory's Node.js Binding for 'libgit2' is in pre-release.");
      console.log();
      console.log("The repository is currently @iac-factory/node-git, and is");
      console.log("private until a more stable version becomes available.");
      console.log();
      console.log("While publicly published via 'npm', please note that");
      console.log("substantial incompatibilities may arise, and it's likely the");
      console.log("following package may receive a rename (node-libgit2)");
      console.log("depending on availability.");
      console.log();

      subprocess.execSync("sleep 15");
  }

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
    var spawnedNodePreGyp = subprocess.spawn( nodePreGyp, args, {
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
