# API Fixes Required - Action Items

## Critical Fix Required (1 issue)

### 1. Dispute Detail Endpoint Missing /admin Prefix

**Priority:** HIGH
**Impact:** Page will fail with 404 error
**Affected File:** `web-admin/app/disputes/[id]/page.tsx`

#### Current Code (Line 18-19):
```typescript
apiClient
  .get(`/disputes/${params.id}`)
  .then(setDispute)
```

#### Fixed Code:
```typescript
apiClient
  .get(`/admin/disputes/${params.id}`)
  .then(setDispute)
```

#### Backend Endpoint:
- Route: `GET /admin/disputes/:id`
- Controller: `AdminController:440`
- Method: `getDisputeById()`

---

## Documentation Updates (Optional but Recommended)

### 2. Update REMAINING_PAGES.md Examples

**Priority:** LOW
**Impact:** Documentation only

#### Files to Update:
- `web-admin/REMAINING_PAGES.md`

#### Changes Needed:

**Line 203:**
```markdown
<!-- Current -->
apiClient.get('/disputes')

<!-- Should be -->
apiClient.get('/admin/disputes')
```

**Line 269:**
```markdown
<!-- Current -->
apiClient.get(`/disputes/${params.id}`).then(setDispute);

<!-- Should be -->
apiClient.get(`/admin/disputes/${params.id}`).then(setDispute);
```

**Line 274:**
```markdown
<!-- Current -->
await apiClient.put(`/disputes/${params.id}/resolve`, {

<!-- Should be -->
await apiClient.put(`/admin/disputes/${params.id}/resolve`, {
```

---

## Verification Steps

After applying the fix:

1. Start the backend server
2. Start the web-admin dev server
3. Log in to admin panel
4. Navigate to Disputes page (`/disputes`)
5. Click on any dispute to view details (`/disputes/[id]`)
6. Verify the page loads correctly without 404 errors
7. Test resolving a dispute to ensure the PUT endpoint works

---

## Summary

- **Total Issues:** 1 critical, 1 documentation
- **Estimated Fix Time:** 2 minutes
- **Testing Time:** 5 minutes
- **Total Time:** ~10 minutes

All other endpoints (32 out of 33) are correctly implemented and match the backend API specification.
