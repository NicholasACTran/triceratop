# Triceratop
## Deno BDD Testing Framework

### Goals
Create a cucumber-like CLI that can be used to create and run BDD-tests using the Gherkin syntax.

* CLI command to generate testing infrastructure
* CLI command to generate readable typescript code from a Gherkin feature document
* CLI command to parse Gherkin feature document and run tests in steps folder

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

Where each .feature file in the features folder correlates directly with a .ts file in the steps folder with the same filename.

### Generating Test Code

By running a triceratop CLI command, it would go through each .feature file and generate a .ts file with the same name, containing the functions that encapsulate the steps in the .feature file.

### Running Tests

By running a triceratop CLI command, it should go through each .feature file (or a specific one) and use the .feature file to search for the specific step functions in the correlated .ts function and run a test using the underlying Deno test framework.

### Things That Need to Be Done

- [x] Implement Background, And, But nodes
- [ ] Implement Scenario Outlines, Examples nodes
- [x] Implement syntax list -> typescript
- [ ] Connect functionality to underlying Deno test framework
- [ ] Implement:
  - [ ] Create function for Given
  - [ ] Create function for When
  - [ ] Create function for Then
  - [ ] Create function for And
  - [ ] Create function for But
