![logo](scope_logo.svg)

# Scope for Go

GitHub Action to run your tests automatically instrumented with the [Scope Go agent](https://docs.scope.dev/docs/go-installation).

## About Scope

[Scope](https://scope.dev) gives developers production-level visibility on every test for every app – spanning mobile, monoliths, and microservices.

## Usage

1. Set Scope DSN inside Settings > Secrets as `SCOPE_DSN`.
2. Add a step to your GitHub Actions workflow YAML that uses this action:

```yml
steps:
  - name: Set up Go 1.14
    uses: actions/setup-go@v1
    with:
      go-version: 1.14
      id: go

  - name: Check out code into the Go module directory
    uses: actions/checkout@v1

  - name: Get dependencies
    run: go get -v -t -d ./...

  - name: Scope for Go
    uses: undefinedlabs/scope-for-go-action@v2
    with:
      dsn: ${{secrets.SCOPE_DSN}} # required
      auto-instrument: true # optional: Auto instrument the source code with the scope agent
      enable-benchmarks: true # optional: Enable the benchmarks execution
      test-command: # optional: The command to execute when running tests
      benchmark-command: # optional: The command to execute when running benchmarks
      race-detector: #optional: Enable the race detector to the test command
      no-parallel: #optional: Adds `-parallel 1` to the test command (enables CodePath for `t.Parallel()` tests)
      version: #optional: Sets a Go Agent version (by default the latest stable release)
```