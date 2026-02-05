# Dashboard Project - Comprehensive TODO & Improvement Roadmap

## 📊 Overview

This document outlines all necessary fixes, improvements, and upgrades for the Dashboard project. The codebase analysis identified **15+ critical issues**, **20+ high priority issues**, and **25+ medium priority items**.

### 🔐 Authentication Approach
Since this is an **internal-only tool for personal use**, a simple **API Key authentication** approach has been chosen:
- No user login or database required
- Single API key stored in `.env` file
- Client sends `Authorization: Bearer {API_KEY}` header with each request
- Server validates key on all protected endpoints
- **Implementation time**: ~30 minutes
- **Future upgrade path**: Can be upgraded to JWT/user-based auth if needed later

---

## 🚨 CRITICAL PRIORITY (Must Fix First - Security/Stability)

### Security Vulnerabilities

- [ ] **Path Traversal Vulnerability in QA Routes** 
  - **File**: `/server/src/routes/qa.ts:47-51`
  - **Issue**: User input `folderId` directly used in `path.join()`
  - **Risk**: Unauthorized file access via symlink attacks
  - **Fix**: Implement UUID-based folder IDs or whitelist folder validation
  - **Timeline**: Week 1

- [ ] **Add API Key Authentication to All Endpoints**
  - **Files**: `/server/src/routes/*.ts` (all route files)
  - **Issue**: Zero authentication checks - endpoints are unprotected
  - **Risk**: Endpoints accessible to anyone (low risk for internal-only tool, but good practice)
  - **Fix**: Implement simple API key authentication
    1. Add `API_KEY` to `.env` file
    2. Create `src/middleware/apiKeyAuth.ts` middleware
    3. Middleware checks `Authorization: Bearer {API_KEY}` header
    4. Apply middleware to all routes
  - **Implementation**:
    ```typescript
    // server/.env
    API_KEY=your_secret_key_here
    
    // server/src/middleware/apiKeyAuth.ts
    export function validateApiKey(req, res, next) {
      const key = req.headers.authorization?.replace('Bearer ', '');
      if (key !== process.env.API_KEY) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      next();
    }
    
    // Apply to routes
    app.use('/api', validateApiKey);
    ```
  - **Timeline**: Week 1 (30 minutes)
  - **Note**: Simple approach for internal-only tool. Can upgrade to JWT later if needed.

- [ ] **No Request Body Validation**
  - **Files**: All route files
  - **Issue**: No schema validation on incoming requests
  - **Risk**: Invalid data causes 500 errors, potential DoS attacks
  - **Fix**: Add `express-validator` or `joi` middleware for all routes
  - **Timeline**: Week 1

- [ ] **Input Sanitization Missing**
  - **File**: `/server/src/routes/upload.ts:261, 328`
  - **Issue**: User-provided `batchName` and `fileName` used directly in file paths
  - **Risk**: Path traversal attacks via `../` sequences
  - **Fix**: Validate against regex `/^[a-zA-Z0-9_-]+$/`
  - **Timeline**: Week 1

- [ ] **Hardcoded URLs & API Endpoints**
  - **Files**: 
    - `/server/src/index.ts:14` - CORS origin
    - `/server/src/routes/upload.ts:193, 232` - Ollama endpoint
    - `/server/src/routes/generate.ts:9, 69, 79` - External API
  - **Issue**: URLs hardcoded, can't adapt to environments
  - **Fix**: Move all to environment variables in `.env`
  - **Timeline**: Week 1

- [ ] **Error Information Disclosure**
  - **File**: `/server/src/routes/upload.ts:265`
  - **Issue**: Error response contains full request body: `\`request body:${req.body}\``
  - **Risk**: Exposes sensitive request data to users
  - **Fix**: Return generic error message, log full details server-side only
  - **Timeline**: Week 1

### Type Safety (Blocks Safe Refactoring)

- [ ] **Remove All Type Assertions (23 instances)**
  - **Files**: `/server/src/trainer/*.ts`, `/server/src/routes/generate.ts`
  - **Issue**: 23 instances of `as any` or `as unknown` type casts
  - **Impact**: Makes refactoring dangerous, hides errors at compile time
  - **Fix**: Create proper TypeScript interfaces instead of casting
  - **Example**: `/server/src/trainer/config.ts:24` - Replace `TOML.parse() as unknown as DatasetConfig`
  - **Timeline**: Week 1-2

- [ ] **Fix Promise Type Assertions**
  - **File**: `/server/src/routes/upload.ts:265`
  - **Issue**: Promise cast to `unknown as void`
  - **Fix**: Use proper `Promise<void>` return types
  - **Timeline**: Week 1

- [ ] **Define Proper Function Parameter Types**
  - **File**: `/server/src/routes/generate.ts:68, 78`
  - **Issue**: Function parameters typed as `any`
  - **Fix**: Create interfaces for prompt and response types
  - **Timeline**: Week 1

### Error Handling (Crash Risk)

- [ ] **Unhandled Upload Errors on Client**
  - **Files**: 
    - `/client/src/components/Upload/VidUpload.tsx:38-41`
    - `/client/src/components/Upload/ImgUpload.tsx:38-41`
  - **Issue**: `await fetch()` with no error handling
  - **Impact**: Upload failures silently fail, user gets no feedback
  - **Fix**: Add try/catch, error state, user toast notifications
  - **Timeline**: Week 1

- [ ] **Worker Process Crash Risk**
  - **File**: `/server/src/trainer/queueWorker.ts:45-47`
  - **Issue**: Infinite loop with broad catch block always continues
  - **Impact**: Worker could crash without warning
  - **Fix**: Implement proper error handling, graceful shutdown, error logging
  - **Timeline**: Week 1

- [ ] **Unhandled File Operation Errors**
  - **File**: `/server/src/routes/upload.ts:82, 110, 115, 306`
  - **Issue**: `fs.unlinkSync()` calls without error handling
  - **Risk**: If file doesn't exist → process crashes
  - **Fix**: Replace with `fs.promises.unlink()` using try/catch
  - **Timeline**: Week 1

- [ ] **Unhandled Promise.all() Rejections**
  - **File**: `/server/src/routes/upload.ts:116-129`
  - **Issue**: No error handling on `Promise.all()` for chunk operations
  - **Impact**: One failed chunk silently fails entire upload
  - **Fix**: Add error handling per chunk with retry logic
  - **Timeline**: Week 1

### Build & Deployment (Production-Blocking)

- [ ] **Fix Client Dockerfile (Multi-Stage Build)**
  - **File**: `/client/Dockerfile`
  - **Issue**: Only copies pre-built dist, doesn't build it - image fails or uses stale build
  - **Fix**: Implement proper multi-stage Dockerfile:
    ```dockerfile
    # Stage 1: Build
    FROM node:18-alpine AS builder
    WORKDIR /app
    COPY package.json pnpm-lock.yaml ./
    RUN pnpm install --frozen-lockfile
    COPY . .
    RUN pnpm run build

    # Stage 2: Runtime
    FROM nginx:alpine
    COPY --from=builder /app/dist /usr/share/nginx/html
    COPY nginx.conf /etc/nginx/conf.d/default.conf
    EXPOSE 80
    CMD ["nginx", "-g", "daemon off;"]
    ```
  - **Timeline**: Week 1

- [ ] **Create Backend Dockerfile**
  - **Issue**: No Dockerfile for backend/worker service
  - **Fix**: Create `/server/Dockerfile` with proper multi-stage build
  - **Timeline**: Week 1

- [ ] **Add Docker Health Checks**
  - **File**: `docker-compose.yml`
  - **Issue**: Services don't have health checks configured
  - **Fix**: Add to all services:
    ```yaml
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3003/api/health"]
      interval: 30s
      timeout: 10s
      retries: 3
    ```
  - **Timeline**: Week 1

### Architecture (Server Blocking)

- [ ] **Fix Training Blocking Server**
  - **Files**: `/server/src/trainer/*.ts` (flux.ts, sdxl.ts, wan.ts, ltx.ts)
  - **Issue**: `spawn()` with `stdio: 'inherit'` blocks entire Node process during training
  - **Impact**: Server unresponsive during training (can take hours)
  - **Current**: Server waits for Python process to complete
  - **Fix**: Use separate worker process (already have queue, just implement properly) or use non-blocking subprocess with timeout
  - **Timeline**: Week 2

---

## 🔴 HIGH PRIORITY (Must Fix - Core Issues)

### Code Duplication (30-40% of codebase)

- [ ] **Trainer Module Duplication (85%)**
  - **Files**: 
    - `/server/src/trainer/flux.ts` (85 lines)
    - `/server/src/trainer/sdxl.ts` (84 lines)
    - `/server/src/trainer/wan.ts` (85 lines)
    - `/server/src/trainer/ltx.ts` (87 lines)
  - **Issue**: ~85% duplicate code across all 4 trainer modules
  - **Impact**: Any fix must be made in 4 places, bugs creep in inconsistently
  - **Fix**: Extract base `trainModel()` function, parameterize model-specific config
  - **Timeline**: Week 2

- [ ] **Upload Logic Duplication**
  - **File**: `/server/src/routes/upload.ts:257-386`
  - **Issue**: `router.post('/videos', ...)` and `router.post('/images', ...)` are ~100 lines each, 95% identical
  - **Impact**: Maintenance nightmare, changes must be replicated
  - **Fix**: Extract `handleChunkedUpload(mediaType)` function
  - **Timeline**: Week 2

- [ ] **Labeling Logic Duplication**
  - **File**: `/server/src/routes/upload.ts:179-255`
  - **Issue**: `createLabelImage()` and `createLabelVideo()` are 95% identical
  - **Impact**: Changes must be made twice, risk of inconsistency
  - **Fix**: Extract `createLabel(promptTemplate)` function
  - **Timeline**: Week 2

- [ ] **Hardcoded Configuration Values**
  - **Files**: Multiple route files
  - **Issue**: File extensions (`.mp4`, `.png`, `.txt`) hardcoded throughout
  - **Fix**: Create `/server/src/constants/fileTypes.ts` and `/server/src/constants/prompts.ts`
  - **Timeline**: Week 2

### Performance Issues

- [ ] **Memory Exhaustion Risk in Large Uploads**
  - **File**: `/client/src/components/Upload/VidUpload.tsx:116-130`
  - **Issue**: `Promise.all(filePromises)` loads many large files simultaneously into memory
  - **Impact**: Browser could crash with multiple large file uploads
  - **Fix**: Implement upload queue with max 2-3 concurrent uploads
  - **Timeline**: Week 2

- [ ] **Synchronous File Operations Block Event Loop**
  - **File**: `/server/src/routes/upload.ts:299-300, 306`
  - **Issue**: Multiple `fs.readFileSync()` calls in upload route block the entire event loop
  - **Impact**: Server hangs during large file operations
  - **Fix**: Replace all with `fs.promises` using async/await
  - **Timeline**: Week 2

- [ ] **Inefficient Chunk Reassembly**
  - **File**: `/server/src/routes/upload.ts:297-301`
  - **Issue**: Reads all chunk files into memory before writing output file
  - **Impact**: Large uploads consume significant memory
  - **Fix**: Use stream-based chunk reassembly
  - **Timeline**: Week 2-3

- [ ] **Inefficient Image Processing**
  - **File**: `/server/src/routes/upload.ts:139, 170`
  - **Issue**: `fs.readFileSync()` reads entire image into memory before base64 conversion
  - **Impact**: Memory spike for large images
  - **Fix**: Use streaming approach or process in chunks
  - **Timeline**: Week 3

### Queue System & Architecture

- [ ] **Complete Queue System Implementation**
  - **File**: `/server/src/trainer/queueWorker.ts:36-41`
  - **Issue**: WAN and LTX model handlers are TODO stubs
  - **Impact**: UI allows selecting these models but they don't work
  - **Fix**: Either implement handlers or remove from UI
  - **Timeline**: Week 2

- [ ] **Implement Connection Pooling for Redis**
  - **File**: `/server/src/utils/redisClient.ts`
  - **Issue**: Single client instance, no connection pooling
  - **Impact**: Connection exhaustion under load
  - **Fix**: Implement Redis connection pool
  - **Timeline**: Week 2

### Security Features

- [ ] **Add Rate Limiting**
  - **All routes**
  - **Add**: `express-rate-limit` middleware
  - **Impact**: API vulnerable to DoS without this
  - **Timeline**: Week 2

- [ ] **Add Security Headers with Helmet**
  - **File**: `/server/src/index.ts`
  - **Add**: `helmet()` middleware
  - **Coverage**: X-Frame-Options, X-Content-Type-Options, CSP, etc.
  - **Timeline**: Week 2

- [ ] **Enforce HTTPS in Production**
  - **Add**: Redirect middleware for production environments
  - **Impact**: Man-in-the-middle attacks possible without HTTPS
  - **Timeline**: Week 2

### Code Organization

- [ ] **Extract Upload Service Layer**
  - **File**: `/server/src/routes/upload.ts` (389 lines - too large)
  - **Issue**: Video prep, image prep, labeling, chunking all mixed in one file
  - **Impact**: Hard to test, hard to reuse, violates separation of concerns
  - **Fix**: Extract into services:
    - `src/services/videoProcessor.ts`
    - `src/services/imageProcessor.ts`
    - `src/services/labelGenerator.ts`
    - `src/services/uploadHandler.ts`
  - **Timeline**: Week 2-3

---

## 🟡 MEDIUM PRIORITY (Should Fix - Code Quality)

### Code Quality & Consistency

- [ ] **Remove Unused Imports**
  - **File**: `/server/src/routes/upload.ts:2`
  - **Issue**: `import mime from 'mime-types'` - imported but never used
  - **Timeline**: Week 3

- [ ] **Fix Inconsistent Error Handling Patterns**
  - **Files**: 
    - `/server/src/routes/qa.ts:122` (callback-based fs.writeFile)
    - `/server/src/routes/upload.ts:207` (promise-based fs.promises)
  - **Issue**: Mix of callback-based and promise-based fs operations
  - **Fix**: Standardize on async/await with try/catch throughout
  - **Timeline**: Week 3

- [ ] **Refactor Callback Hell to Async/Await**
  - **File**: `/server/src/routes/upload.ts:74-88`
  - **Issue**: Nested promise callbacks for ffmpeg operations
  - **Fix**: Refactor to async/await
  - **Timeline**: Week 3

- [ ] **Configure Prettier for Code Formatting**
  - **Create**: `.prettierrc.json`
  - **Config**:
    ```json
    {
      "semi": true,
      "trailingComma": "es5",
      "tabWidth": 2,
      "useTabs": false,
      "singleQuote": true
    }
    ```
  - **Timeline**: Week 3

- [ ] **Create ESLint Config for Server**
  - **Create**: `/server/.eslintrc.json`
  - **Configure**: Same rules as client for consistency
  - **Timeline**: Week 3

### Dependency Management

- [ ] **Standardize Package Manager**
  - **Issue**: pnpm inconsistency across workspaces
  - **Fix**: Use pnpm everywhere, document in README
  - **Timeline**: Week 1

- [ ] **Update Type Definitions**
  - **Package**: `@types/react-router-dom@5.3.3`
  - **Issue**: v5 types but app uses React Router v7.6.0
  - **Fix**: Update or rely on React Router's built-in types
  - **Timeline**: Week 3

- [ ] **Add Required Security Dependencies**
  - **Add to `/server/package.json`**:
    ```json
    {
      "helmet": "^7.1.0",
      "compression": "^1.7.4",
      "express-rate-limit": "^7.1.5",
      "express-validator": "^7.0.0"
    }
    ```
  - **Timeline**: Week 2

- [ ] **Add Validation & Utility Libraries**
  - **Consider adding**:
    ```json
    {
      "zod": "^3.22.0",
      "axios": "^1.6.0",
      "pino": "^8.14.0"
    }
    ```
  - **Timeline**: Week 3

### Security Enhancements

- [ ] **Use Cryptographically Secure Random for File IDs**
  - **Files**: 
    - `/client/src/components/Upload/VidUpload.tsx:56-58`
    - `/client/src/components/Upload/ImgUpload.tsx:56-58`
  - **Issue**: `Math.random().toString(36).substr(2, 9)` is not cryptographically secure
  - **Impact**: Predictable file IDs
  - **Fix**: Use `crypto.randomUUID()` from Node.js standard library
  - **Timeline**: Week 2

---

## 🎯 NEW FEATURE: LoRA Documentation Generator

### Overview
After QA is complete, automatically generate comprehensive documentation for trained LoRA models by analyzing training labels and identifying trigger words and common patterns. This helps document what the LoRA has learned and how to use it effectively.

### Feature Components

- [ ] **Label Analysis Service**
  - **File**: `/server/src/services/loraDocGenerator.ts`
  - **Purpose**: Analyze all training labels from a completed dataset
  - **Functionality**:
    1. Read all `.txt` label files from the trained dataset directory
    2. Parse comma-separated label text
    3. Extract individual tokens/phrases
    4. Count frequency of each token/phrase
    5. Identify patterns and trigger words
  - **Output**: Structured analysis object with token frequencies and patterns
  - **Timeline**: Week 2-3 (after QA feature is complete)

- [ ] **Trigger Word Detection**
  - **File**: `/server/src/services/loraDocGenerator.ts` (triggerWordDetector)
  - **Purpose**: Identify the most effective trigger words for the LoRA
  - **Algorithm**:
    1. Extract trigger word candidates (tokens that appear in 70%+ of labels)
    2. Use Ollama to validate if words are meaningful descriptors
    3. Rank by frequency and semantic importance
    4. Return top 5-10 recommended trigger words
  - **Implementation**:
    ```typescript
    interface TriggerWord {
      word: string;
      frequency: number;
      percentageOfSamples: number;
      semanticScore?: number; // From Ollama analysis
    }
    ```
  - **Timeline**: Week 3

- [ ] **Common Pattern Detection**
  - **File**: `/server/src/services/loraDocGenerator.ts` (patternDetector)
  - **Purpose**: Identify common themes, styles, and characteristics
  - **Methods**:
    1. **Frequency Analysis**: Find most common adjectives, nouns, style descriptors
    2. **Semantic Clustering**: Use Ollama to group similar concepts
    3. **Category Extraction**: Identify categories (style, subject, mood, quality)
  - **Implementation** uses Ollama prompt:
    ```
    "Analyze these training labels and identify:
    1. Top 5 common styles or artistic directions
    2. Top 5 most common subjects or objects
    3. Top 5 mood/atmosphere descriptors
    4. Common camera/composition directions
    Return as structured JSON with categories and frequencies"
    ```
  - **Timeline**: Week 3

- [ ] **Documentation Generation**
  - **File**: `/server/src/routes/docGeneration.ts`
  - **Endpoint**: `POST /api/lora/:datasetName/generate-docs`
  - **Process**:
    1. Call label analysis service to get token frequencies
    2. Call trigger word detection to get recommended trigger words
    3. Call pattern detection to get common themes
    4. Generate markdown documentation from results
    5. Save to `/server/docs/lora-{datasetName}.md`
    6. Return generated doc to frontend
  - **Timeline**: Week 3

- [ ] **Documentation Template Structure**
  - **Output File**: `/docs/lora-{datasetName}.md`
  - **Contents**:
    ```markdown
    # LoRA Documentation: {DatasetName}

    ## Overview
    Generated analysis from {X} training samples

    ## Trigger Words
    Recommended trigger words to activate this LoRA:
    - {word1} (appears in {X}% of samples)
    - {word2} (appears in {X}% of samples)
    - ...

    ## Common Styles
    Most common artistic directions in training data:
    - {style1} ({count} occurrences, {percentage}%)
    - {style2} ({count} occurrences, {percentage}%)

    ## Common Subjects
    Most frequently depicted subjects:
    - {subject1} ({count} occurrences, {percentage}%)
    - {subject2} ({count} occurrences, {percentage}%)

    ## Mood & Atmosphere
    Common mood and lighting descriptors:
    - {mood1} ({count} occurrences)
    - {mood2} ({count} occurrences)

    ## Composition & Camera Directions
    Common framing and movement instructions:
    - {direction1} ({count} occurrences)
    - {direction2} ({count} occurrences)

    ## Quality Indicators
    Quality/detail descriptors most frequent:
    - {quality1} ({count} occurrences)
    - {quality2} ({count} occurrences)

    ## Analysis Metadata
    - Total samples analyzed: {X}
    - Generated at: {timestamp}
    - Analysis method: Token frequency + Ollama semantic analysis
    ```
  - **Timeline**: Week 3

- [ ] **Frontend Integration**
  - **File**: `/client/src/components/QualityAssurance/DocumentationGenerator.tsx`
  - **Features**:
    1. Add button to QA interface: "Generate LoRA Docs"
    2. Show loading state while analyzing
    3. Display generated documentation in modal or new page
    4. Option to preview/download markdown
    5. Optionally save to server file system
  - **Timeline**: Week 3-4

- [ ] **Ollama Integration for Label Analysis**
  - **Purpose**: Use local Ollama models to enhance analysis
  - **Use Cases**:
    1. **Semantic validation**: Confirm extracted words are meaningful
    2. **Category classification**: Classify tokens into semantic categories
    3. **Pattern detection**: Identify non-obvious patterns in labels
  - **Prompts** to create:
    ```typescript
    // Classify tokens into categories
    "Classify each of these words/phrases into categories: 
     style, subject, mood, quality, composition, action.
     Return as JSON object."
    
    // Semantic importance scoring
    "Rate the semantic importance of these words for 
     describing image/video generation: {words}
     Return as JSON with importance scores 0-1."
    
    // Pattern detection
    "What are the common themes and patterns in these 
     descriptive labels? Return as structured analysis."
    ```
  - **Timeline**: Week 3

### Implementation Plan

**Phase 1: Core Analysis (Week 2)**
1. Create label analysis service (read & parse .txt files)
2. Implement frequency analysis algorithm
3. Extract and count tokens
4. Build data structures for results

**Phase 2: Ollama Enhancement (Week 3)**
1. Create Ollama prompts for semantic analysis
2. Implement trigger word detection with Ollama validation
3. Implement pattern detection with Ollama
4. Create documentation template generator

**Phase 3: Integration (Week 3-4)**
1. Create API endpoint for doc generation
2. Add frontend UI for triggering generation
3. Display results in modal/preview
4. Add download/save functionality
5. Test with sample datasets

### Data Flow Diagram
```
QA Complete → Generate Docs Button
    ↓
Fetch all .txt labels from dataset
    ↓
Parse labels → Extract tokens → Count frequencies
    ↓
Analyze patterns with Ollama (optional)
    ↓
Generate markdown documentation
    ↓
Display in frontend + Save to /docs/
```

### Example Output Analysis
```json
{
  "totalSamples": 150,
  "triggerWords": [
    { "word": "portrait", "frequency": 142, "percentage": 94.7 },
    { "word": "candlelight", "frequency": 128, "percentage": 85.3 },
    { "word": "cinematic", "frequency": 115, "percentage": 76.7 }
  ],
  "commonStyles": [
    { "style": "cinematic lighting", "count": 89, "percentage": 59.3 },
    { "style": "dark moody", "count": 67, "percentage": 44.7 }
  ],
  "commonSubjects": [
    { "subject": "woman", "count": 142, "percentage": 94.7 },
    { "subject": "face", "count": 138, "percentage": 92.0 }
  ]
}
```

### Technical Considerations
1. **Performance**: Analyzing 100+ labels should be < 5 seconds without Ollama
2. **Scalability**: Should handle datasets with 1000+ samples
3. **Ollama Optional**: Core analysis works without Ollama, enhanced analysis with it
4. **Caching**: Cache analysis results to avoid re-processing
5. **File Management**: Safely store generated docs in `/docs/` directory

---

## 📚 TESTING & DOCUMENTATION (Critical for Production)

### Testing Infrastructure

- [ ] **Setup Test Framework (Jest or Vitest)**
  - **Task**:
    1. Install testing framework and dependencies
    2. Create test directory structure: `/server/tests/`, `/client/tests/`
    3. Configure TypeScript support for tests
    4. Create test utilities and helpers
  - **Timeline**: Week 3

- [ ] **Write Unit Tests - Trainer Logic**
  - **Files**: `/server/src/trainer/*.ts`
  - **Tests needed**:
    - TOML config parsing and validation
    - Output directory creation
    - Path construction for models and datasets
  - **Target Coverage**: 80%+
  - **Timeline**: Week 3

- [ ] **Write Unit Tests - Upload Operations**
  - **File**: `/server/src/routes/upload.ts`
  - **Tests needed**:
    - Chunk reassembly logic
    - Path traversal prevention
    - File type validation
    - Input sanitization
  - **Target Coverage**: 70%+
  - **Timeline**: Week 3

- [ ] **Write Unit Tests - Route Handlers**
  - **Files**: All route files
  - **Tests needed**:
    - Request validation
    - Error handling
    - Response formats
    - Authentication checks
  - **Target Coverage**: 60%+
  - **Timeline**: Week 3

- [ ] **Write Integration Tests**
  - **Workflows to test**:
    - Full upload workflow (chunks → reassembly → labeling)
    - QA workflow (load → edit → submit)
    - Training job workflow (queue → process → cleanup)
  - **Timeline**: Week 3-4

- [ ] **Setup E2E Testing (Cypress/Playwright)**
  - **Tests to create**:
    - File drag-and-drop upload
    - Training model selection and submission
    - QA interface navigation
    - Error scenarios
  - **Timeline**: Week 4

### Documentation

- [ ] **Write API Documentation**
  - **Task**:
    1. Add JSDoc comments to all route handlers
    2. Document request/response formats
    3. Document error codes and meanings
    4. Generate OpenAPI/Swagger documentation using `swagger-jsdoc`
  - **Tool**: swagger-jsdoc
  - **Timeline**: Week 3

- [ ] **Create Architecture Documentation**
  - **File**: `/docs/architecture.md`
  - **Content**:
    - System diagram (frontend, backend, workers, external services)
    - Data flow between components
    - Training pipeline explanation
    - Queue worker design
    - Database schema
  - **Timeline**: Week 3

- [ ] **Document React Components**
  - **Task**:
    1. Add JSDoc to all components
    2. Document props, state, side effects
    3. Create Storybook for complex components
  - **Timeline**: Week 3

- [ ] **Create Comprehensive Environment Variable Guide**
  - **File**: `/docs/environment-variables.md`
  - **Content**:
    - All required variables with descriptions
    - Optional variables and defaults
    - Example values for dev/prod
    - Security considerations
  - **Timeline**: Week 3

- [ ] **Write Deployment Guide**
  - **File**: `/docs/deployment.md`
  - **Content**:
    - Docker deployment steps
    - Environment setup for prod/staging
    - Database/Redis initialization
    - Scaling considerations
    - Monitoring setup
    - Backup/recovery procedures
  - **Timeline**: Week 3

- [ ] **Update README.md**
  - **Add**: 
    - Contributing guidelines
    - Development setup instructions
    - Testing commands
    - Troubleshooting section
    - Links to detailed docs
  - **Timeline**: Week 3

---

## 🟢 LOW PRIORITY (Nice to Have - Polish)

### Accessibility (WCAG 2.1 Level AA)

- [ ] **Add ARIA Labels to Interactive Elements**
  - **Files**: All interactive components
  - **Task**: Add `aria-label`, `aria-describedby`, and proper roles
  - **Timeline**: Week 4

- [ ] **Fix Color-Only Status Indicators**
  - **File**: `/client/src/components/Nav/HealthIndicator.tsx:32-33`
  - **Issue**: Server status indicated by color only (green/red)
  - **Impact**: Colorblind users can't see status
  - **Fix**: Add text labels or pattern fills
  - **Timeline**: Week 4

- [ ] **Implement Keyboard Navigation**
  - **Task**: Add keyboard support for drag-and-drop components
  - **Fix**: Provide `<input type="file">` as keyboard fallback
  - **Timeline**: Week 4

- [ ] **Ensure Focus Management**
  - **Task**: Add visible focus indicators on all buttons and inputs
  - **Timeline**: Week 4

### UX Improvements

- [ ] **Add Error Toast Notifications**
  - **Task**: Create toast notification system for upload failures
  - **Timeline**: Week 4

- [ ] **Add Progress Indication**
  - **Task**: Add spinner/progress bar for long operations (video labeling, training)
  - **Timeline**: Week 4

### Performance Optimization

- [ ] **Implement Retry Logic for Failed Uploads**
  - **Task**: Add exponential backoff retry for failed chunks
  - **Timeline**: Week 4

- [ ] **Add Cleanup for Failed Training Jobs**
  - **Task**: Implement cleanup phase to remove temp files from failed jobs
  - **Timeline**: Week 4

- [ ] **Implement Stream-Based File Operations**
  - **Task**: Replace synchronous file reads with streams for large files
  - **Timeline**: Week 4

---

## ✅ COMPLETION CHECKLIST

### Security
- [ ] All endpoints authenticated and authorized
- [ ] Input validation on all routes
- [ ] No hardcoded URLs (all in environment variables)
- [ ] Rate limiting enabled
- [ ] Security headers added (Helmet)
- [ ] HTTPS enforced (production)
- [ ] Path traversal vulnerability fixed
- [ ] Error messages sanitized

### Code Quality
- [ ] All type assertions removed (0 `as any`)
- [ ] No unused imports
- [ ] Code duplication reduced (< 10%)
- [ ] All functions have proper error handling
- [ ] Async/await used consistently
- [ ] Dependency injection implemented
- [ ] Prettier formatting applied
- [ ] ESLint passing on all files

### Testing
- [ ] Unit test coverage > 60%
- [ ] Integration tests for critical paths
- [ ] E2E tests for user workflows
- [ ] All tests passing
- [ ] CI/CD configured and working

### Documentation
- [ ] API documentation complete (JSDoc + Swagger)
- [ ] Architecture documented
- [ ] Component props documented
- [ ] Environment variables documented
- [ ] Deployment guide written and tested

### Performance
- [ ] No synchronous file operations
- [ ] Streams used for large files
- [ ] Upload queue implemented
- [ ] Redis connection pooling
- [ ] Performance baseline established
- [ ] No memory leaks identified

### Accessibility
- [ ] WCAG 2.1 Level AA compliant
- [ ] ARIA labels on all interactive elements
- [ ] Keyboard navigation working
- [ ] Color not the only differentiator
- [ ] Focus indicators visible

### Build & Deployment
- [ ] Docker builds successfully for all services
- [ ] Multi-stage builds implemented
- [ ] Health checks configured
- [ ] Environment variables externalized
- [ ] Secrets management in place
- [ ] Deploy process documented

### Monitoring & Logging
- [ ] Structured logging implemented (Pino)
- [ ] Error tracking configured (Sentry/similar)
- [ ] Performance monitoring in place
- [ ] Security event logging enabled
- [ ] Alerts configured

---

## 📅 IMPLEMENTATION SCHEDULE

### Week 1: Critical Security & Stability
1. Add input validation to all routes (express-validator)
2. Fix path traversal vulnerability in QA routes
3. Add error handling to upload routes
4. Move hardcoded URLs to environment variables
5. Fix client Dockerfile (multi-stage build)
6. Create backend Dockerfile
7. Add Docker health checks
8. Remove unused imports and type assertions (initial pass)

**Expected Time**: 40-50 hours

### Week 2: Architecture Improvements
1. Extract duplicate trainer code into base function
2. Extract upload logic into separate services
3. Fix worker process error handling
4. Add API key authentication middleware
5. Add rate limiting middleware
6. Add security headers (Helmet)
7. Complete queue system (WAN/LTX handlers)
8. Implement Redis connection pooling
9. Fix memory exhaustion in file uploads

**Expected Time**: 50-60 hours

### Week 3: Testing & Documentation
1. Setup Jest/Vitest test framework
2. Write critical unit tests
3. Write integration tests
4. Add JSDoc comments throughout codebase
5. Create API documentation (Swagger)
6. Create architecture documentation
7. Document environment variables
8. Create deployment guide
9. Configure Prettier and ESLint
10. Update README.md

**Expected Time**: 40-50 hours

### Week 4: Polish & Optimization
1. Implement retry logic for uploads
2. Optimize file operations (streams)
3. Setup E2E testing (Cypress/Playwright)
4. Add accessibility improvements (ARIA)
5. Add error toast notifications
6. Add progress indicators
7. Configure monitoring (Sentry, Pino)
8. Setup CI/CD pipeline
9. Performance testing and optimization
10. Security audit and final fixes

**Expected Time**: 40-50 hours

**Total Expected Timeline**: 4 weeks (170-210 hours)

---

## 📝 Notes for Implementation

### Key Principles
1. **Security First**: Fix all security issues in Week 1 before anything else
2. **Type Safety**: Remove all type assertions early to enable safe refactoring
3. **Error Handling**: Implement proper error handling before optimization
4. **Testing**: Write tests as you refactor to ensure nothing breaks
5. **Documentation**: Document as you code, don't leave it for the end

### Tools & Dependencies to Add
- `helmet` - Security headers
- `express-rate-limit` - Rate limiting
- `express-validator` - Request validation
- `zod` - Runtime type validation
- `pino` - Structured logging
- `jest` or `vitest` - Testing framework
- `swagger-jsdoc` - API documentation

### Files to Create
- `/server/src/services/` - Service layer for business logic
- `/server/src/constants/` - Configuration constants
- `/server/src/middleware/` - Custom middleware
- `/server/src/utils/validation.ts` - Validation helpers
- `/server/tests/` - Unit test files
- `/docs/` - Documentation files
- `.env.example` - Environment variable template
- `.prettierrc.json` - Code formatting config

### Git Strategy
- Create feature branches for each major task
- Use descriptive commit messages
- Request code reviews before merging
- Run tests before every commit

---

**Last Updated**: February 5, 2026  
**Status**: Analysis Complete - Ready for Implementation  
**Next Step**: Begin Week 1 Critical Priority Items 
