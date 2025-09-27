# Zeus E2E Testing Setup Guide

## Architecture: Hybrid Dependencies Pattern (ADR-005)

Zeus follows a hybrid dependency pattern for E2E testing:
- **Production dependencies**: In main `zeus/package.json`
- **E2E testing dependencies**: In `zeus/test/e2e/package.json`
- **Execution context**: Always from Zeus root directory

## Quick Setup

### Option 1: Full Setup from Zeus Root
```bash
cd zeus
npm run test:e2e:setup
```

### Option 2: Manual Setup
```bash
# Install E2E dependencies
cd zeus/test/e2e
npm install

# Install Playwright browsers
npx playwright install

# Return to Zeus root for execution
cd ../..
```

## Running E2E Tests

### From Zeus Root (Recommended)
```bash
# Start Zeus server in background and run E2E tests
npm run debug:e2e

# Or run tests with server already running
npm run test:e2e

# Run tests with visible browser (debugging)
npm run test:e2e:headed
```

### Manual Execution
```bash
# Terminal 1: Start Zeus server
cd zeus && npm start

# Terminal 2: Run E2E tests  
cd zeus && npm run test:e2e
```

## E2E Test Configuration

### Environment Variables
- `HEADED=true` - Run tests with visible browser
- `DEBUG=true` - Enable debug output

### Test Execution Modes
- **Headless** (default): Fast, CI-friendly
- **Headed** (`HEADED=true`): Visual debugging, slower

## Architecture Integration

### Module Resolution
E2E tests follow Zeus centralized module resolution:
- E2E tests execute from Zeus root directory
- Zeus server dependencies available via standard Node.js resolution
- E2E-specific dependencies isolated in `test/e2e/node_modules/`

### Integration Points
- **Server Health Check**: Tests verify Zeus server availability
- **Report Generation**: Results saved to `PLANIFICACION/ITERATIONS/`
- **Debug Protocol**: Integrated with Debug Agent validation workflow

## Troubleshooting

### Common Issues

#### "Cannot find module 'playwright'"
```bash
cd zeus/test/e2e
npm install
npx playwright install
```

#### "Zeus server not available"
```bash
# Check if Zeus server is running
curl http://localhost:3012/health

# Start Zeus server
cd zeus && npm start
```

#### "Browser launch failed"
```bash
# Reinstall Playwright browsers
cd zeus/test/e2e
npx playwright install
```

### Architecture Compliance
- Always execute from Zeus root directory
- Use npm scripts defined in root package.json
- Follow centralized dependency pattern for Zeus components
- Keep E2E dependencies isolated to test directory

## Integration with Debug Protocol

E2E tests integrate seamlessly with Debug Agent protocol:
1. **Manual validation** (Debug Agent UI tour)
2. **Automated E2E testing** (this infrastructure)
3. **Combined reporting** with comprehensive validation results

For complete Debug Agent protocol with E2E integration, see:
- `.github/instructions/debug-agent.instructions.md`
- `.github/chatmodes/debug-validation-agent.chatmode.md`