const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path')
const fs = require('fs')

const SCOPE_DSN = 'SCOPE_DSN';

async function run() {
  try {
    const homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    const dsn = core.getInput('dsn') || process.env[SCOPE_DSN];
    let envVars = Object.assign({}, process.env);

    if (!dsn) {
      throw Error('Cannot find the Scope DSN');
    }

    if (dsn) {
      console.log(`DSN has been set.`);
      envVars[SCOPE_DSN] = dsn;
    }

    const scopeLogsPath = `${homePath}/scope-logs`;
    core.info("Creating scope log folder...")
    fs.mkdirSync(scopeLogsPath);
    envVars["SCOPE_LOG_ROOT_PATH"] = scopeLogsPath;

    const execOptions = {
      ignoreReturnCode: true,
      env: envVars
    }

    core.info("Installing Agent installer...");
    await exec.exec(`go get -v github.com/undefinedlabs/scope-go-agent-installer`, null, execOptions);
    core.info("Executing installer...");
    await exec.exec(`${homePath}/go/bin/scope-go-agent-installer -folder=.`, null, execOptions);

    core.info("Downloading dependencies...");
    await exec.exec(`go get`, null, execOptions);
    await exec.exec(`go get -u go.undefinedlabs.com/scopeagent`, null, execOptions);

    core.info("Running benchmark tests...");
    await exec.exec(`go test -run Benchmark -bench=.`, null, execOptions);

    core.info("Running normal tests...");
    await exec.exec(`go test -covermode=count -coverprofile=${scopeLogsPath}/coverage.out -v ./...`, null, { env: envVars });

  } catch (error) {
    core.setFailed(error.message);
  }
}


run();