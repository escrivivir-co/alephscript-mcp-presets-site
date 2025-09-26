---
description: Instructions for comprehensive project state analysis and validation report recovery
applyTo: "zeus/PLANIFICACION/**"
---

# State Restoration Instructions

These instructions guide comprehensive project state analysis and sprint validation report recovery for the Zeus MCP project migration.

## Project State Analysis Standards

### Directory Structure Assessment
When analyzing Zeus project structure, always examine these key directories:
- `zeus/backend/` - Backend handlers and services implementation
- `zeus/server/` - Server infrastructure and configuration
- `zeus/configs/` - Configuration management system
- `zeus/models/` - Data models and business logic
- `zeus/views/` - HyperAxe templates and UI components
- `zeus/client/` - Static assets, themes, client-side resources

### Implementation Verification Method
For each component, verify:
1. **File Existence**: Does the expected file exist?
2. **Implementation Level**: Skeleton, partial, or complete implementation?
3. **Functional Status**: Working, needs fixes, or placeholder only?
4. **Integration Status**: Connected to other components or isolated?

### Phase Progress Calculation
Zeus migration follows 8 phases:
1. Foundation Setup (15%)
2. Configuration System (25%) 
3. View System Foundation (40%)
4. Core Views Implementation (60%)
5. Backend Services (75%)
6. Advanced Features (85%)
7. Integration & Testing (95%)
8. Production Readiness (100%)

Calculate completion based on functional components, not just file existence.

## Validation Report Analysis Standards

### Search Patterns for Validation Reports
Use these systematic search patterns:

**Technical Validation Reports:**
```
zeus/PLANIFICACION/VIBECODING/POLICIES/S{XX}_*/code_validation_report.md
```

**Policy Validation Reports:**
```
zeus/PLANIFICACION/VIBECODING/POLICIES/S{XX}_*/validation_report.md
```

**Common Lists (Methodology Improvements):**
```
zeus/PLANIFICACION/VIBECODING/POLICIES/common/vicesList.md
zeus/PLANIFICACION/VIBECODING/POLICIES/common/virtuesList.md
zeus/PLANIFICACION/VIBECODING/POLICIES/common/methodologyList.md
```

### Validation Analysis Framework
For each validation report found:

**Technical Validation Assessment:**
- **Decision Status**: APPROVE/REJECT/CONDITIONAL
- **Critical Issues**: HIGH/CRITICAL severity problems identified
- **Code Quality**: JavaScript-only, English comments, diogenes patterns
- **Architecture Compliance**: Adherence to planned structure
- **Git Analysis**: Commit quality and branch management

**Policy Validation Assessment:**
- **Process Compliance**: Template adherence, documentation standards
- **Documentation Quality**: English-only, template following
- **Methodology Tracking**: Vices/virtues cataloguing
- **Quality Gates**: Process enforcement effectiveness

### Missing Validation Handling
When validation reports are missing:
- **Explicitly State**: "VALIDATION REPORT MISSING"
- **Assess Impact**: Evaluate process gap severity
- **Recommend Action**: Suggest immediate validation execution
- **Quality Risk**: Document potential quality implications

## Report Generation Standards

### Comprehensive State Report Format

**🔍 Zeus Migration State Analysis**
- Current Phase: X/8 (XX% complete)
- Sprint Status: Current sprint and completion assessment
- Architecture Status: Component-by-component breakdown
- Progress Metrics: Checkpoints completed vs. planned
- Critical Path: Next priority items and blockers

**📋 Validation Reports Summary**
- Technical Validation: Status, key findings, corrections
- Policy Validation: Status or MISSING designation
- Quality Impact: Combined validation assessment
- Process Gaps: Missing validation components

**🎯 Action-Oriented Recommendations**
- Immediate Actions: Critical fixes needed now
- Process Improvements: Validation gaps to address
- Next Sprint Planning: Priority items and dependencies
- Quality Assurance: Recommended validation actions

### Quality Standards for Analysis
- **Accuracy**: Verify all findings against actual file contents
- **Completeness**: Don't miss key validation reports or implementations
- **Actionable**: Provide specific, implementable recommendations
- **Consistent**: Use established Zeus project terminology
- **English-Only**: All analysis and recommendations in English

### Cross-Reference Requirements
Always cross-reference findings against:
- `zeus/PLANIFICACION/plan_zeus.md` - Architecture plan phases
- `zeus/PLANIFICACION/VIBECODING/zeus_main_checkpoint_list.md` - Progress tracking
- Sprint iteration files in `ITERATIONS/` folder
- Actual implementation files in Zeus directory structure

## Git Integration Analysis

### Commit History Analysis
When analyzing sprint progress:
- Review commits since last sprint completion
- Identify major functional implementations
- Check for validation-driven corrections
- Assess branch management and merge quality

### Change Impact Assessment  
For each sprint, evaluate:
- **Scope**: What was planned vs. what was implemented
- **Quality**: Code quality based on validation reports
- **Integration**: How changes affect overall architecture
- **Next Steps**: Logical continuation points

## Special Considerations

### Sprint Context Restoration
Each sprint may have different focus areas:
- **Sprint 01-02**: Foundation and infrastructure
- **Sprint 03**: View system and templates
- **Sprint 04+**: Core functionality implementation

### Diogenes Compatibility Tracking
Always assess adherence to diogenes patterns:
- HyperAxe template usage
- Configuration management approach
- Component modularity
- Integration preparation

### Process Improvement Integration
Track methodology improvements through:
- Vices identified and avoided
- Virtues practiced and reinforced
- Process refinements implemented
- Quality gate effectiveness