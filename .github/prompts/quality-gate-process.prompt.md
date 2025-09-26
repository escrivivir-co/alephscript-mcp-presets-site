---
title: "Quality Gate Review Process"
description: "Structured process for validating code quality, documentation, and process compliance"
category: "quality-assurance"
---

# Quality Gate Review Process

Execute this systematic review process before approving any sprint completion or code integration.

## Phase 1: Pre-Review Setup

### Environment Preparation
```bash
# Ensure you're in the correct directory
cd /path/to/zeus/project

# Check git status
git status

# Review recent commits
git log --oneline -n 10

# Identify changed files
git diff --name-only HEAD~5..HEAD
```

### Documentation Preparation
- [ ] Locate current sprint iteration file in `PLANIFICACION/VIBECODING/ITERATIONS/`
- [ ] Open `zeus_main_checkpoint_list.md` for reference
- [ ] Review `zeus_main_context_base.md` for any unauthorized changes
- [ ] Prepare validation report template

## Phase 2: Technical Standards Review

### Language and Syntax Validation
```bash
# Check for Spanish text (should return empty)
grep -r "español\|comentario\|función\|archivo\|configuración" --exclude-dir=node_modules --exclude-dir=.git .

# Check for TypeScript syntax in JS files
find . -name "*.js" -not -path "./node_modules/*" -exec grep -l "interface\|type.*=\|as.*:" {} \;

# Verify no hardcoded URLs
grep -r "localhost:[0-9]\|127\.0\.0\.1" --include="*.js" --exclude="*config*" --exclude-dir=node_modules .
```

### Code Pattern Validation
- [ ] **HyperAxe Usage**: All views use `const { div, h1, ... } = require('hyperaxe')`
- [ ] **Template Pattern**: Views use `template(titlePrefix, ...elements)` wrapper
- [ ] **Configuration Access**: All config via `getConfig()` from config-manager
- [ ] **Navigation Pattern**: Uses diogenes-style `navLink` components
- [ ] **Feature Toggles**: Conditional features use `config.modules.featureMod === 'on'`

### File Organization Review
- [ ] **Single Responsibility**: Each file has one clear concern
- [ ] **Clear Exports**: Uses `module.exports = { ... }` consistently
- [ ] **Import Organization**: All requires at top, logically grouped
- [ ] **Naming Consistency**: Files snake_case, functions camelCase
- [ ] **Directory Structure**: Follows defined zeus architecture

## Phase 3: Documentation Standards Review

### Sprint Documentation Validation
- [ ] **Template Compliance**: Follows `iteration_template.md` structure exactly
- [ ] **Sprint Information**: All header fields completed accurately
- [ ] **Objectives**: Clear, measurable goals with checkboxes
- [ ] **Checkpoints**: Matches actual checkpoints addressed
- [ ] **Technical Approach**: Architecture decisions documented and justified
- [ ] **Work Log**: Every request documented with action/files/result/issues
- [ ] **Testing**: Appropriate testing completed and documented
- [ ] **Deliverables**: All created/modified files listed accurately
- [ ] **Issues**: Problems and resolutions documented clearly
- [ ] **Handoff**: Next steps and dependencies clearly specified
- [ ] **Quality Review**: Quality gates reviewed and passed
- [ ] **Retrospective**: Lessons learned and improvements noted

### Code Documentation Review
- [ ] **Function Comments**: Complex logic explained in clear English
- [ ] **Configuration Comments**: Config files properly documented
- [ ] **API Documentation**: Endpoints documented with inputs/outputs
- [ ] **Error Messages**: Clear, actionable messages for users
- [ ] **Architecture Notes**: Integration points and patterns documented

## Phase 4: Process Compliance Review

### Checkpoint Management Validation
- [ ] **Assignment Compliance**: Only worked on assigned checkpoints
- [ ] **Status Accuracy**: Checkpoint status reflects actual completion
- [ ] **Dependency Respect**: Didn't work on items with incomplete dependencies
- [ ] **Clear Updates**: Status changes documented in iteration file

### Collaboration Standards Review
- [ ] **Communication**: Work status clearly communicated
- [ ] **Issue Escalation**: Blocking issues properly documented
- [ ] **Knowledge Sharing**: Technical discoveries shared appropriately
- [ ] **Protocol Adherence**: Followed defined agent collaboration protocols

## Phase 5: Integration Quality Review

### Diogenes Compatibility Validation
```bash
# Check CSS theme compatibility
ls client/assets/themes/
grep -r "var(--" client/assets/themes/

# Verify navigation structure
grep -r "navLink\|nav(" views/
```

- [ ] **Visual Consistency**: UI matches diogenes styling patterns
- [ ] **Navigation**: Menu structure matches diogenes conventions
- [ ] **Theme Support**: All diogenes themes work correctly
- [ ] **CSS Variables**: Uses diogenes-compatible CSS variables
- [ ] **Component Structure**: Matches diogenes component patterns

### Feature Completeness Review
- [ ] **Asterion Parity**: All original features preserved
- [ ] **User Experience**: No regression from asterion functionality
- [ ] **Performance**: Response times maintained or improved
- [ ] **Reliability**: Stable operation under normal usage

### MCP Integration Validation
- [ ] **Server Communication**: MCP endpoints working correctly
- [ ] **Error Handling**: Proper handling of connection issues
- [ ] **Data Processing**: Responses processed and displayed correctly
- [ ] **Configuration**: MCP settings properly configurable

## Phase 6: Error Handling & Security Review

### Error Management Validation
- [ ] **Comprehensive Coverage**: All error scenarios handled
- [ ] **User Messages**: Clear, helpful error messages
- [ ] **Logging**: Appropriate error logging for debugging
- [ ] **Graceful Degradation**: Non-critical failures don't break system
- [ ] **Recovery Paths**: Clear recovery procedures for errors

### Security Review
- [ ] **Input Validation**: All user inputs sanitized
- [ ] **Configuration Security**: No sensitive data hardcoded or exposed
- [ ] **File Access**: Proper file path validation
- [ ] **Error Information**: No sensitive data in error messages

## Phase 7: Performance & Optimization Review

### Performance Validation
```bash
# Check file sizes
find . -name "*.js" -o -name "*.css" | xargs ls -lh

# Look for potential performance issues
grep -r "while.*true\|for.*in.*for\|setTimeout.*0" --include="*.js" .
```

- [ ] **Response Times**: Page loads under 2 seconds
- [ ] **Memory Usage**: No obvious memory leaks
- [ ] **CPU Usage**: No blocking operations on main thread
- [ ] **Asset Optimization**: CSS/JS reasonably optimized
- [ ] **Resource Management**: Proper cleanup of resources

## Phase 8: Decision Making

### APPROVE Criteria (All Must Pass ✅)
- [ ] **Technical Standards**: All code quality checks pass
- [ ] **Documentation**: Complete, accurate documentation
- [ ] **Process Compliance**: All workflow standards met
- [ ] **Integration Quality**: Diogenes compatibility verified
- [ ] **Error Handling**: Comprehensive error management
- [ ] **Performance**: Acceptable performance characteristics

### REJECT Criteria (Any Triggers Rejection ❌)
- Spanish comments or strings found
- TypeScript syntax in JavaScript files
- Hardcoded configuration values
- Missing or incomplete work log documentation
- Checkpoint status inaccuracy
- Non-diogenes pattern implementation
- Missing error handling
- Breaking changes without documentation

## Phase 9: Report Generation

### Validation Report Template
```markdown
# Sprint Validation Report - [Sprint ID]

**Date**: [Current Date]
**Validator**: [Your Name]  
**Decision**: APPROVE ✅ / REJECT ❌

## Technical Standards Review
- **Language Consistency**: PASS/FAIL - [Details]
- **Code Patterns**: PASS/FAIL - [Details]  
- **File Organization**: PASS/FAIL - [Details]

## Documentation Review
- **Sprint Documentation**: PASS/FAIL - [Details]
- **Code Documentation**: PASS/FAIL - [Details]

## Process Compliance
- **Checkpoint Management**: PASS/FAIL - [Details]
- **Collaboration**: PASS/FAIL - [Details]

## Integration Quality
- **Diogenes Compatibility**: PASS/FAIL - [Details]
- **Feature Completeness**: PASS/FAIL - [Details]

## Issues Identified
1. **[Category]**: [Description] - Severity: [Critical/High/Medium/Low]
2. **[Category]**: [Description] - Severity: [Critical/High/Medium/Low]

## Required Actions (if REJECT)
1. [Specific correction needed]
2. [Specific correction needed]

## Recommendations
- [Improvement suggestions]
- [Process enhancements]
- [Quality improvements]
```

### Quality Tracking Updates

After validation, update these files:

**Vices List** (`POLICIES/common/vicesList.md`)
- Add new anti-patterns discovered
- Document recurring quality issues

**Virtues List** (`POLICIES/common/virtuesList.md`)
- Record excellent implementation examples
- Document best practices observed

**Methodology List** (`POLICIES/common/medologyList.md`)
- Note process improvements identified
- Suggest methodology enhancements

## Emergency Procedures

### Rollback Protocol
1. Document issue severity and scope
2. Identify last known good state
3. Execute rollback to stable checkpoint
4. Update checkpoint status to reflect rollback
5. Create recovery plan for fix approach

### Escalation Guidelines
- **Critical Issues**: Immediate user notification required
- **Architecture Changes**: User approval needed before proceeding
- **Scope Changes**: Checkpoint list updates require approval
- **Blocking Dependencies**: Document and request guidance

Execute this process systematically to ensure consistent quality standards across all Zeus project development.