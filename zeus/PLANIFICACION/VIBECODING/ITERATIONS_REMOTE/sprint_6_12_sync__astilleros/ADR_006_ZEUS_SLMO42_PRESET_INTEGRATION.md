# 🏗️ Zeus Architect - Decisión Arquitectural Oficial

**ADR-006: Zeus-SLMo42 Preset Integration Architecture**  
**Date**: October 2, 2025  
**Status**: ✅ **APPROVED** - Implementation Authorized  
**Authority**: Zeus Architect  
**Based on**: Integration Agent Indra E2E Testing Report

## 📋 Problem Statement

**Critical Issue**: Zeus Editor preset creation fails due to API contract mismatch between Zeus Backend and SLMo42 service.

**Root Cause**: Missing data transformation layer in Zeus Backend to convert Zeus internal format to SLMo42 API contract format.

**Impact**: Complete preset creation functionality broken, blocking core MCP integration features.

## 🎯 Architectural Decision: **OPTION A APPROVED**

### **Decision**: Implement Backend Transformation Layer

**Rationale**:
1. **Service Specialization Principle**: Each service maintains its own optimized API contract
2. **Diogenes Compatibility**: Follows established adapter pattern for service integration
3. **Minimal Disruption**: No UI changes required, SLMo42 API remains stable
4. **Maintainability**: Centralized transformation logic in single location
5. **Future-Proof**: Allows Zeus to adapt to other MCP services without UI changes

### **Implementation Location**: `zeus/server/api_extensions.js`

**Pattern**: **Adapter Pattern** - Zeus Backend acts as adapter between Zeus UI and SLMo42 service

## 🔧 Implementation Specification

### **Phase 1: Data Transformation Function**

**File**: `zeus/server/api_extensions.js`
**Function**: `transformZeusToSlmo42Format(presetData, serverContent)`

```javascript
/**
 * Transform Zeus preset format to SLMo42 API contract format
 * @param {Object} presetData - Zeus internal preset structure
 * @param {Object} serverContent - MCP server catalog data for type detection
 * @returns {Object} SLMo42-compatible preset structure
 */
function transformZeusToSlmo42Format(presetData, serverContent) {
  // Input: Zeus format
  // {
  //   name: "my-preset",
  //   items: ["list_prompts", "get_system_info", "add_resource"],
  //   serverId: "localhost",
  //   prompt: "System status check"
  // }
  
  const selectedItems = presetData.items.map(itemId => {
    // Detect item type from serverContent catalog
    const toolMatch = serverContent.tools?.find(t => (t.name || t.id) === itemId);
    const resourceMatch = serverContent.resources?.find(r => (r.name || r.id) === itemId);  
    const promptMatch = serverContent.prompts?.find(p => (p.name || p.id) === itemId);
    
    // Default to 'tool' if type detection fails
    let itemType = 'tool';
    if (resourceMatch) itemType = 'resource';
    else if (promptMatch) itemType = 'prompt';
    
    return {
      serverName: presetData.serverId || 'localhost',
      type: itemType,
      name: itemId
    };
  });
  
  // Output: SLMo42 format
  return {
    presetName: presetData.name,
    selectedItems: selectedItems
  };
}
```

### **Phase 2: Integration Point Update**

**File**: `zeus/server/api_routes.js` (line ~386)
**Current**:
```javascript
const sync = await apiExtensions.syncPresetToSlmo42({
  presetName: preset?.name,
  serverId: presetData.serverId,
  items: Array.isArray(presetData.items) ? presetData.items : [],
  serverContent: req.body.serverContent
});
```

**Updated**:
```javascript
// Transform Zeus format to SLMo42 format before sync
const slmo42Payload = apiExtensions.transformZeusToSlmo42Format({
  name: preset.name,
  items: Array.isArray(presetData.items) ? presetData.items : [],
  serverId: presetData.serverId
}, req.body.serverContent || {});

const sync = await apiExtensions.syncPresetToSlmo42(slmo42Payload);
```

### **Phase 3: Error Handling Enhancement**

**Validation Requirements**:
1. ✅ Verify `presetData.name` exists (already implemented)
2. ✅ Verify `presetData.prompt` exists (already implemented) 
3. 🆕 Verify `presetData.items` is non-empty array
4. 🆕 Verify `serverContent` available for type detection
5. 🆕 Handle SLMo42 service unavailability gracefully

```javascript
// Additional validation in api_routes.js
if (!Array.isArray(presetData.items) || presetData.items.length === 0) {
  return res.status(400).json({
    success: false,
    error: 'At least one item must be selected for preset creation'
  });
}
```

## 🔗 Integration Architecture (Post-Fix)

```
Zeus Editor Form
     ↓ (Zeus Format: {name, items[], prompt, serverId})
Zeus Backend API (/api/presets)  
     ↓ (Transform via api_extensions.js)
Zeus→SLMo42 Adapter
     ↓ (SLMo42 Format: {presetName, selectedItems[{serverName,type,name}]})
SLMo42 Service (/ai/ui/mcp/set)
     ↓ (MCP Protocol)  
MCPGaia Service
     ↓
Preset Storage (PRESETS/mcp_presets.json)
```

## 📝 Implementation Plan

### **Backend Agent Tasks**:
1. **Create**: `transformZeusToSlmo42Format()` function in `api_extensions.js`
2. **Update**: `syncPresetToSlmo42()` call in `api_routes.js` 
3. **Enhance**: Error handling for transformation failures
4. **Test**: Local validation with mock data

### **Integration Agent Tasks**:
1. **Validate**: Complete E2E workflow after backend changes
2. **Test**: Error scenarios (missing serverContent, invalid items)
3. **Verify**: SLMo42 receives correctly formatted payload
4. **Confirm**: MCPGaia preset creation successful

### **No Frontend Changes Required**: ✅
- Form structure remains unchanged
- JavaScript payload structure remains unchanged  
- User experience unchanged

## 🛡️ Risk Assessment

**Technical Risks**: 🟢 **LOW**
- Transformation logic is straightforward mapping
- Existing error handling patterns can be reused
- Changes isolated to single backend file

**Integration Risks**: 🟢 **LOW**  
- SLMo42 API contract well-documented and stable
- Backward compatibility maintained for Zeus frontend
- Graceful degradation if SLMo42 unavailable

**Timeline Risks**: 🟢 **LOW**
- Implementation scope clearly defined
- No UI changes reduce complexity
- Testing can use existing infrastructure

## ⏱️ Implementation Timeline

**Phase 1**: Backend Transformation (4 hours)
- Implement `transformZeusToSlmo42Format()`
- Update `api_routes.js` integration point  
- Add error handling and validation

**Phase 2**: Integration Testing (2 hours)
- E2E testing with all services running
- Error scenario testing
- Performance validation

**Total ETA**: **6 hours** for complete resolution

## ✅ Approval and Authorization

**Zeus Architect Decision**: ✅ **APPROVED**
**Implementation Authority**: Backend Agent
**Validation Authority**: Integration Agent Indra
**Pattern**: ADR-006 Backend Adapter Pattern for External Service Integration

**Priority**: **P0 - Critical**
**Status**: **Ready for Implementation**

---

### **Alternative Options Rejected**:

**Option B (Modify Zeus Frontend)**: ❌ Rejected
- Reason: Violates service isolation, requires major UI changes

**Option C (Modify SLMo42 Backend)**: ❌ Rejected  
- Reason: Breaks compatibility with other SLMo42 clients, violates service ownership

**Option D (Create Translation Service)**: ❌ Rejected
- Reason: Over-engineering for single transformation, adds unnecessary complexity

---

**This decision follows Zeus architectural principles and maintains system integrity while providing immediate resolution to the critical preset creation issue.**