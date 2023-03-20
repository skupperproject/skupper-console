# How to Contribute

This document outlines some of the conventions on development workflow.

## Getting Started

- Fork the repository on GitHub
- Read the [README](README.md) for build and test instructions
- Play with the project, submit bugs, submit patches!

## Contribution Flow

This is a rough outline of what a contributor's workflow looks like:

- Create a topic branch from where you want to base your work (usually main).
- Make commits of logical units.
- Make sure your commit messages are in the proper format (see below).
- Push your changes to a topic branch in your fork of the repository.
- Make sure the tests pass, and add any new tests as appropriate.
- Submit a pull request to the original repository.

### Format of the Commit Message

We follow a rough convention for commit messages that is designed in this way:

```bash
<type>[optional scope]: <subject>

[optional body]
```

example:

```bash
feat: allow provided config object to extend other configs
```

you can run **`yarn commit`** to make a valid commit.

- the subject must be in Sentence case (Capital first letter)
- the **type** is restricted to the following values:

`feat,fix,docs,style,refactor,perf,test,build,ci,chore,revert`

 (you can find more info in *commitlint.config.js* -> *prompt* -> *types*)
