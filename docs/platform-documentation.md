# SocioHub Platform Documentation - Enhanced for RAG

## Table of Contents

1. [Societies Management](#societies-management)
2. [Members Management](#members-management)
3. [Role Management](#role-management)
4. [Join Requests Management](#join-requests-management)
5. [Society Profile Pages](#society-profile-pages)
6. [Access Control and Privileges](#access-control-and-privileges)
7. [Content Management](#content-management)
8. [User Profiles and Settings](#user-profiles-and-settings)
9. [Announcements System](#announcements-system)

---

## Societies Management

### Overview

The Societies tab on the Explore page displays all registered societies available on the SocioHub platform. This section manages society discovery, registration, and initial member onboarding.

### Society Display Components

**Society Cards** include the following elements:

- **Society Name**: Official registered name
- **Society Description**: Vision statement or brief overview
- **Society Logo**: Visual brand identifier
- **Join Society Button**: Primary call-to-action for membership

### Society Registration Process

#### Initial Registration Form

When students click the **Join Society** button, they complete a comprehensive registration form with these required fields:

| Field                     | Type             | Purpose                           |
| ------------------------- | ---------------- | --------------------------------- |
| WhatsApp Number           | Contact          | Primary communication channel     |
| Semester                  | Dropdown         | Academic level verification       |
| Interested Role           | Dynamic Dropdown | Role preference based on semester |
| Reason for Joining        | Text Area        | Motivation assessment             |
| Expectations from Society | Text Area        | Goal alignment                    |
| Relevant Skills           | Text Area        | Capability matching               |
| Agreement Checkbox        | Boolean          | Society rules acceptance          |

#### Role Filtering Logic

- **Semester Selection**: Must be completed before role selection
- **Role Availability**: Only roles meeting minimum semester requirements are displayed
- **Dynamic Updates**: Role options refresh based on semester input

#### Request Processing Workflow

1. **Submission**: Join request stored in database
2. **PDF Generation**: Automated document creation using Puppeteer and HTML templates
3. **Status Tracking**: Students can cancel requests before acceptance/rejection
4. **Profile Access**: Society cards link to detailed profile pages

**Keywords**: society registration, join society, membership application, role filtering, semester requirements

---

## Members Management

### Overview

The Members Management system provides comprehensive tools for society administrators to manage their membership base. Access levels vary between Advisors and authorized Students.

### Primary Controls

Available to users with **Member Management** privilege:

- **Manage Roles**: Access to Role Management panel
- **View Join Requests**: Display pending membership applications

### Member Table Structure

#### Display Information

Each member entry shows:

- **Member Name**: Full registered name
- **Registration Number**: Unique student identifier
- **Email Address**: Primary contact method
- **Assigned Roles**: Current permission set
- **Actions Dropdown**: Context-sensitive options

#### Available Actions by Privilege Level

| Action        | Required Privilege | Function                      |
| ------------- | ------------------ | ----------------------------- |
| View Profile  | None               | Access public member profile  |
| Send Message  | None               | Initiate private conversation |
| Manage Roles  | Member Management  | Assign/remove member roles    |
| Assign Task   | Task Management    | Create task assignments       |
| Remove Member | Member Management  | Terminate membership          |

### Member Removal Process

#### Predefined Removal Reasons

```json
{
  "eligibility_criteria": {
    "title": "Does Not Meet Eligibility Criteria",
    "description": "Academic, semester, or department requirements not fulfilled"
  },
  "incomplete_application": {
    "title": "Incomplete or Inaccurate Application",
    "description": "Missing essential information or incorrect details"
  },
  "quota_reached": {
    "title": "Quota or Membership Limit Reached",
    "description": "Maximum membership capacity exceeded"
  },
  "objective_mismatch": {
    "title": "Mismatch with Society Objectives",
    "description": "Applicant interests don't align with society goals"
  },
  "conduct_violation": {
    "title": "Violation of Previous Conduct Rules",
    "description": "History of disciplinary issues or prior removals"
  },
  "custom_reason": {
    "title": "Other",
    "description": "Custom reasoning required"
  }
}
```

**Keywords**: members management, member removal, role assignment, member privileges, society administration

---

## Role Management

### Overview

Role Management enables societies to create custom hierarchical structures with specific permission sets and member assignments.

### Access Requirements

- **Required Privilege**: Member Management
- **Access Point**: "Manage Roles" button on Members page

### Role Management Panel Features

#### Role Display Information

- **Role Identification**: Name and description
- **Member Assignment**: List of users with this role
- **Management Actions**: Edit and delete options

#### Role Creation Process

##### Step 1: Basic Information

- **Role Name**: Unique identifier within society
- **Role Description**: Purpose and responsibilities
- **Minimum Semester Requirement**: Academic eligibility threshold

##### Step 2: Privilege Assignment

**Minimum Requirement**: At least one privilege must be assigned

**Available Privileges**:

| Privilege Key                 | Title                          | Description                            |
| ----------------------------- | ------------------------------ | -------------------------------------- |
| `event_management`            | Event Management               | Create, update, delete events          |
| `member_management`           | Member Management              | Invite, approve, remove members        |
| `announcement_management`     | Announcement Management        | Create, publish announcements          |
| `content_management`          | Content Management             | Manage society posts and content       |
| `event_ticket_handling`       | Event Ticket Handling          | Scan and validate event tickets        |
| `payment_finance_management`  | Payment and Finance Management | Manage finances, payments, withdrawals |
| `society_settings_management` | Society Settings Management    | Update society configuration           |
| `task_management`             | Task Management                | Assign tasks to members                |
| `meeting_management`          | Meeting Management             | Initiate and manage video meetings     |
| `teams_management`            | Teams Management               | Create and manage society teams        |

##### Step 3: Member Assignment (Optional)

- **Member Selection**: Assign existing members to the role
- **Interest Matching**: Display member's preferred role from join request
- **Future Assignment**: Members can be assigned later if needed

#### Role Editing

- **Process**: Multi-step form with pre-populated data
- **Update Method**: Modifies existing role (not creating new entry)
- **Preservation**: Maintains existing member assignments unless changed

**Keywords**: role management, privileges, permissions, role creation, member roles, society hierarchy

---

## Join Requests Management

### Overview

The Join Requests system manages incoming membership applications, providing review and decision-making tools for authorized society members.

### Access Requirements

- **Required Privilege**: Member Management
- **Access Point**: "View Join Requests" button on Members page

### Requests Panel Features

#### Request Display Information

- **Student Name**: Applicant identification
- **Registration Number**: Unique student ID
- **Email Address**: Contact information
- **Request Date**: Application timestamp
- **Review Action**: "View Request" button

### Request Review Process

#### Request Details Modal

Displays complete Society Registration Form data submitted by applicant.

#### Available Actions

- **Accept**: Approve request and add student to society
- **Reject**: Deny request with mandatory reason selection
- **Download PDF**: Access system-generated application document

#### PDF Documentation

- **Purpose**: Physical record keeping and interview preparation
- **Generation**: Automated using Puppeteer and HTML templates
- **Format**: Professional application summary

### Requests History

- **Access**: "Requests History" button (top-right of panel)
- **Scope**: All accepted/rejected requests within last 30 days
- **Purpose**: Decision tracking and audit trail

**Keywords**: join requests, membership applications, request review, application approval, membership decisions

---

## Society Profile Pages

### Overview

Society Profile Pages serve as comprehensive showcases for society information, providing both public visibility and member-specific functionality.

### Society Header Components

#### Visual Identity

- **Society Logo & Name**: Primary brand representation
- **Member Count**: Current membership total
- **Upcoming Events**: Preview of scheduled activities

#### Action Buttons (Context-Dependent)

- **For Non-Members**: "Join Society" button (triggers registration process)
- **For Authorized Users**: "Edit Profile" button (requires `settings_management` privilege)
  - Redirects to Public Profile Settings in society Settings page

### Leadership Display

#### Society Leadership Structure

- **Advisor Card**: Featured society advisor information
- **Office Bearers**: Four prominent leadership positions displayed

### Content Sections (Tabbed Interface)

#### Tab 1: Posts

**Post Cards** featuring:

- **Media Carousel**: Up to 5 images/videos per post
- **Engagement Options**: Like and comment functionality
- **Event Badge**: Appears for completed event-related posts
- **Management Actions**: Edit/delete (requires `content_management` privilege or advisor status)

#### Tab 2: Events

- **Event Categories**: Completed and upcoming events
- **Display Format**: Event Cards (consistent with Events tab structure)
- **Comprehensive View**: Full society event history and schedule

#### Tab 3: More Info

**Detailed Society Information**:

- **Vision**: Long-term goals and aspirations
- **Mission**: Core purpose and objectives
- **Statement of Purpose**: Formal organizational mission
- **Core Values**: Fundamental principles and beliefs
- **Faculty Advisor Message**: Personal communication from advisor

**Keywords**: society profile, society information, society posts, society events, society leadership, society vision mission

---

## Access Control and Privileges

### Overview

SocioHub implements granular access control through privilege-based systems, ensuring users only access features relevant to their authorized roles.

### Sidebar Access Control

#### Student Society Menu Privileges

Within each society's submenu, visibility is controlled by specific privileges:

| Menu Item          | Required Privilege               | Purpose                       |
| ------------------ | -------------------------------- | ----------------------------- |
| Payments & Finance | `Payment and Finance Management` | Financial operations access   |
| Create Post        | `Content Management`             | Content creation capabilities |
| Settings           | `Society Settings Management`    | Configuration management      |

#### Permission Enforcement

- **Conditional Visibility**: Menu items appear only with appropriate privileges
- **Role-Based Access**: Different privilege sets for different member types
- **Security**: Prevents unauthorized access to sensitive functionality

### Privilege Categories

#### Administrative Privileges

- **Member Management**: User lifecycle management
- **Society Settings Management**: Organizational configuration
- **Payment Finance Management**: Financial operations

#### Content Privileges

- **Content Management**: Post and media management
- **Announcement Management**: Communication tools
- **Event Management**: Event lifecycle management

#### Operational Privileges

- **Task Management**: Work assignment capabilities
- **Meeting Management**: Virtual meeting coordination
- **Teams Management**: Sub-group organization
- **Event Ticket Handling**: Event access control

**Keywords**: access control, user privileges, sidebar permissions, role-based access, privilege management

---

## Content Management

### Overview

The Content Management system enables authorized users to create, edit, and publish content on society public pages.

### Create Post Page

#### Form Structure

**Required Access**: `Content Management` privilege

#### Form Fields

| Field            | Type              | Specifications         | Purpose                   |
| ---------------- | ----------------- | ---------------------- | ------------------------- |
| Post Content     | Text Area         | Rich text support      | Main post content/caption |
| Post Media       | File Upload       | Max 5 files, 10MB each | Visual content attachment |
| Connect to Event | Optional Dropdown | Completed events only  | Event gallery creation    |

#### Media Upload Specifications

- **File Limit**: Maximum 5 files per post
- **Size Limit**: 10MB per individual file
- **Supported Formats**: `.jpg`, `.png`, `.gif`, `.mp4`, and other standard formats
- **Upload Process**: Drag-and-drop or file browser selection

#### Event Connection Feature

- **Purpose**: Create event galleries and documentation
- **Availability**: Only completed events can be linked
- **Search Functionality**: Searchable input with flyout results
- **Optional Feature**: Posts can exist without event connection

#### Post Submission Process

1. **Form Validation**: All required fields checked
2. **Media Processing**: Files uploaded and processed
3. **Database Storage**: Post information saved
4. **Public Display**: Content appears on society's Public Facing Page
5. **Visibility**: Accessible to all platform users

**Keywords**: create post, content management, post media, event gallery, society posts, content creation

---

## User Profiles and Settings

### Overview

The User Profile and Settings system manages personal information, profile customization, and inter-user communication features.

### Personal Settings

#### Access Method

1. Navigate to **Top Bar**
2. Click **Chevron Down** icon next to Avatar Group
3. Select **Settings** from dropdown menu
4. Opens **Edit Profile** page

#### Editable Profile Fields

| Field        | Type         | Purpose                       |
| ------------ | ------------ | ----------------------------- |
| Avatar       | Image Upload | Profile picture customization |
| First Name   | Text Input   | Personal identification       |
| Last Name    | Text Input   | Complete name display         |
| Phone Number | Tel Input    | Contact information           |
| Bio          | Text Area    | Personal description          |

#### Profile Management

- **Real-time Updates**: Changes saved immediately
- **Validation**: Required field checking and format validation
- **Privacy**: Personal information control

### User Profile Pages

#### Profile Information Display

**Basic Information Section**:

- **Full Name**: Combined first and last name
- **Avatar**: Profile picture display
- **Registration Number**: Unique student identifier
- **Email Address**: Primary contact method
- **Bio**: Personal description or statement

#### Society Affiliations

**For Students**:

- **Current Memberships**: List of joined societies
- **Role Information**: Positions held within societies

**For Advisors**:

- **Advised Society**: Primary society responsibility
- **Advisory Role**: Official capacity and responsibilities

#### Profile Actions

| Action       | Availability          | Function                      |
| ------------ | --------------------- | ----------------------------- |
| Edit Profile | Own profile only      | Redirect to Personal Settings |
| Send Message | Other users' profiles | Open chat window              |

#### Communication Features

- **Direct Messaging**: Peer-to-peer communication initiation
- **Profile Discovery**: User information accessibility
- **Society Transparency**: Clear organizational relationships

**Keywords**: user profile, personal settings, profile editing, user communication, profile information, avatar upload

---

## Announcements System

### Overview

The Announcements system facilitates society-to-student communication through targeted messaging capabilities with role-based access control.

### Announcements Tab (Explore Page)

#### Announcement Cards Display

Each announcement card includes:

- **Society Name and Logo**: Source identification
- **Announcement Title**: Primary message heading
- **Announcement Content**: Full message content or preview

#### Purpose and Functionality

- **Real-time Communication**: Latest updates and notices
- **Society Visibility**: Cross-society announcement discovery
- **Student Engagement**: Relevant opportunity highlighting

### Announcements Page

#### Role-Based Content Visibility

**Students (Normal Members)**:

- **Access Level**: Published announcements only
- **Scope**: Societies they have joined
- **Restriction**: Cannot create or schedule announcements

**Society Advisors and Privileged Members**:

- **Access Level**: Published and scheduled announcements
- **Management Rights**: Full creation and editing capabilities
- **Additional Feature**: "Create New Announcement" button access

### Create Announcement Form

#### Access Requirements

- **Society Advisors**: Full access by default
- **Privileged Members**: Requires `announcements_management` privilege

#### Form Fields and Options

| Field                | Type             | Options/Specifications                   |
| -------------------- | ---------------- | ---------------------------------------- |
| Announcement Title   | Text Input       | Required field                           |
| Announcement Content | Rich Text Editor | Full content body                        |
| Publish Immediately  | Toggle Switch    | Default: enabled                         |
| Publish Date & Time  | DateTime Picker  | Appears when immediate publish disabled  |
| Audience             | Radio Buttons    | `All Students` or `Society Members Only` |
| Send Email           | Toggle Switch    | Email notification option                |

#### Publishing Options

**Immediate Publishing**:

- **Default Behavior**: Announcement goes live immediately
- **Instant Visibility**: Appears on relevant pages immediately

**Scheduled Publishing**:

- **DateTime Selection**: Future publication timing
- **Advanced Planning**: Content preparation in advance
- **Automatic Release**: System-managed publication

#### Audience Targeting

**All Students**:

- **Scope**: Platform-wide visibility
- **Use Case**: General announcements, open events

**Society Members Only**:

- **Scope**: Internal communication
- **Use Case**: Member-specific updates, internal events

#### Email Notifications

- **Optional Feature**: Toggle-controlled email sending
- **Recipient Matching**: Aligns with selected audience
- **Delivery**: Automated email distribution

### Content Management

#### Editing and Deletion Rights

- **Authorized Users**: Advisors and members with `announcements_management` privilege
- **Content Scope**: All announcements (published and scheduled)
- **Management Actions**: Full edit and delete capabilities
- **Status Independence**: Can modify regardless of publication status

#### Content Lifecycle

1. **Creation**: Form-based announcement creation
2. **Scheduling**: Optional future publication timing
3. **Publication**: Manual or automatic content release
4. **Management**: Ongoing editing and deletion capabilities
5. **Archival**: Historical announcement preservation

**Keywords**: announcements, society announcements, announcement creation, audience targeting, email notifications, content publishing, scheduled announcements

---

## FAQ and Common Use Cases

### How do students join societies?

Students browse the Societies tab, click "Join Society" on desired society cards, complete the registration form with personal information and role preferences, and submit their application for review.

### What privileges are needed for content management?

Content creation requires the `Content Management` privilege. This allows users to create posts, upload media, and connect content to completed events.

### How are roles assigned in societies?

Users with `Member Management` privilege access the Role Management panel, create roles with specific privileges and semester requirements, then assign members to appropriate roles.

### What information is shown on society profiles?

Society profiles display leadership information, member count, upcoming events, posts with media carousels, event history, and detailed organizational information including vision, mission, and values.

### How do announcements work?

Authorized users create announcements with audience targeting (all students or society members), optional email notifications, and scheduling options. Students see announcements from societies they've joined.

---

---

## Events Management System

### Overview

The Events Management System is a comprehensive platform feature that handles event discovery, creation, registration, and administration across the SocioHub platform.

### Events Tab (Explore Page)

#### Event Discovery Interface

The Events tab provides a centralized location for students to discover campus activities and events.

**Event Card Components**:

- **Banner Image**: Visual event representation at card top
- **Event Title**: Primary event identifier
- **Event Categories**: Topical classification tags
- **Date Range**: Start and end date display
- **Location Information**: Physical venue or online platform details
- **Pricing**: Ticket cost for paid events
- **Registration Deadline**: Application cutoff date (when applicable)

#### Event Search and Filtering

**Search Functionality**:

- **Keyword Search**: Title and description matching
- **Real-time Results**: Dynamic result updates
- **Search Scope**: All visible events

**Filter Options**:
| Filter Type | Options | Purpose |
|-------------|---------|---------|
| Status | Upcoming, Past | Event timeline filtering |
| Category | Workshop, Seminar, Social, etc. | Topic-based filtering |

#### Event Actions

**Available Actions**:

- **View Detail**: Navigate to comprehensive Event Detail Page
- **Register Now**: Direct registration (conditional availability)
  - **Visibility Conditions**: Registration required AND deadline not passed
  - **Instant Access**: One-click registration process

**Keywords**: event discovery, event search, event filtering, event registration, upcoming events, past events

### Events Page (Society Management)

#### Event Management Interface

Society-specific event management with role-based access control and comprehensive event lifecycle management.

#### Visibility Levels

**All Users (Students and Advisors)**:

- **Upcoming Events**: Future scheduled events
- **Completed Events**: Historical event records

**Privileged Users (Advisors + Event Management Privilege)**:

- **Draft Events**: Unpublished event preparations
- **Cancelled Events**: Terminated event records

#### Event Management Actions

**Context-Sensitive Actions**:
| Action | Availability Conditions | Purpose |
|--------|------------------------|---------|
| Edit Event | Draft, Upcoming, Ongoing status | Event modification |
| Delete | Draft or Completed status | Permanent removal |
| Cancel | Upcoming or Ongoing status | Event termination |
| View Ticket | User registered for event | Access registration proof |

### Event Creation System

#### Access Requirements

- **Society Advisor**: Full access by default
- **Privileged Students**: Requires `event_management` privilege

#### Six-Step Creation Process

##### Step 1: Basic Event Information

**Required Fields**:

- **Event Title**: Primary event identifier
- **Event Tagline**: Subtitle or hook
- **Rich-text Description**: Comprehensive event details
- **Event Categories**: Multi-select classification
  - Workshop, Seminar, Social Gathering, Competition
  - Cultural Event, Sports Event, Meeting, Other
- **Event Image**: Visual banner upload

##### Step 2: Date & Time Configuration

**Temporal Settings**:

- **Start Date**: Event commencement date
- **Start Time**: Event beginning time
- **End Date**: Event conclusion date
- **End Time**: Event ending time

##### Step 3: Location Setup

**Event Type Selection**:

**Physical Events**:

- **Venue Name**: Location identifier
- **Venue Address**: Complete location details

**Online Events**:

- **Platform Selection**: Zoom, Google Meet, Microsoft Teams, Other
- **Custom Platform**: Manual platform name (if "Other" selected)
- **Meeting Link**: Access URL
- **Access Instructions**: Connection guidance

##### Step 4: Audience & Visibility

**Audience Configuration**:

- **Public**: Open platform access
- **Invite Only**: Restricted participation

**Publication Options**:

- **Publish Now**: Immediate visibility
- **Save as Draft**: Unpublished preparation
- **Schedule Publish**: Future publication timing

##### Step 5: Registration & Ticketing

**Payment Account Verification**:

- **Not Setup**: Warning display
- **Under Review**: Information message
- **Verified**: Full paid event capabilities

**Registration Settings**:

- **Enable/Disable**: Registration requirement toggle
- **Registration Deadline**: Application cutoff
- **Participant Limit**: Maximum capacity (optional)

**Paid Event Configuration** (Verified accounts only):

- **Payment Toggle**: Enable paid registration
- **Ticket Price**: Minimum 200 PKR
- **Stripe Integration**: Automated payment processing

##### Step 6: Review & Announcement

**Final Validation**:

- **Complete Summary**: All event details review
- **Edit Capability**: Last-minute modifications
- **Announcement Options**:
  - **Manual Creation**: Custom announcement text
  - **AI-Powered Generator**: Automated professional messaging

#### Draft Management

- **Autosave Functionality**: Progress preservation
- **Return Capability**: Resume incomplete events
- **Version Control**: Draft update tracking

**Keywords**: event creation, event management, event publishing, event registration, paid events, draft events

### Event Detail Pages

#### Comprehensive Event Information

Event Detail Pages provide complete event information in structured, accessible format.

#### Information Sections

##### Section 1: About This Event

- **Event Name**: Full title display
- **Event Banner**: High-resolution visual
- **Event Description**: Complete long-form details

##### Section 2: Event Information Summary

**Key Details Display**:

- **Start and End DateTime**: Complete scheduling information
- **Venue/Platform**: Location or online access details
- **Category**: Event classification
- **Hosting Society**: Organizing body identification
- **Event Status**: Current state (Upcoming, Ongoing, Completed)

##### Section 3: Registration Information

**Registration Details**:

- **Registration Requirement**: Yes/No indicator
- **Registration Deadline**: Application cutoff
- **Remaining Spots**: Available capacity
- **Ticket Price**: Cost information (paid events)

### Student Registration Process

#### Free Event Registration

**Registration Flow**:

1. **Click Registration**: "Register for Event" button activation
2. **Instant Processing**: Immediate registration (if spots available)
3. **Confirmation Generation**: Automatic ticket creation

**Physical Events**:

- **QR Code Ticket**: Scannable entry proof
- **Multiple Access**: My Events page and email delivery
- **Entry Validation**: QR code scanning at venue

**Online Events**:

- **Meeting Link**: Direct access provision
- **Access Instructions**: Connection guidance
- **Platform Integration**: Seamless online participation

#### Paid Event Registration

**Payment Processing Flow**:

1. **Registration Initiation**: "Register for Event" button click
2. **Stripe Session**: Server-generated checkout session
3. **Payment Redirect**: Stripe-hosted payment page
4. **Payment Processing**: Secure card detail collection
5. **Confirmation**: Successful payment verification
6. **Registration Completion**: User registration finalization

**Post-Payment Process**: Identical to free events (QR codes/meeting links)

### Ticket Scanning System (Mobile App)

#### Access Requirements

- **Mobile App Exclusive**: Feature available only on mobile application
- **Privilege Required**: `event_ticket_handling` privilege
- **Access Location**: Menu tab in bottom navigation bar

#### Ticket Validation Process

**Scanner Activation**:

1. **Navigate to Menu**: Access Menu tab from bottom tab-bar
2. **Select Scanner**: Open ticket scanning interface
3. **Camera Activation**: QR code scanner initialization

**Validation Workflow**:

1. **QR Code Scanning**: Scan participant's ticket QR code
2. **Credential Extraction**: Parse ticket authentication data
3. **Server Verification**: Submit credentials to validation endpoint
4. **Registration Check**: Server validates ticket authenticity and usage status
5. **Entry Decision**: Server determines entry authorization
6. **Response Display**: Validation result shown to scanner operator

**Validation Outcomes**:

- **Valid Entry**: Registration confirmed, first-time usage verified
- **Invalid Entry**: Failed validation due to:
  - Unregistered participant
  - Previously scanned ticket (duplicate usage)
  - Expired or cancelled registration
  - Invalid ticket credentials

#### Single-Use Ticket System

**Usage Restrictions**:

- **One-Time Entry**: Each ticket valid for single venue entry
- **Usage Tracking**: Server records scan timestamp and operator
- **Reuse Prevention**: Previously scanned tickets automatically rejected
- **Audit Trail**: Complete scanning history maintained for event analytics

**Security Features**:

- **Cryptographic Credentials**: Secure QR code data encoding
- **Real-time Validation**: Immediate server-side verification
- **Duplicate Detection**: Instant identification of reused tickets
- **Access Control**: Privilege-based scanner authorization

**Keywords**: ticket scanning, QR code validation, event check-in, attendance tracking, mobile app scanner, event entry validation

---

### Overview

The Events Management System is a comprehensive platform feature that handles event discovery, creation, registration, and administration across the SocioHub platform.

### Events Tab (Explore Page)

#### Event Discovery Interface

The Events tab provides a centralized location for students to discover campus activities and events.

**Event Card Components**:

- **Banner Image**: Visual event representation at card top
- **Event Title**: Primary event identifier
- **Event Categories**: Topical classification tags
- **Date Range**: Start and end date display
- **Location Information**: Physical venue or online platform details
- **Pricing**: Ticket cost for paid events
- **Registration Deadline**: Application cutoff date (when applicable)

#### Event Search and Filtering

**Search Functionality**:

- **Keyword Search**: Title and description matching
- **Real-time Results**: Dynamic result updates
- **Search Scope**: All visible events

**Filter Options**:
| Filter Type | Options | Purpose |
|-------------|---------|---------|
| Status | Upcoming, Past | Event timeline filtering |
| Category | Workshop, Seminar, Social, etc. | Topic-based filtering |

#### Event Actions

**Available Actions**:

- **View Detail**: Navigate to comprehensive Event Detail Page
- **Register Now**: Direct registration (conditional availability)
  - **Visibility Conditions**: Registration required AND deadline not passed
  - **Instant Access**: One-click registration process

**Keywords**: event discovery, event search, event filtering, event registration, upcoming events, past events

### Events Page (Society Management)

#### Event Management Interface

Society-specific event management with role-based access control and comprehensive event lifecycle management.

#### Visibility Levels

**All Users (Students and Advisors)**:

- **Upcoming Events**: Future scheduled events
- **Completed Events**: Historical event records

**Privileged Users (Advisors + Event Management Privilege)**:

- **Draft Events**: Unpublished event preparations
- **Cancelled Events**: Terminated event records

#### Event Management Actions

**Context-Sensitive Actions**:
| Action | Availability Conditions | Purpose |
|--------|------------------------|---------|
| Edit Event | Draft, Upcoming, Ongoing status | Event modification |
| Delete | Draft or Completed status | Permanent removal |
| Cancel | Upcoming or Ongoing status | Event termination |
| View Ticket | User registered for event | Access registration proof |

### Event Creation System

#### Access Requirements

- **Society Advisor**: Full access by default
- **Privileged Students**: Requires `event_management` privilege

#### Six-Step Creation Process

##### Step 1: Basic Event Information

**Required Fields**:

- **Event Title**: Primary event identifier
- **Event Tagline**: Subtitle or hook
- **Rich-text Description**: Comprehensive event details
- **Event Categories**: Multi-select classification
  - Workshop, Seminar, Social Gathering, Competition
  - Cultural Event, Sports Event, Meeting, Other
- **Event Image**: Visual banner upload

##### Step 2: Date & Time Configuration

**Temporal Settings**:

- **Start Date**: Event commencement date
- **Start Time**: Event beginning time
- **End Date**: Event conclusion date
- **End Time**: Event ending time

##### Step 3: Location Setup

**Event Type Selection**:

**Physical Events**:

- **Venue Name**: Location identifier
- **Venue Address**: Complete location details

**Online Events**:

- **Platform Selection**: Zoom, Google Meet, Microsoft Teams, Other
- **Custom Platform**: Manual platform name (if "Other" selected)
- **Meeting Link**: Access URL
- **Access Instructions**: Connection guidance

##### Step 4: Audience & Visibility

**Audience Configuration**:

- **Public**: Open platform access
- **Invite Only**: Restricted participation

**Publication Options**:

- **Publish Now**: Immediate visibility
- **Save as Draft**: Unpublished preparation
- **Schedule Publish**: Future publication timing

##### Step 5: Registration & Ticketing

**Payment Account Verification**:

- **Not Setup**: Warning display
- **Under Review**: Information message
- **Verified**: Full paid event capabilities

**Registration Settings**:

- **Enable/Disable**: Registration requirement toggle
- **Registration Deadline**: Application cutoff
- **Participant Limit**: Maximum capacity (optional)

**Paid Event Configuration** (Verified accounts only):

- **Payment Toggle**: Enable paid registration
- **Ticket Price**: Minimum 200 PKR
- **Stripe Integration**: Automated payment processing

##### Step 6: Review & Announcement

**Final Validation**:

- **Complete Summary**: All event details review
- **Edit Capability**: Last-minute modifications
- **Announcement Options**:
  - **Manual Creation**: Custom announcement text
  - **AI-Powered Generator**: Automated professional messaging

#### Draft Management

- **Autosave Functionality**: Progress preservation
- **Return Capability**: Resume incomplete events
- **Version Control**: Draft update tracking

**Keywords**: event creation, event management, event publishing, event registration, paid events, draft events

### Event Detail Pages

#### Comprehensive Event Information

Event Detail Pages provide complete event information in structured, accessible format.

#### Information Sections

##### Section 1: About This Event

- **Event Name**: Full title display
- **Event Banner**: High-resolution visual
- **Event Description**: Complete long-form details

##### Section 2: Event Information Summary

**Key Details Display**:

- **Start and End DateTime**: Complete scheduling information
- **Venue/Platform**: Location or online access details
- **Category**: Event classification
- **Hosting Society**: Organizing body identification
- **Event Status**: Current state (Upcoming, Ongoing, Completed)

##### Section 3: Registration Information

**Registration Details**:

- **Registration Requirement**: Yes/No indicator
- **Registration Deadline**: Application cutoff
- **Remaining Spots**: Available capacity
- **Ticket Price**: Cost information (paid events)

### Student Registration Process

#### Free Event Registration

**Registration Flow**:

1. **Click Registration**: "Register for Event" button activation
2. **Instant Processing**: Immediate registration (if spots available)
3. **Confirmation Generation**: Automatic ticket creation

**Physical Events**:

- **QR Code Ticket**: Scannable entry proof
- **Multiple Access**: My Events page and email delivery
- **Entry Validation**: QR code scanning at venue

**Online Events**:

- **Meeting Link**: Direct access provision
- **Access Instructions**: Connection guidance
- **Platform Integration**: Seamless online participation

#### Paid Event Registration

**Payment Processing Flow**:

1. **Registration Initiation**: "Register for Event" button click
2. **Stripe Session**: Server-generated checkout session
3. **Payment Redirect**: Stripe-hosted payment page
4. **Payment Processing**: Secure card detail collection
5. **Confirmation**: Successful payment verification
6. **Registration Completion**: User registration finalization

**Post-Payment Process**: Identical to free events (QR codes/meeting links)

### Administrative Event Data

#### Access Requirements

- **Society Advisors**: Full access by default
- **Privileged Members**: Requires `event_management` privilege

#### Post-Event Analytics

**Available After Event Completion**:

**Registration Data Table**:

- **Registered Users**: Complete participant list
- **Registration Details**: Timestamps and user information
- **Payment Status**: Transaction records (paid events)

**Participation Data Table**:

- **Actual Attendees**: Verified participation records
- **Attendance Tracking**: Check-in data
- **Engagement Metrics**: Participation analysis

**Keywords**: event details, event registration, paid events, free events, event analytics, attendance tracking

---

## Platform Infrastructure and Public Interface

### Overview

SocioHub's public interface and platform infrastructure provide user onboarding, authentication, and core navigation systems.

### Public Landing Page (Index)

#### Page Structure

The SocioHub index page serves as the primary public entry point, providing platform introduction and access pathways.

#### Navigation Bar Components

**Primary Navigation**:

- **Home**: Current page anchor
- **Contact Us**: Support and inquiry access
- **Sign In/Sign Up**: Authentication entry points (top-right positioning)

#### Content Sections

##### Hero Section

- **Platform Introduction**: SocioHub purpose and value proposition
- **Target Audience**: University students and societies
- **Value Communication**: Platform benefits overview

##### App Download Section

- **Download Button**: Prominent call-to-action
- **Android App**: Latest `.apk` file distribution
- **Mobile Access**: Native application availability

### Contact System

#### Contact Information Display

**Institutional Details**:

- **Phone**: +92-304-5818377
- **Email**: sociohub.site@gmail.com
- **Location**: COMSATS University Islamabad, Attock Campus, Kamra Rd, Attock

#### Contact Form Structure

**Form Fields and Specifications**:
| Field | Type | Requirements | Purpose |
|-------|------|--------------|---------|
| First Name | Text Input | Required | Personal identification |
| Last Name | Text Input | Required | Complete name |
| Email | Email Input | Required\* | Contact method |
| Phone Number | Tel Input | Optional | Secondary contact |
| Subject | Dropdown | Required | Inquiry categorization |
| Message | Textarea | Required | Detailed inquiry |

\*Email Requirements: Society advisors must use official university email addresses

**Subject Categories**:

- **General Query**: Feature issues and technical problems
- **Society Registration**: New society onboarding requests

#### Contact Processing

- **Email Handling**: Mailtrap integration for development/testing
- **Business Email**: sociohub.site@gmail.com routing
- **Response System**: Automated acknowledgment and manual follow-up

### Technology Stack

#### Core Architecture (PERN Stack)

- **PostgreSQL**: Primary database with Prisma ORM
- **Express.js**: Backend API framework
- **React**: Frontend user interface
- **Node.js**: Server-side runtime environment

#### Supporting Technologies

**State Management and Communication**:

- **Redux Toolkit**: Global state management
- **RTK Query**: API communication and caching
- **Socket.IO**: Real-time features (chat, notifications)

**Document and Payment Processing**:

- **Puppeteer**: PDF generation from forms
- **Stripe**: Payment integration for event ticketing
- **Cloudinary**: Static file storage (images, videos, documents)

**Keywords**: landing page, contact form, technology stack, platform architecture, public interface

### Authentication and Account Management

#### Account Registration System

##### Registration Type Selection

**User Categories**:

- **Student Registration**: Academic user accounts
- **Advisor Registration**: Faculty/staff society management accounts

##### Student Account Creation

**Required Information**:

- **First Name**: Personal identification
- **Last Name**: Complete name
- **Registration Number**: Unique student identifier
- **Email**: Official CUI Attock domain (`@cuiatk.edu.pk`)
- **Password**: Account security

**Verification Process**:

1. **Email Dispatch**: 6-digit confirmation code
2. **Verification Page**: Code entry interface
3. **Account Activation**: Email confirmation
4. **Dashboard Redirect**: User onboarding completion

##### Advisor Account Creation

**Required Information**:

- **Avatar**: Profile image upload
- **First Name**: Personal identification
- **Last Name**: Complete name
- **Email**: Pre-populated dropdown (stored advisor emails)
- **Phone**: Optional contact information
- **Password**: Account security credential

**Auto-Population Feature**: Email selection automatically fills name and phone fields

##### Society Creation (Advisor Post-Registration)

**Mandatory Society Setup**:

- **Logo**: Society visual identifier (image upload)
- **Society Name**: Official organization title
- **Society Vision**: Brief organizational description

**Process Flow**: Email verification → Society creation → Dashboard access

#### Authentication System

##### Sign-In Interface

**Tabbed Authentication**:

**Advisor Tab**:

- **Email**: Primary identifier
- **Password**: Security credential

**Student Tab**:

- **Registration Number**: Student-specific identifier
- **Password**: Security credential

**Post-Authentication**: Role-based dashboard redirection

**Keywords**: user registration, account creation, email verification, authentication, student accounts, advisor accounts

### Navigation Systems

#### Overview

SocioHub implements role-based navigation through integrated Sidebar and Topbar systems.

#### Advisor Navigation (Sidebar)

**Complete Feature Access**:

- **Dashboard**: Society statistics, requests, events overview
- **Inbox**: Direct and group messaging capabilities
- **Society Profile**: Public profile management
- **Members**: Member management panel
- **Events**: Event creation and management tools
- **To-Do**: Personal task management
- **Announcements**: Communication publishing tools
- **Payments & Finance**: Financial operations overview
- **Teams**: Sub-group management capabilities
- **Video Meetings**: Virtual session management
- **Create Post**: Content publishing tools
- **Activity Logs**: Society action tracking
- **Calendar**: Schedule visualization
- **Settings**: Society configuration options

#### Student Navigation

##### Primary Menu (Universal Access)

- **Dashboard**: Personalized insights and activity
- **Explore**: Platform discovery (societies, events, announcements)
- **Chat**: Messaging functionality
- **Calendar**: Event and schedule visualization
- **To-Do**: Personal task management

##### Society Menu (Dynamic)

**Society-Specific Access** (per joined society):

- **Society Profile**: Organization information
- **Events**: Society event access
- **Members**: Member directory
- **Announcements**: Society communications
- **Video Meetings**: Virtual participation
- **Teams**: Sub-group access
- **Conditional Items** (privilege-dependent):
  - **Payments & Finance**: Financial access
  - **Create Post**: Content creation
  - **Settings**: Configuration access

#### Universal Topbar

##### Search Functionality

- **Multi-Category Search**: People, Events, Societies
- **Platform-Wide Scope**: Comprehensive result coverage
- **Real-Time Results**: Dynamic search updates

##### Notification System

- **Notification Counter**: Unread notification count
- **Notification Panel**: Click-activated notification list
- **Auto-Navigation**: Notification-to-page redirection
- **Read Status**: Automatic marking system

##### User Avatar Section

**Profile Information Display**:

- **Avatar**: Profile image
- **Name**: User identification
- **Registration Number**: Student-specific (students only)

**Dropdown Menu Options**:

- **Profile**: Public profile page access
- **Dashboard**: Quick dashboard return
- **My Events**: Registered events (students only)
- **Settings**: Profile configuration
- **Logout**: Session termination

**Keywords**: navigation system, sidebar navigation, topbar features, user interface, role-based access

### User Dashboards

#### Overview

Personalized dashboard interfaces providing role-specific information and quick access to key platform features.

#### Student Dashboard

##### Information Widgets

**Upcoming Events Widget**:

- **Display Limit**: 3 nearest upcoming events
- **Participation Focus**: Events available for student registration
- **Planning Tool**: Schedule management assistance

**To-Do List Widget**:

- **Task Limit**: Up to 5 relevant tasks
- **Task Sources**: Self-created and society-assigned tasks
- **Prioritization**: Creation date and star status sorting

**Recent Announcements Widget**:

- **Display Limit**: Latest 3 announcements
- **Source Scope**: Joined societies only
- **Communication**: Important update visibility

**Calendar Widget**:

- **Mini Calendar**: Compact schedule view
- **Key Dates**: Event registration dates, meetings, platform events
- **Visual Indicators**: Color-coded event types

#### Advisor Dashboard

##### Society Management KPIs

**Key Performance Indicators**:

- **Total Members**: Current membership count
- **Active Events**: Current and upcoming event count
- **Total Teams**: Society sub-group count
- **Event Engagement Rate**: Participation metric calculation

##### Management Widgets

**Activity Logs Widget**:

- **Recent Activity**: Member and officer bearer actions
- **Action Types**: Event creation, announcements, task management
- **Audit Trail**: Society activity monitoring

**To-Do List Widget**:

- **Advisor Tasks**: Personal task management
- **Society Operations**: Administrative task tracking
- **Productivity**: Organizational efficiency tool

**Calendar Widget**:

- **Event Scheduling**: Upcoming and ongoing events
- **Meeting Management**: Scheduled society meetings
- **Task Integration**: Calendar-based task visualization

**Recently Created Events Widget**:

- **Event Monitoring**: Latest society events
- **Quick Access**: Event status and registration management
- **Performance Tracking**: Event success metrics

### Explore Page System

#### Overview

Student-focused discovery interface providing comprehensive platform engagement through structured tabbed navigation.

#### Tab Structure

**Four Primary Tabs**:

1. **Societies Tab**: Registered society discovery and joining
2. **People Tab**: User discovery (students and advisors)
3. **Events Tab**: Campus event browsing and registration
4. **Announcements Tab**: Society communication discovery

#### Functionality Integration

- **Unified Interface**: Single-page access to all discovery features
- **Tab-Specific Tools**: Dedicated search, filter, and interaction capabilities
- **Cross-Tab Navigation**: Seamless content-to-content transitions
- **Student-Centric**: Designed specifically for student user needs

**Keywords**: student dashboard, advisor dashboard, explore page, dashboard widgets, user interface, platform navigation

---

## Payment and Financial Management System

### Overview

The Payment and Financial Management System integrates Stripe payment processing with comprehensive financial tracking and reporting for society operations.

### Payment Settings (Society Configuration)

#### Access Control

**Authorized Users**:

- **Society Advisor**: Full access by default
- **Privileged Members**: Requires `Payment and Finance Management` privilege

#### Stripe Onboarding Process

##### Initial Setup Flow

1. **Initiation**: "Start Payment Setup" button activation
2. **Account Creation**: Server-generated Stripe connected account
3. **Onboarding Redirect**: Stripe-hosted onboarding interface
4. **Information Collection**: Comprehensive financial and identity verification

##### Required Information

**Personal Information**:

- **Email Address**: Primary contact method
- **Phone Number**: Secondary contact verification
- **Legal Name**: First and last name (official)
- **Nationality**: Country of citizenship
- **Date of Birth**: Age verification
- **Home Address**: Complete residential address

**Identity Verification**:

- **CNIC**: Computerised National Identity Card (Pakistan-specific)

**Banking Details**:

- **Account Holder Name**: Bank account identification
- **SWIFT/BIC Code**: International bank identifier
- **IBAN**: International Bank Account Number

##### Account Status Management

**Status Progression**:

1. **Setup Initiated**: Onboarding process started
2. **Information Submitted**: All details provided
3. **Under Review**: Stripe verification process ("Payment Setup in Progress")
4. **Active**: Account verified and operational
5. **Update Available**: Information modification capability

### Payments & Finance Dashboard

#### Overview

Comprehensive financial management interface providing detailed insights, transaction tracking, and revenue analysis for society administrators.

#### Key Performance Indicators (KPIs)

##### Financial Metrics

**Pending Payouts**:

- **Definition**: Funds held by Stripe awaiting bank transfer
- **Processing**: Daily (24-hour) rolling payout schedule
- **Purpose**: Payment confirmation and account compliance monitoring
- **Considerations**: Holiday delays, verification status impacts

**Total Revenue**:

- **Scope**: Current month paid event registration income
- **Calculation**: Successful transactions only
- **Purpose**: Primary income indicator

**Paid Registrations**:

- **Metric**: Current month paid registration count
- **Purpose**: Event engagement and popularity measurement

**Projected Revenues**:

- **Analysis**: Current month revenue projection
- **Methodology**: Historical data and trend analysis
- **Updates**: Dynamic recalculation with new transactions

#### Revenue Analysis System

##### Interactive Chart Suite

**Revenue Over Time (Line Area Chart)**:

- **Purpose**: Revenue accumulation trend visualization
- **Insights**: Peak sales periods and low activity identification
- **Filtering**: Custom date ranges, daily/weekly/monthly grouping

**Transaction Volume (Line Chart)**:

- **Focus**: Successful transaction count by event
- **Application**: Individual event performance assessment
- **Grouping**: Event-based transaction analysis

**Top 5 Earning Events (Bar Chart)**:

- **Display**: Highest revenue-generating events (all-time)
- **Purpose**: Success pattern identification for future planning
- **Strategic Value**: Event replication and improvement insights

##### Filtering Capabilities

**Available Filters**:

- **Custom Date Ranges**: Flexible time period selection
- **Grouping Options**: Daily, Weekly, Monthly data aggregation
- **Interactive Controls**: Dynamic chart updates

#### Transaction Management

##### Recent Transactions Display

**Last 10 Transactions Table**:
| Field | Purpose | Details |
|-------|---------|---------|
| Date | Transaction timing | Payment occurrence date |
| Event Name | Event identification | Associated event title |
| Student | Payer identification | Student who made payment |
| Amount | Payment value | Total transaction amount |
| Status | Transaction state | Pending, Successful, Failed |

##### Full Transaction History

**Comprehensive Transaction Access**:

- **Pagination**: Server-side and client-side (20 records per fetch)
- **Navigation**: Infinite scroll or next/previous controls
- **Search Functionality**: Multi-field filtering capabilities
  - **Student Name**: Payer identification
  - **Event Name**: Event-based filtering
  - **Date Range**: Time-based searches
  - **Status**: Transaction state filtering

#### Security and Access Control

##### Access Requirements

- **Required Privilege**: `finance_management`
- **Authentication**: Token-based secure access
- **Data Protection**: Encrypted transit and storage
- **Audit Trail**: Access logging and monitoring

##### Security Features

- **Encrypted Communication**: Secure data transmission
- **Role-Based Access**: Granular permission control
- **Audit Logging**: Financial action tracking
- **Compliance**: Financial data protection standards

**Keywords**: payment settings, Stripe integration, financial dashboard, revenue analysis, transaction management, payment processing, financial KPIs

---

## Advanced Features and Integrations

### Real-Time Communication

- **Chat System**: Direct and group messaging capabilities
- **Video Meetings**: Integrated virtual meeting platform
- **Push Notifications**: Real-time activity updates
- **Socket.IO**: WebSocket-based real-time features

### Content Management

- **Post Creation**: Rich media content publishing
- **Event Galleries**: Post-to-event connection system
- **Media Upload**: Image and video management
- **Cloudinary Integration**: Scalable media storage

### Task and Team Management

- **To-Do System**: Personal and assigned task management
- **Teams**: Sub-group organization within societies
- **Task Assignment**: Privilege-based task delegation
- **Calendar Integration**: Schedule visualization

### Analytics and Reporting

- **Activity Logs**: Comprehensive action tracking
- **Event Analytics**: Registration and participation metrics
- **Financial Reporting**: Revenue and transaction analysis
- **Engagement Metrics**: User activity measurement

**Keywords**: real-time communication, content management, task management, analytics, platform features

---

## Teams and Task Management System

### Overview

The Teams and Task Management System enables societies to organize members into functional units with dedicated leadership, task workflows, and integrated communication channels.

### Teams Management

#### Teams Page Structure

The Teams Page displays comprehensive team information through structured Team Cards.

**Team Card Components**:

- **Team Logo & Name**: Visual identity and identification
- **Team Description**: Purpose and functional summary
- **Team Lead**: Current designated leadership
- **Member Count**: Total team membership
- **Action Buttons**: Context-sensitive team interactions

#### Team Actions by Role

**All Members**:

- **Join Team**: Request team membership
- **View Team**: Access detailed Team Profile page

**Administrative Actions** (Advisor or `Teams Management` privilege):

- **Assign Task**: Create team-specific task assignments (requires `Tasks Management` privilege)
- **Edit Team**: Modify team details and leadership
- **Delete Team**: Remove team and associated data

#### Team Creation Process

**Access Requirements**:

- **Society Advisor**: Full access by default
- **Privileged Members**: Requires `Teams Management` privilege

**Team Form Fields**:
| Field | Type | Purpose |
|-------|------|---------|
| Team Logo | Image Upload | Visual team identity |
| Team Name | Text Input | Team identifier |
| Team Description | Text Area | Purpose and function description |
| Team Lead | Member Dropdown | Leadership assignment from current society members |

**Automatic Features**:

- **Chat Group Creation**: Dedicated team communication channel
- **Member Integration**: Automatic chat group membership

### Team Profile Pages

#### Header Section

**Team Information Display**:

- **Team Logo**: Visual identifier
- **Team Name**: Primary identification
- **Team Description**: Functional overview
- **Team Lead**: Current leadership information
- **Member Count**: Total membership
- **Membership Actions**: Join/Leave Team buttons (context-dependent)

#### Team Tasks Section

**Visibility Requirements**: Team Members, Advisor, or `Teams Management`/`Tasks Management` privilege

**Task Management Features**:

- **Task Overview**: All team-assigned and team-created tasks
- **Task Creation**: Team Lead exclusive capability
- **Status Updates**: Team Lead task management
- **Task Tracking**: Progress monitoring and completion

#### Team Members Management

**Team Lead Capabilities**:

- **Member Display**: Complete team roster
- **Member Removal**: Direct member management
- **Join Request Management**: Review, accept, reject pending requests
- **Direct Member Addition**: Bypass join request process

**Direct Addition Process**:

- **Member Selection**: Choose from society member list
- **Immediate Assignment**: Skip request workflow
- **Chat Integration**: Automatic chat group addition

### Team Lifecycle Management

#### Join and Leave Workflow

**Join Process**:

1. **Join Request Submission**: User initiates membership request
2. **Team Lead Review**: Leadership evaluation and decision
3. **Request Decision**: Accept or reject application
4. **Chat Integration**: Automatic group addition upon acceptance

**Leave Process**:

- **Self-Service**: "Leave Team" button functionality
- **Immediate Effect**: Instant team and chat removal

#### Chat Group Integration

**Automatic Chat Management**:

- **Team Creation**: Linked chat group generation
- **Member Addition**: Automatic chat group inclusion
- **Team Deletion**: Complete chat and message removal

### Privilege-Based Access Control

**Access Control Matrix**:
| Action | Required Privilege | Additional Requirements |
|--------|-------------------|------------------------|
| Create/Edit/Delete Team | `Teams Management` | Advisor or privileged member |
| Assign Task to Team | `Tasks Management` | Administrative access |
| View & Manage Team Tasks | Team Membership | OR Advisor OR `Tasks Management` |
| Remove/Add Members | Team Leadership | Team Lead status |
| Handle Join Requests | Team Leadership | Team Lead status |

**Keywords**: teams management, team creation, team leadership, task assignment, team communication, member management

### Task Management System

#### Overview

The To-Do List system provides comprehensive task management for personal productivity and society coordination.

#### Core Task Features

**Task Management Capabilities**:

- **Task Creation**: Add new tasks with titles and descriptions
- **Task Prioritization**: Star system for priority management
- **Progress Tracking**: Completion status marking
- **Task Editing**: Update task details and information
- **Task Deletion**: Remove personal tasks

#### Task Types and Access Control

**Personal Tasks**:

- **Full Control**: Complete CRUD operations
- **Unrestricted Management**: Create, edit, delete capabilities
- **Priority Management**: Star/unstar functionality
- **Status Control**: Mark complete/incomplete

**Society-Assigned Tasks**:

- **Read-Only Restriction**: Cannot be deleted by recipients
- **Completion Tracking**: Students can mark as completed
- **Visual Distinction**: Clear identification from personal tasks
- **Completion Status**: Progress tracking capability

#### Task Permission Matrix

| Action        | Personal Tasks | Society-Assigned Tasks |
| ------------- | -------------- | ---------------------- |
| Create Task   | ✅ Allowed     | ❌ Not Allowed         |
| Edit Task     | ✅ Allowed     | ❌ Not Allowed         |
| Star Task     | ✅ Allowed     | ✅ Allowed             |
| Mark Complete | ✅ Allowed     | ✅ Allowed             |
| Delete Task   | ✅ Allowed     | ❌ Not Allowed         |

#### Task Integration

- **Dashboard Integration**: Task widgets on user dashboards
- **Society Coordination**: Administrative task assignment
- **Progress Monitoring**: Completion tracking and reporting
- **Priority Management**: Star-based task organization

**Keywords**: task management, to-do list, task assignment, personal tasks, society tasks, task completion, task priorities

---

## Communication and Collaboration Systems

### Overview

SocioHub's communication infrastructure includes user discovery, real-time messaging, and video conferencing capabilities powered by modern web technologies.

### People Discovery (Explore Page)

#### User Discovery Interface

The People tab provides comprehensive user discovery and interaction capabilities.

**Discovery Features**:

- **Complete User Database**: All registered students and advisors
- **Advanced Search**: Name and role-based filtering
- **Infinite Scrolling**: Seamless user list navigation
- **Profile Access**: Direct user profile viewing
- **Direct Messaging**: Immediate communication initiation

**User Interaction Options**:

- **Profile Viewing**: Access to complete user profiles
- **Direct Communication**: Send message functionality
- **Network Building**: Cross-society user discovery

**Keywords**: user discovery, people search, profile viewing, direct messaging, platform users

### Inbox and Real-Time Chat System

#### Overview

WebSocket-powered real-time messaging system supporting individual and group communications.

#### Inbox Layout Structure

##### Left Section - Chat Management

**Chat List Features**:

- **Chat History**: Complete conversation archive
- **Active Conversations**: One-on-one and group chats
- **New Chat Initiation**: "Start New Chat" functionality

**New Chat Dialog**:

- **User Search**: Find and select conversation participants
- **Suggested Users**: Quick interaction recommendations
- **Group Chat Creation**: Multi-participant conversation setup

##### Group Chat Creation Process

**Required Information**:

- **Group Cover Photo**: Optional visual identifier
- **Group Name**: Conversation identifier
- **Member Selection**: User search and addition interface

##### Right Section - Active Conversation

**Messaging Features**:

- **Text Messaging**: Real-time text communication
- **File Attachments**: Multi-media sharing capabilities
  - **Supported Types**: Photos, videos, documents
  - **File Size Limit**: 10MB per file maximum
  - **Security**: Secure file transfer and storage

#### Chat Details and Management

**One-on-One Chat Details**:

- **Participant Information**: Basic user profile data
- **Conversation History**: Complete message archive
- **File Sharing**: Attachment management

**Group Chat Administration**:

- **Group Information**: Name and member list display
- **Group Management Actions**:
  - **Leave Group**: Self-service group exit
  - **Add Members**: Group admin member addition
  - **Remove Members**: Group admin member removal
  - **Delete Group**: Group admin conversation termination

#### Automated Chat Integration

**Society Integration**:

- **New Society Registration**: Automatic society group chat creation
- **Student Society Joining**: Automatic society chat addition
- **Team Creation**: Dedicated team chat group generation
- **Team Joining**: Automatic team chat inclusion

#### Technical Infrastructure

- **WebSocket Protocol**: Real-time communication foundation
- **Socket.IO Implementation**: Client-server WebSocket management
- **Scalable Architecture**: High-performance messaging system

**Keywords**: real-time chat, group messaging, file sharing, Socket.IO, WebSocket communication, chat integration

### Video Meeting System

#### Overview

Integrated video conferencing platform using Daily.co infrastructure for virtual meetings and collaboration.

#### Meeting Management Interface

**Access Control Buttons**:

- **New Meeting**: Meeting creation (Advisor and `Meeting Management` privilege)
- **Join with Code**: Universal meeting access (all users)

#### Meeting Creation Process

**New Meeting Form**:
| Field | Type | Purpose |
|-------|------|---------|
| Meeting Title | Text Input | Meeting identification |
| Meeting Description | Text Area | Agenda and purpose |
| Start Time | DateTime | Meeting schedule |
| Audience Type | Radio Options | Participation scope |

**Audience Type Options**:

- **Society Members**: All current society members eligible
- **Invited Members**: Selected participant list from member directory

#### Meeting Access and Participation

**Join with Code Feature**:

- **8-Character Code**: Unique meeting identifier
- **Direct Access**: Bypass meeting list for direct joining
- **Authorization Check**: Automatic eligibility verification

#### Meeting List and Management

**Meeting Eligibility**:

- **Society Members**: Access to society-wide meetings
- **Invited Members**: Access to specifically invited meetings

**Meeting Card Actions**:
| Action | Availability | Requirements |
|--------|--------------|--------------|
| View Detail | All eligible participants | Meeting visibility |
| Join Meeting | Meeting LIVE or scheduled time passed | Authorization check |
| Update Meeting | Advisors and privileged members | Before meeting starts |
| Cancel Meeting | Meeting host only | Before going live |
| End Meeting | Meeting host only | During live session |

#### Daily.co Platform Integration

**Video Platform Features**:

- **Camera Control**: Enable/disable video feed
- **Microphone Control**: Audio management
- **Text Chat**: In-meeting messaging
- **Screen Sharing**: Content presentation capabilities

**Technical Constraints**:

- **Maximum Duration**: 80 minutes per meeting
- **Maximum Participants**: 200 concurrent users
- **Platform Reliability**: Daily.co infrastructure

#### Meeting Detail Information

**Four Information Sections**:

##### 1. Timing & Access

- **Meeting Code**: 8-character identifier
- **Scheduled Time**: Planned meeting start
- **Actual Start Time**: Meeting commencement
- **End Time**: Meeting conclusion

##### 2. Meeting Description

- **Agenda**: Meeting purpose and content
- **Additional Information**: Supplementary details

##### 3. Audience Information

- **Audience Type**: Society Members or Invited Members
- **Invited Members Table**: Participant list with contact details

##### 4. Participation Tracking

- **Participant List**: Actual meeting attendees
- **Join/Leave Times**: Detailed participation timestamps
- **Attendance Analytics**: Meeting engagement metrics

#### Real-Time Webhook Integration

**Daily.co Webhook Events**:

- **meeting-started**: Meeting commencement tracking
- **participant-joined**: Real-time attendance logging
- **participant-left**: Exit time recording
- **meeting-ended**: Session conclusion tracking

**Event-Driven Architecture Benefits**:

- **Accurate Tracking**: Precise participation records
- **Real-Time Updates**: Live meeting status synchronization
- **Database Synchronization**: Automatic record maintenance
- **UI Feedback**: Dynamic interface updates

#### Meeting Access Control Summary

**Permission Matrix**:
| Action | Authorized Users |
|--------|------------------|
| New Meeting | Advisor, Meeting Management Privilege |
| Join with Code | Any authorized user |
| Update Meeting | Advisor, Meeting Management Privilege |
| Cancel Meeting | Meeting host (before live) |
| End Meeting | Meeting host (during live) |
| View Details | All eligible participants |
| Join Meeting | All eligible participants (when live) |

**Keywords**: video meetings, Daily.co integration, meeting management, virtual collaboration, webhook events, meeting analytics

---

## Support and Frequently Asked Questions

### Overview

Comprehensive support documentation addressing common user questions, troubleshooting guidance, and platform clarifications.

### Contact and Support System

#### Contact Information Access

**Official Contact Details**:

- **Phone**: +92-304-5818377
- **Email**: sociohub.site@gmail.com
- **Physical Location**: COMSATS University Islamabad, Attock Campus, Kamra Rd, Attock

#### Support Request Process

**Contact Form Requirements**:

- **Required Fields**: First Name, Last Name, Email, Subject, Message
- **Optional Fields**: Phone Number
- **Email Validation**: Official university email for advisors

**Subject Categories**:

- **General Query**: Technical issues, feature problems, bug reports
- **Society Registration**: New society advisor email requests

#### Email Processing System

- **Development Environment**: Mailtrap email capture and testing
- **Business Email Routing**: sociohub.site@gmail.com delivery
- **Response System**: Manual support team follow-up

### Account Management FAQs

#### Student Account Creation

**Registration Requirements**:

- **Personal Information**: First Name, Last Name, Registration Number
- **Email Validation**: Official CUI Attock domain (@cuiatk.edu.pk)
- **Password Security**: Account protection credential
- **Verification Process**: 6-digit email confirmation code

#### Advisor Account Creation

**Registration Process**:

- **Email Selection**: Pre-approved advisor email dropdown
- **Auto-Population**: Name and phone auto-fill from stored data
- **Password Creation**: Manual security credential setup
- **Society Creation**: Mandatory post-verification step

#### Email Verification Troubleshooting

**Common Issues and Solutions**:

- **Code Not Received**: Check spam/junk folders
- **Email Accuracy**: Verify correct email entry
- **Advisor Emails**: Ensure dropdown selection
- **Persistent Issues**: Contact support via Contact Us page

### Authentication and Access

#### Sign-In Methods

**Role-Based Authentication**:

- **Advisors**: Email and password combination
- **Students**: Registration number and password combination
- **Tab Interface**: Separate authentication forms

#### Account Access Issues

**Resolution Steps**:

- **Credential Verification**: Confirm login information accuracy
- **Role Identification**: Use appropriate sign-in tab
- **Password Recovery**: Contact support for assistance
- **Account Activation**: Complete verification process

### Membership and Society Participation

#### Society Membership Limits

**Participation Restrictions**:

- **Maximum Societies**: Two society memberships per student
- **Eligibility Requirements**: Society-specific criteria compliance
- **Registration Forms**: Complete application processes

#### Office Bearer Limitations

**Leadership Restrictions**:

- **Single Society Rule**: One office bearer role per student
- **Office Bearer Positions**: President, Vice President, General Secretary, Treasurer
- **Membership Flexibility**: Regular membership in multiple societies allowed

#### Society Registration Issues

**Email Authorization Problems**:

- **Pre-Approved Lists**: Advisor emails must be pre-registered
- **Contact Support**: Request email inclusion through Contact Us
- **Official Channels**: Institutional administration coordination

### Event Management and Registration

#### Event Registration Process

**Registration Methods**:

- **Free Events**: Instant registration completion
- **Paid Events**: Stripe checkout redirection and payment processing
- **Ticket Generation**: QR code creation for physical events
- **Online Events**: Meeting link provision

#### Ticket and Access Management

**Event Access Methods**:

- **Physical Events**: QR code tickets via My Events page and email
- **Online Events**: Meeting links on Event Detail page and email
- **Ticket Storage**: My Events page archive

#### Payment Processing

**Stripe Integration**:

- **Secure Payments**: Stripe-hosted checkout pages
- **Card Processing**: Secure payment detail collection
- **Automatic Registration**: Post-payment account setup
- **Payment Confirmation**: Transaction verification

#### Event Data Access

**Administrative Visibility**:

- **Access Requirements**: Advisor or Event Management privilege
- **Data Availability**: Post-event completion only
- **Registration Data**: Complete participant information
- **Participation Tracking**: Actual attendance records

### Society Settings and Configuration

#### Settings Access Control

**Authorized Users**:

- **Society Advisor**: Full access by default
- **Settings Management Privilege**: Privileged member access
- **Payment Finance Management Privilege**: Financial settings access

#### Public Profile Management

**Updateable Information**:

- **Visual Elements**: Society Logo
- **Organizational Information**: Vision, Mission, Core Values
- **Administrative Content**: Statement of Purpose, Faculty Advisor Message

#### Membership Control

**Administrative Capabilities**:

- **Registration Status**: Open/close new membership applications
- **Member Limits**: Set maximum society membership
- **Request Management**: Handle pending applications

### Payment and Financial System

#### Payment Account Setup

**Stripe Onboarding Requirements**:

- **Personal Information**: Email, phone, name, nationality, date of birth
- **Address Information**: Complete home address details
- **Identity Verification**: CNIC (Pakistan-specific requirement)
- **Banking Details**: Account holder name, SWIFT/BIC code, IBAN

#### Payment Account Status

**Status Progression**:

- **Setup Initiated**: Onboarding process started
- **Under Review**: "Payment Setup in Progress" display
- **Active**: Account verified and payment-ready
- **Update Available**: Information modification capability

#### Financial Dashboard Access

**Access Requirements**:

- **Required Privilege**: Payment and Finance Management
- **Security**: Token-based authentication
- **Data Protection**: Encrypted financial information

### Content and Communication Management

#### Announcement System

**Creation Authorization**:

- **Society Advisor**: Full announcement capabilities
- **Announcement Management Privilege**: Privileged member access
- **Scheduling**: Future publication date/time selection
- **Audience Targeting**: All students or society members only
- **Email Integration**: Optional notification distribution

#### Post Creation Access

**Content Creation Requirements**:

- **Society Advisor**: Full content creation access
- **Content Management Privilege**: Privileged member capabilities
- **Media Specifications**: 5 files maximum, 10MB per file
- **Event Integration**: Connect posts to completed events

### Financial Reporting and Analytics

#### Payout Processing

**Stripe Payout Schedule**:

- **Processing Frequency**: Daily 24-hour rolling basis
- **Delay Factors**: Stripe review, holidays, weekends, verification status
- **New Account Delays**: Initial payout restrictions for new accounts

#### Revenue Calculations

**Projected Revenue Methodology**:

- **Historical Analysis**: Previous month performance data
- **Current Performance**: Month-to-date ticket sales
- **Pricing Analysis**: Average ticket price calculations
- **Predictive Modeling**: Basic trend analysis

#### Transaction Status Explanations

**Status Definitions**:

- **Total Revenue**: Gross collected amount from paid registrations
- **Pending Payouts**: Amount not yet transferred to bank account
- **Pending Status**: Payment processing or verification in progress

### Platform Features and Limitations

#### Android Application

**Mobile Access**:

- **Download Method**: Index page "Download App" button
- **File Format**: Android .apk file
- **Distribution**: Direct download latest version

#### Technical Constraints

**System Limitations**:

- **Video Meetings**: 80-minute duration, 200 participant maximum
- **File Uploads**: 10MB per file maximum
- **Society Membership**: Two society maximum per student
- **Office Bearer Roles**: Single society limitation

### Future Platform Enhancements

#### Planned Financial Features

**Upcoming Capabilities**:

- **Downloadable Reports**: PDF/CSV financial summaries
- **Automated Summaries**: Monthly email reports
- **Alert System**: Failed transaction and payout notifications
- **Revenue Breakdown**: Ticket tier and discount code analysis

#### Platform Development Roadmap

**Enhancement Areas**:

- **Analytics Expansion**: Enhanced reporting capabilities
- **Communication Features**: Additional messaging tools
- **Mobile Optimization**: Improved mobile experience
- **Integration Capabilities**: Third-party service connections

**Keywords**: FAQ, support system, troubleshooting, account management, payment issues, platform limitations, future enhancements

---

## Comprehensive Feature Index

### Core Platform Features

- **User Authentication**: Student and advisor account systems
- **Society Management**: Complete organizational administration
- **Event Management**: Creation, registration, and analytics
- **Payment Processing**: Stripe integration and financial tracking
- **Communication**: Real-time chat and video meetings
- **Task Management**: Personal and assigned task systems
- **Team Organization**: Sub-group management and coordination

### Administrative Features

- **Role Management**: Privilege-based access control
- **Member Management**: User lifecycle administration
- **Content Management**: Post and announcement publishing
- **Financial Management**: Revenue tracking and reporting
- **Settings Management**: Society configuration and customization

### User Experience Features

- **Dashboard Systems**: Role-specific information displays
- **Navigation Systems**: Sidebar and topbar interfaces
- **Search and Discovery**: Cross-platform content finding
- **Mobile Access**: Android application availability
- **Real-Time Features**: WebSocket-powered interactions

### Integration Capabilities

- **Stripe Payments**: Secure transaction processing
- **Daily.co Video**: Professional meeting platform
- **Cloudinary Storage**: Scalable media management
- **Socket.IO Communication**: Real-time messaging infrastructure
- **Email Systems**: Notification and verification services

**Keywords**: platform features, system integration, user experience, administrative tools, technical capabilities

---

_This comprehensive documentation is optimized for RAG (Retrieval-Augmented Generation) systems with extensive keyword coverage, structured information hierarchy, detailed cross-referencing, and complete feature documentation covering all aspects of the SocioHub platform._
