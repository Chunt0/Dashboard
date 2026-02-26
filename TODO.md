# Dashboard Project - Structured TODO List

## CRITICAL PRIORITY (Must Fix - Security/Stability)

### Security Vulnerabilities
- [ ] **Path Traversal in QA Routes** (CRITICAL)
  - File: `/server/src/routes/qa.ts:47-51`
  - Issue: User input `folderId` directly used in path.join()
  - Fix: Implement UUID-based folder IDs or whitelist validation
  - Impact: Unauthorized file access

- [ ] **Missing Authentication** (CRITICAL)
  - Files: All routes
  - Issue: Zero authentication checks on any endpoint
  - Fix: Add JWT middleware, verify user on all endpoints
  - Impact: Anyone can upload/delete/train

- [ ] **No Request Validation** (CRITICAL)
  - Files: All route files
  - Issue: No schema validation on request bodies
  - Fix: Add express-validator or joi middleware
  - Impact: Invalid data causes 500 errors or crashes

- [ ] **Input Sanitization Missing** (HIGH)
  - File: `/server/src/routes/upload.ts:261, 328`
  - Issue: User-provided batchName/fileName used in paths
  - Fix: Validate against regex `/^[a-zA-Z0-9_-]+$/`
  - Impact: Path traversal attacks possible

- [ ] **Hardcoded URLs** (HIGH)
  - Files: `/server/src/index.ts:14`, `/server/src/routes/upload.ts:193`, etc.
  - Issue: CORS origin, Ollama, and other URLs hardcoded
  - Fix: Move all to environment variables
  - Impact: Cannot adapt to different environments

- [ ] **Error Information Disclosure** (HIGH)
  - File: `/server/src/routes/upload.ts:265`
  - Issue: Error response contains full request body
  - Fix: Return generic message, log details server-side
  - Impact: Exposes request body to users

### Type Safety (Blocking Refactors)
- [ ] **Type Assertions Everywhere** (CRITICAL)
  - Count: 23 instances of `as any` or `as unknown`
  - Files: `/server/src/trainer/*.ts`, `/server/src/routes/generate.ts`
  - Fix: Create proper interfaces for TOML config objects
  - Impact: Unsafe refactoring, hidden errors

- [ ] **Function Parameters with Any Type** (HIGH)
  - File: `/server/src/routes/generate.ts:68, 78`
  - Fix: Define proper interfaces for prompt and response types
  - Impact: No IDE autocomplete

### Error Handling (Crashes)
- [ ] **Unhandled Upload Errors** (CRITICAL)
  - Files: `/client/src/components/Upload/VidUpload.tsx:38-41`
  - Issue: fetch() calls without error handling
  - Fix: Add try/catch, error state, user notification
  - Impact: Silent failures

- [ ] **Worker Crash Risk** (CRITICAL)
  - File: `/server/src/trainer/queueWorker.ts:45-47`
  - Issue: Infinite loop with broad catch block
  - Fix: Implement proper error handling and graceful shutdown
  - Impact: Worker crashes without warning

- [ ] **File Operation Errors** (HIGH)
  - File: `/server/src/routes/upload.ts:82, 110, 115, 306`
  - Issue: fs.unlinkSync() without error handling
  - Fix: Use fs.promises with try/catch
  - Impact: Process crashes if file doesn't exist

### Build & Deployment (Production-Blocking)
- [ ] **Broken Dockerfile** (CRITICAL)
  - File: `/client/Dockerfile`
  - Issue: Assumes pre-built dist, doesn't build it
  - Fix: Implement multi-stage build with proper build step
  - Impact: Docker image doesn't work

- [ ] **Missing Backend Dockerfile** (HIGH)
  - Issue: No Docker image for server
  - Fix: Create `/server/Dockerfile` with production-ready config
  - Impact: Cannot deploy backend

---

## HIGH PRIORITY (Must Fix - Core Issues)

### Architecture
- [ ] **Training Blocks Server** (CRITICAL)
  - Files: `/server/src/trainer/*.ts`
  - Issue: spawn() blocks entire Node process during training (hours)
  - Fix: Use separate worker process (or non-blocking subprocess with timeout)
  - Impact: Server unresponsive during training

- [ ] **Queue System Incomplete** (HIGH)
  - File: `/server/src/trainer/queueWorker.ts:36-41`
  - Issue: WAN and LTX handlers are TODO stubs
  - Fix: Either implement or remove from UI
  - Impact: UI promises functionality that doesn't exist

- [ ] **Monolithic Upload Handler** (HIGH)
  - File: `/server/src/routes/upload.ts` (389 lines)
  - Issue: Video prep, image prep, labeling all mixed
  - Fix: Extract into services (videoProcessor, imageProcessor, labelGenerator)
  - Impact: Untestable, hard to maintain

### Code Duplication (Must Refactor)
- [ ] **Trainer Modules Duplicate** (CRITICAL)
  - Files: flux.ts, sdxl.ts, wan.ts, ltx.ts (~85 lines each, 85% duplicate)
  - Fix: Extract `trainModel()` base function, parameterize config
  - Impact: Fix needs to be made in 4 places

- [ ] **Upload Logic Duplicate** (HIGH)
  - File: `/server/src/routes/upload.ts:257-386`
  - Issue: Video and image upload handlers are nearly identical
  - Fix: Extract `handleChunkedUpload()` function
  - Impact: Maintenance nightmare

- [ ] **Labeling Logic Duplicate** (HIGH)
  - File: `/server/src/routes/upload.ts:179-255`
  - Issue: createLabelImage() and createLabelVideo() are 95% identical
  - Fix: Extract `createLabel()` with prompt template parameter
  - Impact: Changes must be made twice

### Performance (User Impact)
- [ ] **Memory Exhaustion Risk** (HIGH)
  - File: `/client/src/components/Upload/VidUpload.tsx:116-130`
  - Issue: Promise.all() loads all files simultaneously
  - Fix: Implement upload queue with max 2-3 concurrent
  - Impact: Browser crash on large uploads

- [ ] **Synchronous File Ops Block Event Loop** (HIGH)
  - File: `/server/src/routes/upload.ts:299-300`
  - Issue: fs.readFileSync() in upload routes
  - Fix: Replace with fs.promises throughout
  - Impact: Server hangs during large file operations

- [ ] **Inefficient Chunking** (MEDIUM)
  - File: `/server/src/routes/upload.ts:297-301`
  - Issue: Reads all chunks into memory before writing
  - Fix: Use stream-based chunk reassembly
  - Impact: Memory spike for large uploads

### Security Features (Missing)
- [ ] **Add Rate Limiting** (HIGH)
  - All routes
  - Add: `express-rate-limit` middleware
  - Impact: API vulnerable to DoS without this

- [ ] **Add Security Headers** (HIGH)
  - File: `/server/src/index.ts`
  - Add: `helmet()` middleware
  - Impact: Missing X-Frame-Options, X-Content-Type-Options, etc.

- [ ] **Enforce HTTPS** (MEDIUM)
  - Add: Redirect middleware for production
  - Impact: Man-in-the-middle attacks possible

---

## MEDIUM PRIORITY (Should Fix - Code Quality)

### Code Quality
- [ ] **Remove Unused Imports** (MEDIUM)
  - File: `/server/src/routes/upload.ts:2` (mime-types unused)
  - Fix: Remove

- [ ] **Unused Type Definitions** (MEDIUM)
  - File: `/server/src/trainer/config.ts`
  - Issue: Some commented-out config options
  - Fix: Document or remove

- [ ] **Inconsistent Error Handling** (MEDIUM)
  - Files: `/server/src/routes/qa.ts:122` vs `/server/src/routes/upload.ts:207`
  - Issue: Mix of callback and promise-based fs operations
  - Fix: Standardize on async/await with try/catch

- [ ] **Hardcoded Config Values** (MEDIUM)
  - Files: Multiple
  - Issue: File extensions (`.mp4`, `.png`, `.txt`) hardcoded
  - Fix: Create `/server/src/constants/fileTypes.ts`

- [ ] **Callback Hell** (MEDIUM)
  - File: `/server/src/routes/upload.ts:74-88`
  - Issue: Nested promise callbacks for ffmpeg
  - Fix: Refactor to async/await

### Dependency Issues
- [ ] **Standardize Package Manager** (HIGH)
  - Issue: pnpm inconsistency
  - Fix: Use pnpm everywhere, document in README

- [ ] **Update Type Definitions** (MEDIUM)
  - Package: `@types/react-router-dom@5.3.3`
  - Issue: v5 types for v7 router
  - Fix: Update or use React Router built-in types

- [ ] **Add Security Dependencies** (HIGH)
  - Add to server: helmet, compression, express-validator, express-rate-limit

- [ ] **Add Validation Library** (MEDIUM)
  - Consider: zod for runtime validation

### Redis Architecture
- [ ] **Implement Connection Pooling** (MEDIUM)
  - File: `/server/src/utils/redisClient.ts`
  - Issue: Single client instance, no pooling
  - Fix: Implement connection pool
  - Impact: Connection exhaustion under load

### Client Security
- [ ] **Use Crypto for File IDs** (MEDIUM)
  - Files: `/client/src/components/Upload/VidUpload.tsx:56-58`
  - Issue: Math.random() is predictable
  - Fix: Use crypto.randomUUID() or import uuid package

---

## TESTING & DOCUMENTATION (Must Have)

### Testing Infrastructure
- [ ] **Configure Test Framework** (CRITICAL)
  - Setup Jest or Vitest
  - Create test directory structure
  - Configure TypeScript support for tests

- [ ] **Write Unit Tests - Trainer Logic** (HIGH)
  - Files: `/server/src/trainer/*.ts`
  - Tests needed: TOML parsing, config validation, path construction

- [ ] **Write Unit Tests - File Operations** (HIGH)
  - File: `/server/src/routes/upload.ts`
  - Tests needed: Chunk reassembly, path validation, file type checking

- [ ] **Write Integration Tests** (HIGH)
  - Full upload workflow (chunks → reassembly → labeling)
  - QA workflow (load → edit → submit)
  - Training job workflow (queue → process → cleanup)

- [ ] **Write E2E Tests** (MEDIUM)
  - Tool: Cypress or Playwright
  - Tests: File upload, training submission, QA interface

### Documentation
- [ ] **API Documentation** (HIGH)
  - Add JSDoc to all route handlers
  - Generate OpenAPI/Swagger docs
  - Tool: swagger-jsdoc

- [ ] **Architecture Documentation** (HIGH)
  - File: `/docs/architecture.md`
  - Include: System diagram, data flow, training pipeline, queue design

- [ ] **Component Documentation** (MEDIUM)
  - Add JSDoc to React components
  - Consider: Storybook for complex components

- [ ] **Environment Variable Docs** (HIGH)
  - Create comprehensive guide with:
    - Required vs optional variables
    - Example values
    - Purpose of each variable

- [ ] **Deployment Guide** (MEDIUM)
  - File: `/docs/deployment.md`
  - Include: Docker steps, env setup, scaling, monitoring

---

## LOW PRIORITY (Nice to Have - Polish)

### Code Consistency
- [ ] **Configure Prettier** (MEDIUM)
  - Create `.prettierrc.json`
  - Standardize: 2-space tabs, single quotes, trailing commas

- [ ] **ESLint for Server** (MEDIUM)
  - Create `/server/.eslintrc.json`
  - Configure: same rules as client

- [ ] **Document Naming Conventions** (LOW)
  - PascalCase for components, camelCase for utils

### Accessibility
- [ ] **Add ARIA Labels** (MEDIUM)
  - All interactive elements need proper ARIA

- [ ] **Fix Color-Only Indicators** (MEDIUM)
  - File: `/client/src/components/Nav/HealthIndicator.tsx`
  - Add text labels to color indicators

- [ ] **Keyboard Navigation** (MEDIUM)
  - Add fallback file input for drag-and-drop

- [ ] **Focus Management** (LOW)
  - Ensure visible focus indicators on all buttons

### UX Improvements
- [ ] **Error Toast Messages** (MEDIUM)
  - Add notification system for upload failures

- [ ] **Progress Indication** (MEDIUM)
  - Add spinner/progress bar for long operations

### Performance Optimization
- [ ] **Stream-Based File Operations** (MEDIUM)
  - Replace readFileSync with streams

- [ ] **Implement Upload Retry Logic** (MEDIUM)
  - Exponential backoff for failed chunks

- [ ] **Failed Job Cleanup** (MEDIUM)
  - Clean up temp files from failed training jobs

---

## CHECKLIST FOR COMPLETION

### Security
- [ ] All endpoints authenticated
- [ ] Input validation on all routes
- [ ] No hardcoded URLs
- [ ] Rate limiting enabled
- [ ] Security headers added
- [ ] HTTPS enforced (production)
- [ ] Path traversal fixed
- [ ] Error messages sanitized

### Code Quality
- [ ] Type assertions removed
- [ ] No unused imports
- [ ] Code duplication reduced (< 10%)
- [ ] All functions have proper error handling
- [ ] Async/await used consistently
- [ ] Dependency injection implemented

### Testing
- [ ] Unit test coverage > 60%
- [ ] Integration tests for critical paths
- [ ] E2E tests for user workflows
- [ ] All tests passing
- [ ] CI/CD configured

### Documentation
- [ ] API documentation complete
- [ ] Architecture documented
- [ ] Component props documented
- [ ] Environment variables documented
- [ ] Deployment guide written

### Performance
- [ ] No synchronous file operations
- [ ] Streams used for large files
- [ ] Upload queue implemented
- [ ] Redis connection pooling
- [ ] Performance baseline established

### Accessibility
- [ ] WCAG 2.1 Level AA compliant
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation working
- [ ] Color not only differentiator
- [ ] Focus indicators visible

### Build & Deployment
- [ ] Docker builds successfully
- [ ] Multi-stage builds implemented
- [ ] Health checks configured
- [ ] Environment variables externalized
- [ ] Secrets management in place

### Monitoring
- [ ] Structured logging implemented
- [ ] Error tracking (e.g., Sentry)
- [ ] Performance monitoring
- [ ] Security event logging
- [ ] Alerts configured

---

## PRIORITY SCHEDULE

### Week 1 (Critical Security & Stability)
1. Add input validation to all routes
2. Fix path traversal vulnerability
3. Add error handling to upload
4. Move hardcoded URLs to .env
5. Fix Dockerfile

### Week 2 (Architecture Improvements)
6. Extract trainer duplicate code
7. Extract upload service
8. Fix worker error handling
9. Add authentication
10. Add rate limiting

### Week 3 (Testing & Documentation)
11. Configure test framework
12. Write critical unit tests
13. Write JSDoc comments
14. Create architecture doc
15. Create deployment guide

### Week 4 (Polish & Optimization)
16. Implement retry logic
17. Add security headers
18. Optimize file operations
19. Add accessibility fixes
20. Configure monitoring

