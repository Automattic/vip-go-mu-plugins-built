# Releasing

## Versioning

Remote Data Blocks uses [Semantic Versioning](https://semver.org/).

## Release process

1. Checkout the `trunk` branch and ensure it is up to date.
2. Run the release script: `./bin/release <major|minor|patch>`
3. Push the new release branch to the remote repository and create a pull request.
4. Merge the pull request into `trunk`.

The release process from there is automated using GitHub Actions and will publish a new release on GitHub if the version has changed.
