var generateJson = require("./scripts/generateJson");
var generateNativeCode = require("./scripts/generateNativeCode");
var generateMissingTests = require("./scripts/generateMissingTests");
var submoduleStatus = require("../lifecycleScripts/submodules/getStatus");

module.exports = function generate() {
  console.log("[@iac-factory/node-git] Generating native code");

  function tryGenerate(numRetries = 3) {
    // There appears to be a race condition in the generate code somewhere
    // Until we fix that, we should try to generate a few times before
    try {
      generateJson();
      generateNativeCode();
      generateMissingTests();
    } catch (error) {
      if (numRetries > 0) {
        console.log("[@iac-factory/node-git] WARNING - Failed to generate native code, trying again");
        tryGenerate(numRetries - 1);
      } else {
        throw error;
      }
    }
  }

  return submoduleStatus()
    .then(function(statuses) {
      var dirtySubmodules = statuses
        .filter(function(status) {
          return status.onNewCommit
            || status.needsInitialization
            || status.workDirDirty;
        });

      if (dirtySubmodules.length) {
        console.warn("[@iac-factory/node-git] WARNING - Some submodules are out-of-sync");
        dirtySubmodules.forEach(function(submodule) {
          console.warn("[@iac-factory/node-git]\t" + submodule.name);
        });
      }
    })
    .then(tryGenerate)
    .catch(function(e) {
      console.error("[@iac-factory/node-git] ERROR - Could not generate native code");
      console.error(e);
      throw e;
    });
}

if (require.main === module) {
  module.exports();
}
