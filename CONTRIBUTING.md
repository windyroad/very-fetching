# Contributing to @windyroad/very-fetching

First off, thanks for taking the time to contribute! Here are some guidelines to help ensure a smooth contribution process.

## Code of Conduct

This project adheres to the [Contributor Covenant](https://www.contributor-covenant.org/) Code of Conduct. By participating, you are expected to uphold this code.

## Getting Started

- Make sure you have Node.js and npm (or yarn) installed.
- Fork the repository on GitHub.
- Clone your forked repository to your machine.
- Install the dependencies by running `npm install`.

## Making Changes

- Create a branch for your changes. Use a descriptive name, for example, `add-new-feature` or `fix-issue-123`.
- Make your changes in the new branch. Please follow the existing coding style.
- Write tests that cover your changes.
- Run `npm test` to ensure your changes don't break existing functionality and your new tests are passing.
- Update the documentation to reflect your changes, if necessary.

## Managing Releases

This project uses [Changesets](https://github.com/atlassian/changesets) to manage releases. Changesets is a tool that helps automate the process of creating and publishing new versions of a package.

To create a new release:

1. Create a new branch for your changes.
2. Make your changes in the new branch.
3. Run `npx changeset add` to create a new Changeset.
4. Commit the Changeset file and your other changes.
5. Push your changes to your fork on GitHub.
6. Submit a pull request against the main repository.
7. Once your pull request is merged, the Changeset will be automatically published to npm.

## Code Reviews

Once you've submitted a pull request, maintainers will review your code. They may provide feedback and request changes. This is a normal part of the review process, and provides valuable learning opportunities.

Please be patient while waiting for your code to be reviewed. The maintainers are volunteers and may not be able to review your code immediately.

## Reporting Issues

If you find a bug or have a suggestion for a new feature, please [open a new issue on GitHub](https://github.com/windyroad/very-fetching/issues). When reporting a bug, please include as much information as possible about how to reproduce it. This should include your environment (like your Node.js version), any error messages, and steps to reproduce the bug.