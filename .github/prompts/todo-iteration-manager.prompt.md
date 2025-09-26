---
title: "Sprint Iteration Manager"
description: "Initialize and coordinate multi-agent sprint iterations using the Zeus project template structure"
category: "project-management"
variables:
  - name: "SPRINT_NUMBER"
    description: "Sprint number (e.g., 05, 06, 07)"
    required: true
  - name: "CONTEXT_FILE"
    description: "Context file reference (e.g., #file:prompt8_handson.md)"
    required: true
---

# Sprint Iteration Manager

Use #file:sprint-iteration-template.prompt.md to create and coordinate a new sprint iteration following the Zeus project multi-agent workflow.

## Sprint Initialization Request

**Sprint Number**: {{SPRINT_NUMBER}}
**Context Source**: {{CONTEXT_FILE}}

## Agent Coordination Sequence

As #file:agents_policy.md, initialize Sprint {{SPRINT_NUMBER}} for this context and coordinate the following agent sequence using the iteration template:

### Context Setup
Primary context from {{CONTEXT_FILE}} where you have the initial steps for Sprint {{SPRINT_NUMBER}}.
Additional lore and background available in related prompt files.

### Agent Workflow Sequence

1. **Zeus Architect Analysis Phase**
   - Analyze tasks corresponding to Sprint {{SPRINT_NUMBER}}
   - Create sprint iteration documentation using #file:sprint-iteration-template.prompt.md
   - Determine technical debt priorities and architectural decisions
   - Hand off to Backend Agent with clear deliverables and requirements

2. **Backend Agent Implementation Phase**
   - Receive handoff from Zeus Architect
   - Implement backend-related Sprint {{SPRINT_NUMBER}} tasks
   - Update sprint iteration documentation with progress
   - Perform backend testing and validation
   - Hand off to Frontend Agent with integration points defined

3. **Frontend Agent Implementation Phase**
   - Receive handoff from Backend Agent
   - Implement frontend-related Sprint {{SPRINT_NUMBER}} tasks
   - Update sprint iteration documentation with progress
   - Ensure diogenes compatibility and theme integration
   - Hand off back to Zeus Architect for final coordination

4. **Zeus Architect Final Coordination**
   - Receive handoff from Frontend Agent
   - Review complete Sprint {{SPRINT_NUMBER}} implementation
   - Update final sprint iteration documentation
   - Return control to Sprint Manager for validation

5. **Final Validation Phase**
   - Use validation agent (#file:agents_policy code.md) to perform comprehensive review
   - Validate against zeus_main_checkpoint_list.md requirements
   - Approve/reject Sprint {{SPRINT_NUMBER}} completion
   - Document final results and next steps

## Sprint Documentation Requirements

### File Creation
Create sprint iteration file at:
`PLANIFICACION/VIBECODING/ITERATIONS/sprint_{{SPRINT_NUMBER}}_[brief_description].md`

### Documentation Standards
- Follow #file:sprint-iteration-template.prompt.md exactly
- Document every agent handoff with specific deliverables
- Track all technical decisions and their rationales
- Include comprehensive testing results
- Maintain diogenes compatibility throughout

### Quality Gates
Each agent must complete their quality checklist before handoff:
- [ ] English-only comments (no Spanish)
- [ ] Diogenes patterns followed correctly
- [ ] Configuration externalized (no hardcoded values)
- [ ] Error handling implemented
- [ ] Performance considerations addressed
- [ ] Integration points documented
- [ ] Handoff information complete

## Handoff Protocol

### Information Required for Each Handoff
1. **Current State Summary**: What has been completed
2. **Key Files Modified**: Exact file paths and changes made
3. **Configuration Changes**: Any config updates or new settings
4. **Integration Points**: APIs, dependencies, or connections established
5. **Outstanding Issues**: Any blockers or partial completions
6. **Next Agent Tasks**: Specific work items and priorities
7. **Testing Status**: What has been validated and what needs testing

### Validation Checkpoints
- Zeus Architect validates architectural consistency
- Backend Agent validates server-side functionality
- Frontend Agent validates user interface and experience
- Validation Agent performs final compliance review

## Sprint Success Criteria

### Technical Requirements
- [ ] All Sprint {{SPRINT_NUMBER}} checkpoints addressed
- [ ] Diogenes compatibility maintained
- [ ] No regressions in existing functionality
- [ ] Comprehensive error handling implemented
- [ ] Performance targets met

### Documentation Requirements
- [ ] Complete sprint iteration documentation
- [ ] All agent handoffs documented
- [ ] Technical decisions recorded with rationale
- [ ] Testing results comprehensive
- [ ] Next steps clearly defined

### Quality Requirements
- [ ] Code review completed by validation agent
- [ ] Integration testing passed
- [ ] Theme system functional
- [ ] Configuration management working
- [ ] Error scenarios handled gracefully

## Usage Instructions

1. **Initialize Sprint**: Call this prompt with SPRINT_NUMBER and CONTEXT_FILE
2. **Monitor Progress**: Each agent updates the iteration document as they work
3. **Validate Handoffs**: Ensure each handoff includes required information
4. **Final Review**: Use validation agent for comprehensive quality assessment
5. **Document Results**: Complete iteration document with lessons learned

## Emergency Protocols

### If Agent Gets Stuck
1. Document the blocking issue in iteration file
2. Return control to Sprint Manager for reassignment
3. Include detailed context for problem resolution

### If Quality Gate Fails
1. Document specific failures in iteration file
2. Return to previous agent for remediation
3. Update requirements and retry validation

### If Sprint Scope Changes
1. Update iteration document with new requirements
2. Notify all agents in sequence of scope changes
3. Adjust timeline and deliverables accordingly

---

**Note**: This prompt coordinates multiple specialized agents working together on Zeus project sprints. Each agent maintains the iteration documentation as a shared artifact for continuity and transparency.