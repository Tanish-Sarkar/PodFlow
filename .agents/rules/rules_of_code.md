
# General Software Development Rules

## 1. Understand Before You Change

* Never start modifying code before understanding the relevant codebase.
* Inspect the existing:

  * Architecture
  * Entry points
  * Modules
  * Dependencies
  * Database
  * APIs
  * Configuration
  * Logging
  * Tests
* Search the repository before assuming something does not exist.
* Reuse existing patterns whenever they are appropriate.
* Do not make architectural decisions based on assumptions.

> **Rule:** Understand the existing system before deciding how to change it.

---

## 2. Change the Minimum Necessary

* Make the smallest change that correctly solves the requirement.
* Do not modify unrelated files.
* Do not refactor unrelated code while implementing a feature.
* Do not rename or reorganize things without a concrete reason.
* Avoid changing working behavior unnecessarily.

> **Rule:** If the requirement can be solved without changing something, don't change it.

---

## 3. Prefer Simple Solutions

Always choose:

```text
Simple > Clever
Readable > Compact
Explicit > Magical
Maintainable > Sophisticated
```

* Prefer straightforward logic.
* Avoid unnecessary abstractions.
* Avoid unnecessary design patterns.
* Avoid unnecessary helper functions.
* Avoid unnecessary classes.
* Avoid unnecessary layers.

Before introducing an abstraction, ask:

> "Does this actually solve a problem that exists today?"

If not, don't add it.

---

## 4. Every Line Must Have a Reason

Every line of code should be justifiable.

Before adding code, ask:

* What requirement does this line satisfy?
* Is this line necessary?
* Can the same result be achieved more simply?
* Does the project already have this functionality?

Remove code that has no clear purpose.

> **Rule:** Don't write code just because it might be useful later.

---

## 5. Readability Is a Requirement

Code should be understandable by another developer without needing extensive explanation.

Prefer:

```text
clear variable names
small understandable functions
straightforward control flow
consistent formatting
```

Avoid:

```text
clever one-liners
deeply nested logic
cryptic variable names
unnecessary abstractions
magic behavior
```

Optimize for **human comprehension**, not minimum character count.

---

## 6. Do Not Over-Engineer

Do not introduce complexity before the project needs it.

Avoid unnecessary:

* Service layers
* Repository layers
* Factories
* Managers
* Interfaces
* Generic frameworks
* Wrappers
* Event systems
* Abstraction layers
* Design patterns

unless there is a real requirement for them.

> **Rule:** Solve today's problem, not five hypothetical future problems.

---

## 7. Reuse Existing Infrastructure

Before creating a new implementation, search for existing functionality.

Check for:

* Utilities
* Helpers
* Database connections
* API clients
* Authentication
* Logging
* Configuration
* Validation
* Error handling
* Testing utilities
* Shared components

If suitable infrastructure already exists, reuse it.

Do not create duplicate implementations.

---

## 8. Preserve Existing Architecture

When adding functionality:

* Fit into the existing architecture where reasonable.
* Do not redesign the application unnecessarily.
* Do not replace working infrastructure without a requirement.
* Do not introduce a completely different coding style for one feature.

> **Rule:** Extend the existing system before redesigning it.

---

## 9. Respect Module and Ownership Boundaries

Each module should have a clear responsibility.

* Do not access another module's internal implementation unnecessarily.
* Do not directly manipulate another module's data when an interface already exists.
* Avoid tightly coupling independent components.
* Keep responsibilities separated.

If another module owns required data or behavior:

> Prefer a well-defined interface over reaching directly into its internals.

---

## 10. Keep Data Ownership Clear

Every important piece of data should have a clear source of truth.

Avoid:

```text
Same information
   ↓
Database A
Database B
Cache C
Local copy D
```

unless there is a deliberate synchronization strategy.

Prefer:

```text
Single authoritative source
          ↓
Consumers
```

> **Rule:** Know where the truth lives.

---

## 11. Keep APIs Simple and Predictable

API endpoints should have clear responsibilities.

A typical flow should be:

```text
Request
   ↓
Validate
   ↓
Authenticate / Authorize
   ↓
Execute required logic
   ↓
Return response
```

Avoid putting unrelated business logic into route handlers.

At the same time, don't create unnecessary service layers just to make endpoints appear "clean."

---

## 12. Design for Performance, But Don't Prematurely Optimize

First make the implementation:

```text
Correct → Simple → Measurable → Fast
```

Do not optimize blindly.

When performance matters:

* Measure first.
* Identify the bottleneck.
* Optimize the bottleneck.
* Measure again.

Avoid optimizing code that has no measurable performance problem.

---

## 13. Security by Default

Never expose sensitive information unnecessarily.

Never log or commit:

* Passwords
* API keys
* Access tokens
* Refresh tokens
* Private keys
* Secrets
* Credentials
* Sensitive personal data

Use:

* Environment variables
* Secret managers
* Secure configuration
* Proper authentication
* Proper authorization
* Input validation

> **Rule:** Assume anything logged or committed may eventually be exposed.

---

## 14. Validate Inputs at Boundaries

Validate data when it enters the system.

Examples:

```text
HTTP request
API payload
User input
File upload
External API response
Database input
```

Do not assume external data is correct.

Keep validation:

* Clear
* Centralized where appropriate
* Minimal
* Consistent

---

## 15. Fail Clearly

Errors should be:

* Predictable
* Meaningful
* Appropriately handled
* Safe to expose to the user

Do not:

* Silently swallow errors
* Return misleading success responses
* Expose internal stack traces
* Expose secrets
* Hide important failures

Log enough information internally to diagnose the problem.

---

## 16. Logging Should Be Useful

Logging should help answer:

```text
What happened?
Where did it happen?
When did it happen?
What was the relevant input?
What was the result?
Why did it fail?
```

Prefer structured logs when appropriate.

Avoid:

* Random print statements
* Duplicate logs
* Massive object dumps
* Sensitive information
* Logging the same event repeatedly

Use one consistent logging approach across the project.

---

## 17. Test Before and After Changes

Before changing important functionality:

* Understand the existing behavior.
* Identify relevant tests.
* Add tests for the new behavior.
* Run existing tests.

After changes:

```text
New tests pass
+
Existing tests pass
+
No unrelated behavior changed
```

---

## 18. Test Failure Cases, Not Just Success

For every feature, consider:

### Happy path

```text
Valid input → Expected result
```

### Failure paths

```text
Missing input
Invalid input
Unexpected input
Unauthorized request
External failure
Database failure
Timeout
Edge cases
```

A feature isn't properly tested if only the happy path works.

---

## 19. Use Isolated Experiments for Uncertain Changes

When a change involves unfamiliar architecture or significant risk:

```text
Existing system
      ↓
Small isolated experiment
      ↓
Validate approach
      ↓
Production implementation
```

This is especially useful for:

* Authentication
* Database migrations
* New frameworks
* External APIs
* Infrastructure changes
* Performance changes
* Complex integrations

> **Rule:** Prove uncertain ideas in isolation before changing the main system.

---

## 20. Don't Break Existing Behavior

When implementing a new feature:

* Existing functionality should continue working.
* Run regression tests.
* Check affected integrations.
* Review the final diff.

If a breaking change is necessary, identify it explicitly rather than introducing it accidentally.

---

## 21. Dependency Discipline

Before adding a dependency:

1. Check whether the project already has a suitable package.
2. Check whether the standard library is sufficient.
3. Check whether existing utilities solve the problem.
4. Add a new dependency only when justified.

Every dependency adds:

```text
Maintenance
Security risk
Upgrade work
Build complexity
```

> **Rule:** Dependencies must earn their place.

---

## 22. Configuration Discipline

Do not hardcode environment-specific values.

Separate:

```text
Code
Configuration
Secrets
Environment
```

Examples of configuration:

```text
API URLs
Database URLs
Feature flags
Timeouts
Origins
Model names
Environment settings
```

Secrets should never be hardcoded.

---

## 23. Version Control Discipline

Never make uncontrolled changes directly to the primary branch.

Use:

```text
Task
 ↓
Task-specific branch
 ↓
Implementation
 ↓
Tests
 ↓
Review
 ↓
Merge
```

Branch names should describe the task rather than the developer.

Example:

```text
feature/user-authentication
feature/payment-webhook
fix/invoice-validation
```

---

## 24. Keep Commits Small and Logical

Each commit should represent one logical change.

Good:

```text
feat(auth): add user model
feat(auth): add session endpoint
feat(auth): add authentication dependency
test(auth): add session tests
```

Avoid:

```text
"fixed everything"
```

or a single commit containing unrelated features, refactoring, formatting, and bug fixes.

> **Rule:** A commit should be understandable from its message and diff.

---

## 25. Review the Diff Before Committing

Always inspect:

```text
git diff
```

before committing.

Look for:

* Unintended files
* Debugging code
* Secrets
* Unused imports
* Temporary code
* Unrelated refactoring
* Accidental configuration changes
* Generated files

The final diff should tell a clean story.

---

## 26. Don't Mix Tasks

If you're implementing:

```text
Authentication
```

don't simultaneously:

```text
Refactor database
Rename utilities
Update unrelated API
Change frontend styling
Upgrade dependencies
```

unless they are directly required.

> **Rule:** One task should have one clear purpose.

---

## 27. Make AI-Generated Code Human-Validated

When using AI coding tools:

* Do not blindly accept generated code.
* Read every important change.
* Understand what the code does.
* Verify assumptions against the repository.
* Run the tests.
* Review the diff.
* Remove unnecessary generated complexity.

The developer remains responsible for the code.

> **Rule:** AI can accelerate implementation; it does not replace engineering judgment.

---

## 28. Give AI Tools Constraints

When using an AI coding agent, explicitly tell it:

```text
1. Inspect before modifying.
2. Do not assume.
3. Reuse existing code.
4. Make the smallest possible change.
5. Do not refactor unrelated code.
6. Do not add unnecessary dependencies.
7. Keep implementation simple.
8. Explain important decisions.
9. Run relevant tests.
10. Show the final diff.
```

This significantly reduces unnecessary changes.

---

## 29. Prefer Incremental Development

Don't implement a large feature in one uncontrolled operation.

Prefer:

```text
Understand
   ↓
Plan
   ↓
Small implementation
   ↓
Test
   ↓
Review
   ↓
Next change
```

rather than:

```text
Large prompt
   ↓
Huge code change
   ↓
Hope everything works
```

---

## 30. Keep Documentation Proportional

Document:

* Non-obvious decisions
* Public APIs
* Important configuration
* Complex algorithms
* Architectural constraints
* Operational requirements

Don't write huge documentation for obvious code.

> **Rule:** Document why something is non-obvious, not what obvious code already says.

---

# Universal Definition of Done

A feature is not complete merely because the code runs.

Consider it complete when:

```text
Requirement understood
        ↓
Existing architecture understood
        ↓
Minimal implementation created
        ↓
Tests added
        ↓
Failure cases tested
        ↓
Existing tests still pass
        ↓
Security reviewed
        ↓
Logs reviewed
        ↓
Configuration reviewed
        ↓
Diff reviewed
        ↓
No unrelated changes
        ↓
Human understands and approves the code
        ↓
Ready for review / merge
```

---

# The 10 Rules to Remember

If you don't want to remember the entire document, remember these:

1. **Understand before changing.**
2. **Change the minimum necessary.**
3. **Choose the simplest correct solution.**
4. **Every line must have a reason.**
5. **Don't over-engineer.**
6. **Reuse existing infrastructure.**
7. **Don't break unrelated functionality.**
8. **Test both success and failure cases.**
9. **Review the diff and never blindly trust AI-generated code.**
10. **If you can't explain the code, don't ship it.**

> **Golden principle:**
> **Build the simplest correct solution that fits the existing system, changes as little as possible, and can be fully understood and maintained by a human.**
