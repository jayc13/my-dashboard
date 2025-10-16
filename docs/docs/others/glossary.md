# Glossary

Common terms and acronyms used in My Dashboard documentation and codebase.

## A

**ADR (Architecture Decision Record)**
: A document that captures an important architectural decision made along with its context and consequences.

**API (Application Programming Interface)**
: A set of rules and protocols for building and interacting with software applications.

**API Key**
: A secret token used to authenticate requests to the API. In this project, passed via the `x-api-key` header.

## B

**Brute Force Protection**
: Security mechanism that limits failed authentication attempts to prevent password/key guessing attacks.

## C

**CI/CD (Continuous Integration/Continuous Deployment)**
: Automated processes for testing and deploying code changes.

**CORS (Cross-Origin Resource Sharing)**
: A mechanism that allows restricted resources on a web page to be requested from another domain.

**Cron Job**
: A scheduled task that runs automatically at specified intervals.

**CSP (Content Security Policy)**
: A security standard to prevent cross-site scripting (XSS) and other code injection attacks.

**Cypress**
: An end-to-end testing framework for web applications.

## D

**Docusaurus**
: A static site generator used for creating documentation websites.

## E

**E2E (End-to-End) Testing**
: Testing methodology that validates the entire application flow from start to finish.

**Express.js**
: A minimal and flexible Node.js web application framework.

**ESLint**
: A static code analysis tool for identifying problematic patterns in JavaScript/TypeScript code.

## F

**FCM (Firebase Cloud Messaging)**
: A cross-platform messaging solution for sending push notifications.

## G

**GitHub Actions**
: CI/CD platform integrated with GitHub for automating workflows.

## H

**Helmet.js**
: A collection of middleware functions that help secure Express apps by setting various HTTP headers.

**HSTS (HTTP Strict Transport Security)**
: A web security policy mechanism that helps protect websites against protocol downgrade attacks.

**Husky**
: A tool for managing Git hooks in Node.js projects.

## I

**ISO 8601**
: International standard for date and time representation (e.g., `2024-01-20T12:00:00.000Z`).

## J

**JIRA**
: A project management and issue tracking software by Atlassian.

**JWT (JSON Web Token)**
: A compact, URL-safe means of representing claims to be transferred between two parties. **Note**: This project does NOT use JWT.

## M

**Material-UI (MUI)**
: A popular React UI framework that implements Google's Material Design.

**Middleware**
: Software that acts as a bridge between an operating system or database and applications, especially on a network.

**Migration**
: A script that modifies the database schema in a controlled, versioned manner.

**Monorepo**
: A software development strategy where code for many projects is stored in the same repository.

**MySQL**
: An open-source relational database management system.

## N

**Node.js**
: A JavaScript runtime built on Chrome's V8 JavaScript engine.

## O

**OpenAPI**
: A specification for building APIs, formerly known as Swagger.

**ORM (Object-Relational Mapping)**
: A programming technique for converting data between incompatible type systems. **Note**: This project uses raw SQL, not an ORM.

## P

**Playwright**
: A framework for end-to-end testing of web applications.

**pnpm**
: A fast, disk space efficient package manager for Node.js.

**Prettier**
: An opinionated code formatter that enforces a consistent style.

**Pull Request (PR)**
: A method of submitting contributions to a project, where changes are reviewed before merging.

## R

**Railway**
: A deployment platform for hosting web applications and databases.

**Rate Limiting**
: A technique to control the rate of requests sent or received by a network interface controller.

**React**
: A JavaScript library for building user interfaces.

**REST (Representational State Transfer)**
: An architectural style for designing networked applications using HTTP requests.

## S

**SDK (Software Development Kit)**
: A collection of software development tools and libraries for creating applications. In this project, the TypeScript SDK for API interaction.

**SQL (Structured Query Language)**
: A domain-specific language used for managing data in relational databases.

## T

**TypeScript**
: A strongly typed programming language that builds on JavaScript.

## V

**Validation**
: The process of checking that data meets certain criteria before processing.

**Vite**
: A modern frontend build tool that provides a faster development experience.

## W

**Workspace**
: In the context of pnpm, a package within a monorepo that can have its own dependencies and scripts.

## Common Acronyms

| Acronym | Full Form |
|---------|-----------|
| API | Application Programming Interface |
| CI/CD | Continuous Integration/Continuous Deployment |
| CORS | Cross-Origin Resource Sharing |
| CSP | Content Security Policy |
| E2E | End-to-End |
| FCM | Firebase Cloud Messaging |
| HSTS | HTTP Strict Transport Security |
| JWT | JSON Web Token |
| MUI | Material-UI |
| ORM | Object-Relational Mapping |
| PR | Pull Request |
| REST | Representational State Transfer |
| SDK | Software Development Kit |
| SQL | Structured Query Language |

## Project-Specific Terms

**Application**
: A project or service being monitored by the dashboard. Each application can have multiple E2E test runs.

**E2E Run Report**
: A summary of Cypress test execution results for all applications.

**Manual Run**
: A manually triggered E2E test execution (as opposed to automated runs).

**Project Summary**
: Aggregated test results for a specific application/project.

**Test Result**
: The outcome of a single Cypress test execution.

**Watching**
: A flag indicating whether an application is actively being monitored.

## File Extensions

| Extension | Description |
|-----------|-------------|
| `.ts` | TypeScript source file |
| `.tsx` | TypeScript file with JSX (React components) |
| `.js` | JavaScript source file |
| `.jsx` | JavaScript file with JSX |
| `.json` | JSON data file |
| `.yaml` / `.yml` | YAML configuration file |
| `.md` | Markdown documentation file |
| `.sql` | SQL script file |

## Environment Variables

**Development Environment**
: Local development setup on a developer's machine.

**Production Environment**
: Live environment where the application is deployed and used by end users.

**Staging Environment**
: Pre-production environment for testing before deploying to production.

**Environment Variable**
: A dynamic-named value that can affect the way running processes behave on a computer.

## HTTP Methods

| Method | Description |
|--------|-------------|
| GET | Retrieve data from the server |
| POST | Send data to create a new resource |
| PUT | Update an existing resource |
| PATCH | Partially update a resource |
| DELETE | Remove a resource |

## HTTP Status Codes

| Code | Meaning |
|------|---------|
| 200 | OK - Request successful |
| 201 | Created - Resource created successfully |
| 400 | Bad Request - Invalid request data |
| 401 | Unauthorized - Authentication required |
| 403 | Forbidden - Insufficient permissions |
| 404 | Not Found - Resource doesn't exist |
| 409 | Conflict - Resource already exists |
| 429 | Too Many Requests - Rate limit exceeded |
| 500 | Internal Server Error - Server error |
| 503 | Service Unavailable - External service error |

## Database Terms

**Connection Pool**
: A cache of database connections maintained so connections can be reused.

**Index**
: A database structure that improves the speed of data retrieval operations.

**Migration**
: A version-controlled change to the database schema.

**Primary Key**
: A unique identifier for a database record.

**Foreign Key**
: A field that links to the primary key of another table.

**Query**
: A request for data or information from a database.

**Transaction**
: A sequence of database operations that are treated as a single unit of work.

## Git Terms

**Branch**
: An independent line of development in Git.

**Commit**
: A snapshot of changes in the repository.

**Conventional Commits**
: A specification for adding human and machine-readable meaning to commit messages.

**Merge**
: Combining changes from different branches.

**Pull Request**
: A request to merge changes from one branch into another.

**Rebase**
: Reapplying commits on top of another base commit.

## Testing Terms

**Unit Test**
: Testing individual components or functions in isolation.

**Integration Test**
: Testing how different parts of the system work together.

**E2E Test**
: Testing the complete application flow from user perspective.

**Test Coverage**
: The percentage of code that is executed during testing.

**Mock**
: A simulated object that mimics the behavior of real objects in controlled ways.

---

**Need more definitions?** Feel free to contribute to this glossary by submitting a pull request!

