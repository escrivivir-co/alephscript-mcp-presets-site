---
description: Restore complete state analysis for any Zeus project sprint including project status and validation reports
mode: ask
model: Claude Sonnet 3.5
tools: ['codebase', 'search', 'git']
---

# Sprint State Restoration Prompt

Perform a comprehensive state restoration for Zeus project sprint **${input:sprint_number}**. This involves two critical actions:

## Action 1: Project Status Analysis

Analyze the current state of the Zeus migration project by examining:

### Project Structure Analysis
1. **Directory Structure**: Examine the complete Zeus project structure
2. **Implementation Status**: Check which files exist and their completion state
3. **Phase Progress**: Determine current phase (1-8) and completion percentage
4. **Architecture Components**: Verify backend, frontend, configs, models, views status

### Progress Metrics
1. **Checkpoint Matrix**: Check `zeus_main_checkpoint_list.md` for completed checkpoints
2. **Sprint Documentation**: Review current and completed sprint iterations
3. **Technical Debt**: Identify pending implementations and blockers
4. **Next Steps**: Determine critical path forward

### Key Files to Examine
- `zeus/PLANIFICACION/plan_zeus.md` - Architecture plan and phases
- `zeus/PLANIFICACION/VIBECODING/zeus_main_checkpoint_list.md` - Progress tracking
- `zeus/PLANIFICACION/VIBECODING/ITERATIONS/` - Sprint documentation
- Zeus implementation files in `backend/`, `server/`, `configs/`, `models/`, `views/`, `client/`

## Action 2: Validation Reports Analysis  

Locate and analyze both validation reports for **Sprint ${input:sprint_number}**:

### Technical Validation Report
Search pattern: `POLICIES/S${input:sprint_number}_*/code_validation_report.md`
Analyze:
- **Decision Status**: APPROVE/REJECT
- **Critical Issues**: Document all HIGH/CRITICAL severity problems  
- **Corrections Applied**: List any post-validation fixes
- **Technical Standards**: Code quality, architecture compliance
- **Git Changes**: Commit analysis and branch status

### Policy Validation Report  
Search pattern: `POLICIES/S${input:sprint_number}_*/validation_report.md`
Analyze:
- **Process Compliance**: Template adherence, documentation standards
- **Methodology Improvements**: Vices/Virtues detected and catalogued
- **Quality Gates**: Policy enforcement and standards compliance
- **Documentation Review**: English-only compliance, template following

### Common Lists Impact
Check if validation updated:
- `POLICIES/common/vicesList.md` - Anti-patterns detected
- `POLICIES/common/virtuesList.md` - Good practices identified  
- `POLICIES/common/methodologyList.md` - Process improvements

## Expected Output Format

Provide a comprehensive report with these sections:

### 🔍 Zeus Migration State Analysis
- **Current Phase**: X/8 with completion percentage
- **Sprint Status**: Current sprint and completion state
- **Architecture Status**: Component-by-component analysis
- **Progress Metrics**: Checkpoints completed, functionality migrated
- **Critical Path**: Next steps and blockers

### 📋 Validation Reports Summary
- **Technical Validation**: Status, issues, corrections
- **Policy Validation**: Status or MISSING if not found
- **Quality Impact**: Combined assessment of validation results
- **Process Gaps**: Any missing validation components

### 🎯 Recommendations  
- **Immediate Actions**: Critical fixes needed
- **Process Improvements**: Validation gaps to address
- **Next Sprint Planning**: Priority items and dependencies

## Usage Examples

To restore state for Sprint 03:
```
/sprint-state-restoration sprint_number=03
```

To analyze current project state:
```  
/sprint-state-restoration sprint_number=current
```

## Reference Documentation

- [Zeus Architecture Plan](../../zeus/PLANIFICACION/plan_zeus.md)
- [Checkpoint List](../../zeus/PLANIFICACION/VIBECODING/zeus_main_checkpoint_list.md)
- [Agent Guidelines](../../zeus/PLANIFICACION/VIBECODING/agents.md)
- [Validation Policy](../../zeus/PLANIFICACION/VIBECODING/agents_policy.md)