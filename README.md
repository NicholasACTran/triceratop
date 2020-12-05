# Triceratop
## Deno's Premiere BDD Testing Framework
[![nest badge](https://nest.land/badge-large.svg)](https://nest.land/package/triceratop)

Behavior-Driven Development (BDD) is a development methodology, similar to Test-Driven Development, where the testing scenarios are written in plain English, and act as a source of truth for testing and development. Triceratop acts as a parser and a testing framework for BDD, using the [Gherkin Language Syntax](https://cucumber.io/docs/gherkin/reference/) and Typescript to create feature files and test files.

NOTE: Triceratop is minimally complete, not feature complete at the moment. See below for possible missing features.

### Installation
```
deno install -Afq --unstable https://raw.githubusercontent.com/NicholasACTran/triceratop/master/triceratop.ts
```

### File Structure

When generating and using triceratop CLI, it expects the tests to be in the same directory, in the format:

```
project
|___features
|   |   test_feature_1.feature
|   |   test_feature_2.feature
|   |   ...
|___steps
|   |   test_feature_1.ts
|   |   test_feature_2.ts
|   |   ...
```

Where each .feature file in the features folder correlates directly with a .ts file in the steps folder with the same filename. If there aren't feature/steps directories, triceratop will create it on the fly.

### Generating Test Code

By running a triceratop CLI command, it would go through each .feature file and generate a .ts file with the same name, containing the functions that encapsulate the steps in the .feature file.

Example:
```bash
triceratop generate
```

### Running Tests

By running a triceratop CLI command, it should go through each .feature file (or a specific one) and use the .feature file to search for the specific step functions in the correlated .ts function and run a test using the underlying Deno test framework.

Example:
```bash
triceratop test
```

### How to Contribute

We love to get more help implementing improvements and features! Our suggested starting place to investigate is the top-level triceratop.ts file, and following the imports from there. Most of the testing functionality can be found in ./lib/mod.ts, while most of the parsing functionality is found in the ./util folder. See below for some possible things that need to be implemented.

### Things That Need to Be Done

- Parsing
  - [ ] Implement better error handling
  - [ ] Remove dangling commas when creating typescript files
- Testing
  - [ ] Create TestDefinitions for functions with parameters
  - [X] Handle global variables
  - [ ] Implement flag to test one file at a time
  - [ ] Implement stubs/mocks/fakes
- General
  - [ ] Implement a more CLI information and options
  - [X] Create top-level JSON file to handle configurations
  - [X] Move steps and features folders under a tests folder
  - [ ] Add test coverage
