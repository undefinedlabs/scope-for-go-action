const core = require('@actions/core');
const exec = require('@actions/exec');
const path = require('path')
const fs = require('fs')

const SCOPE_DSN = 'SCOPE_DSN';

async function run() {
  try {
    const homePath = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    const dsn = core.getInput('dsn') || process.env[SCOPE_DSN];
    const test_command = core.getInput('test-command');
    const benchmark_command = core.getInput('benchmark-command');
    const auto_instrument = core.getInput('auto-instrument') || 'true';
    const enable_benchmarks = core.getInput('enable-benchmarks') || 'true';
    const race_detector = core.getInput('race-detector') || 'false';
    const no_parallel = core.getInput('no-parallel') || 'false';

    let envVars = Object.assign({}, process.env);

    if (!dsn) {
      throw Error('Cannot find the Scope DSN');
    }

    if (dsn) {
      console.log(`DSN has been set.`);
      envVars[SCOPE_DSN] = dsn;
    }

    const scopeLogsPath = `${homePath}/.scope-results`;
    if (!fs.existsSync(scopeLogsPath)) {
      core.info("Creating scope log folder...")
      fs.mkdirSync(scopeLogsPath);
    }
    envVars["SCOPE_LOG_ROOT_PATH"] = scopeLogsPath;

    const execOptions = {
      ignoreReturnCode: true,
      env: envVars
    }

    let addArg = ' -covermode=count';
    if (race_detector) {
      addArg = ' -covermode=atomic -race';
    }
    if (no_parallel) {
      addArg += ' -parallel 1';
    }
    let tCommand = `go test -v${addArg} -coverprofile=${scopeLogsPath}/coverage.out ./...`;
    let bCommand = `go test -run Benchmark -bench=.`;
    if (test_command) {
      tCommand = test_command;
    }
    if (benchmark_command) {
      bCommand = benchmark_command;
    }

    if (auto_instrument === "true") {
      core.info("Installing Agent installer...");
      await exec.exec(`go get -v github.com/undefinedlabs/scope-go-agent-installer`, null, execOptions);
      core.info("Executing installer...");
      await exec.exec(`${homePath}/go/bin/scope-go-agent-installer -folder=.`, null, execOptions);
    }

    core.info("Downloading dependencies...");
    await exec.exec(`go get -u go.undefinedlabs.com/scopeagent`, null, execOptions);

    core.info("Running Tests...");
    await exec.exec(tCommand, null, { env: envVars });

    if (enable_benchmarks === "true") {
      core.info("Running Benchmarks...");
      await exec.exec(bCommand, null, execOptions);
    }

  } catch (error) {
    core.setFailed(error.message);
  }
}


run();