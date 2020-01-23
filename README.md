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
  - name: Set up Go 1.13
    uses: actions/setup-go@v1
    with:
      go-version: 1.13
      id: go

  - name: Check out code into the Go module directory
    uses: actions/checkout@v1

  - name: Get dependencies
    run: |
        go get -v -t -d ./...
        if [ -f Gopkg.toml ]; then
            curl https://raw.githubusercontent.com/golang/dep/master/install.sh | sh
            dep ensure
        fi

  - name: Scope for Go
    uses: undefinedlabs/scope-for-go-action@v1
    with:
      dsn: ${{secrets.SCOPE_DSN}} # required
      
```