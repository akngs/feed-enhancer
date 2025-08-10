Always run `s4 status` to get the status of the project and the next action to take. This tool will give you the full context you need to know. Before stating you've completed the task, run `s4 status` again to make sure you've completed all the steps.

## Best practices

- Prefer short and side-effect free functions over long and side-effectful functions.
- Prefer immutable data structures over mutable ones.
- Prefer the simplest possible solution over the most complex one. Never over-engineer.
- Use descriptive yet short names for variables, functions, classes, and modules. Exception: use single letter names for loop variables and parameters of one-liner functions.
- Add documentation to all public functions and classes.
- Write unit tests for all public functions and classes. Tests should be colocated with the code they test.
- Look for opportunities to refactor code to reveal the underlying intent and remove duplication.
- Never use `any` type.
- When you import typescript file in this project, do not omit the extension `.ts`.

## Testing

- Use 'vitest' as the test framework.
- You don't need to import 'vitest' in your tests because it's already imported in the test runner.
- Tests should be read as specifications or examples rather than implementation details.
- Quality of tests should be the same as the code they test. Remove duplication and make tests as simple as possible.
- Avoid mock whenever possible. It is a sign of a bad design. Try to refactor the code to make it easier to test.
- When writing example data for tests, use the simplest possible data that still covers the test case to keep clarity.
- When writing acceptance tests, DO NOT use `describe()` since you just write a single test per file.
- When writing unit tests, DO use `describe()` to group tests by logical unit.
