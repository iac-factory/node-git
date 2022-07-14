var path = require( "path" );
var local = path.join.bind( path, __dirname );

var exec = require( local( "../utils/execPromise" ) );
var buildFlags = require( local( "../utils/buildFlags" ) );

/*** @param exception {Error | NodeJS.ErrnoException | null} */
function Handle(exception = null) {
  if ( exception ) {
    console.error( "[@iac-factory/node-git] ERROR - Could not finish preinstall" );
    console.error( exception );
    process.exit( 1 );
  }
}

/*** NPM Installation */
module.exports = function prepareForBuild() {
  console.log( "[@iac-factory/node-git] Running Pre-Installation Script" );

  return exec( "npm -v" )
    .then(
      /***
       *
       * @param npm {string}
       * @returns {Promise<void>|*}
       */
      function (npm) {
        const version = npm.split( "." );
        if ( version && version[0] && parseInt( version[0] ) < 3 ) {
          console.log( "[@iac-factory/node-git] npm@2 Installed; Pre-Loading Required Package(s)" );
          return exec( "npm install --ignore-scripts" );
        }

        return Promise.resolve();
      },
      function () {
        console.debug( "Skipping npm Version Check in Favor of Yarn" );
      }
    )
    .then( function () {
      if ( buildFlags.isGitRepo ) {
        var submodules = require( local( "submodules" ) );
        var generate = require( local( "../generate" ) );
        return submodules()
          .then( function () {
            return generate();
          } );
      }
    } );
};

/*** CLI Installation */
if ( require.main === module ) {
  module.exports().catch( Handle );
}
