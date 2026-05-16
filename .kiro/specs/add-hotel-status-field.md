# Add Hotel Status Field to Management UI

## Overview
Add hotel status field (Active/Inactive/Pending) to the hotel management interface so hotel managers can control the visibility of their hotels to customers.

## Requirements

### Functional Requirements

#### FR1: Status Field in Hotel Form
- **Description**: Add a status dropdown field to the hotel creation and editing form
- **Acceptance Criteria**:
  - Status dropdown appears in the hotel form modal (both Add and Edit modes)
  - Dropdown options: "Active", "Inactive", "Pending"
  - Default value for new hotels: "Active"
  - When editing existing hotel, current status is pre-selected
  - Status field is clearly labeled

#### FR2: Status Persistence
- **Description**: Save and update hotel status in the database
- **Acceptance Criteria**:
  - When creating a new hotel, the selected status is saved to the database
  - When updating an existing hotel, the status can be changed and saved
  - Backend validation accepts status field with valid enum values
  - Status is stored in the `hotels.status` column (already exists in database)

#### FR3: Customer Visibility Filter
- **Description**: Only show active hotels to customers in public listings
- **Acceptance Criteria**:
  - Public hotel listing endpoint (`GET /api/hotels`) filters to show only hotels with status='active'
  - Inactive and pending hotels are hidden from customer searches
  - Hotel managers can still see all their hotels (active, inactive, pending) in the admin panel
  - Super admin can see all hotels regardless of status

#### FR4: Status Display in Admin Table
- **Description**: Show hotel status in the admin hotels table
- **Acceptance Criteria**:
  - Add a "Status" column to the hotels table in ManageHotels.jsx
  - Display status with appropriate styling (e.g., green for active, red for inactive, yellow for pending)
  - Status is visible for both hotel managers and super admins

### Non-Functional Requirements

#### NFR1: Minimal Code Changes
- **Description**: Implement with minimal changes to existing codebase
- **Rationale**: User requested a simple, non-disruptive change
- **Constraints**:
  - Only modify necessary files
  - Don't refactor existing working code
  - Maintain current UI/UX patterns

#### NFR2: Backward Compatibility
- **Description**: Ensure existing hotels continue to work
- **Rationale**: Database already has status column with default value
- **Constraints**:
  - Existing hotels without explicit status should default to 'active'
  - No database migration needed (column already exists)

### User Stories

#### US1: Hotel Manager Sets Hotel to Inactive
**As a** hotel manager  
**I want to** set my hotel status to "Inactive"  
**So that** I can temporarily hide it from customer searches when closed for renovation or maintenance

**Acceptance Criteria**:
- I can edit my hotel and select "Inactive" from status dropdown
- After saving, my hotel disappears from customer search results
- I can still see my hotel in my admin panel
- I can change it back to "Active" later

#### US2: New Hotel Starts as Active
**As a** hotel manager  
**I want** newly created hotels to be "Active" by default  
**So that** they are immediately visible to customers after creation

**Acceptance Criteria**:
- When I create a new hotel, status defaults to "Active"
- I can change the status before saving if needed
- Hotel appears in customer searches immediately after creation

#### US3: Customer Only Sees Active Hotels
**As a** customer  
**I want to** only see active hotels in search results  
**So that** I don't waste time looking at hotels that are not currently accepting bookings

**Acceptance Criteria**:
- When I search for hotels, only active hotels appear
- Inactive and pending hotels are not shown
- No error messages or broken links

## Technical Context

### Database Schema
The `hotels` table already has a status column:
```sql
enum('status', ['active', 'inactive', 'pending'])->default('pending')
```

### Files to Modify

1. **Frontend**: `hotel-booking-frontend/src/pages/admin/ManageHotels.jsx`
   - Add status field to formData state
   - Add status dropdown to form modal
   - Add status column to hotels table display

2. **Backend**: `backend/app/Http/Controllers/HotelController.php`
   - Update `store()` method validation to accept status
   - Update `update()` method validation to accept status
   - Update `index()` method to filter by status='active' for public listings
   - Keep `myHotels()` method unchanged (shows all statuses to hotel manager)

### API Changes

#### Request Changes
**POST /api/admin/hotels** (Create Hotel)
```json
{
  "name": "Hotel Name",
  "address": "Address",
  "city": "City",
  "description": "Description",
  "status": "active",  // NEW FIELD
  ...
}
```

**PUT /api/admin/hotels/{id}** (Update Hotel)
```json
{
  "name": "Hotel Name",
  "status": "inactive",  // NEW FIELD
  ...
}
```

#### Response Changes
No changes to response structure - status field already exists in database and is returned.

#### Behavior Changes
**GET /api/hotels** (Public Listing)
- **Before**: Returns all hotels regardless of status
- **After**: Returns only hotels with status='active'

## Success Criteria

1. ✅ Hotel managers can set hotel status via dropdown in the form
2. ✅ Status is saved correctly to the database
3. ✅ Only active hotels appear in customer searches
4. ✅ Hotel managers can see all their hotels regardless of status
5. ✅ Status is displayed in the admin hotels table
6. ✅ No breaking changes to existing functionality

## Out of Scope

- Email notifications when status changes
- Automatic status changes based on booking availability
- Status change history/audit log
- Bulk status updates
- Status-based permissions or workflows

## Dependencies

- None (database column already exists)

## Risks and Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| Existing hotels might have NULL status | Medium | Database default is 'pending', but we'll handle NULL as 'active' in code |
| Hotel managers accidentally set status to inactive | Low | Clear labeling and confirmation could be added later if needed |
| Super admin needs to see all hotels | Low | Keep separate endpoint for admin panel that doesn't filter by status |

## Timeline Estimate

- Frontend changes: 15 minutes
- Backend changes: 10 minutes
- Testing: 10 minutes
- **Total**: ~35 minutes

---

**Status**: ✅ Completed  
**Created**: 2026-05-16  
**Last Updated**: 2026-05-16  
**Implemented**: 2026-05-16
