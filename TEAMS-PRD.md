# Product Requirements Document: Team Module

**Document Version:** 1.0
**Author:** Muhammad Moavia
**Date:** July 24, 2025

---

## 1. Introduction

### 1.1. Purpose

This document outlines the requirements for the "Team" module within the SocioHub application. This module aims to enhance internal organization and collaboration within university societies by enabling the creation and management of specialized teams, task delegation, and targeted communication channels.

### 1.2. Module Overview

The Team module will allow society administrators to create multiple internal teams (e.g., Marketing Team, Media Team) within their respective societies. Society members can join these teams, and specific responsibilities and tasks can be assigned at both the team level (by society advisors/privileged members) and individual member level (by team leads). Each team will have a dedicated profile page and integrated communication tools.

### 1.3. Goals & Objectives

- To improve the organizational structure of societies within SocioHub.
- To facilitate better task management and delegation among society members.
- To enable more focused communication within specific groups of society members.
- To provide clarity on responsibilities for different society operations and events.
- To foster greater collaboration and efficiency among society members working on specific initiatives.

---

## 2. Stakeholders

- **Society Administrators:** Responsible for creating and overseeing teams.
- **Team Leads:** Responsible for managing their specific teams and assigning tasks to members.
- **Society Members (General):** Users who can join teams and perform assigned tasks.
- **Society Advisors / Members with Privilege:** Can assign tasks to entire teams.
- **SocioHub Development Team:** Responsible for implementing the module.
- **SocioHub Product Team:** Responsible for defining and prioritizing features.

---

## 3. User Stories

### 3.1. Society Administrator

- As a Society Admin, I want to create a new team with a name, description, and assign a team lead, so I can organize my society's members into specialized groups.
- As a Society Admin, I want to see a list of all teams within my society, so I can oversee their structure.
- As a Society Admin, I want to edit a team's details (name, description, lead) or delete a team, so I can manage team configurations.
- As a Society Admin, I want to add/remove any member from any team directly, so I have full control over team composition.

### 3.2. Team Lead

- As a Team Lead, I want to manage my team's members by adding or removing them, so I can ensure the right people are in my team.
- As a Team Lead, I want to view all tasks assigned to my team by a Society Advisor or Privileged Member, so I know our team's overall responsibilities.
- As a Team Lead, I want to assign specific tasks to individual members within my team, so I can delegate responsibilities effectively.
- As a Team Lead, I want to track the status of tasks assigned to my team and its members, so I can monitor progress.
- As a Team Lead, I want to communicate with my team using a dedicated group chat, so discussions are centralized.
- As a Team Lead, I want to make announcements visible only to my team members, so I can share team-specific updates.

### 3.3. Society Member

- As a Society Member, I want to browse available teams within my society, so I can find groups aligned with my interests/skills.
- As a Society Member, I want to send a request to join a team, so I can get involved in specific society activities.
- As a Society Member, I want to view the profile page of teams I'm part of, so I can see team details, members, and assigned tasks.
- As a Society Member, I want to view tasks assigned specifically to me within a team, so I know what I need to work on.
- As a Society Member, I want to participate in the group chat of the teams I am part of, so I can collaborate with my teammates.
- As a Society Member, I want to receive announcements targeted to my teams, so I stay informed about team-specific updates.

### 3.4. Society Advisor / Member with Privilege

- As a Society Advisor/Privileged Member, I want to assign tasks to an entire team, so I can delegate broader responsibilities without managing individual members.

---

## 4. Functional Requirements

### 4.1. Team Creation & Management (Society Admin)

- **FR.TM.1.1:** Society Admin shall be able to navigate to a "Teams" section within their society's dashboard/settings.
- **FR.TM.1.2:** Society Admin shall be able to initiate the creation of a new team.
- **FR.TM.1.3:** Team creation form shall include fields for:
  - **Team Name** (text input, required, max 50 chars).
  - **Team Description** (multi-line text input, optional, max 500 chars).
  - **Team Lead** (searchable dropdown/select of existing society members, optional at creation but can be assigned later).
- **FR.TM.1.4:** Society Admin shall be able to view a list of all created teams within their society.
- **FR.TM.1.5:** Society Admin shall be able to edit the details (name, description, team lead) of any existing team.
- **FR.TM.1.6:** Society Admin shall be able to delete an existing team (with a confirmation prompt). Deleting a team should unlink all associated tasks and remove all members from that team.

### 4.2. Team Membership Management

- **FR.TM.2.1:** Society Members shall be able to view a list of teams available within their society (excluding private teams they are not invited to).
- **FR.TM.2.2:** Society Members shall be able to send a request to join a public team.
- **FR.TM.2.3:** Team Leads and Society Admins shall receive notifications for new team join requests.
- **FR.TM.2.4:** Team Leads and Society Admins shall be able to approve or deny team join requests.
- **FR.TM.2.5:** Team Leads and Society Admins shall be able to invite specific society members to join their team.
- **FR.TM.2.6:** Invited members shall receive notifications and be able to accept or decline team invitations.
- **FR.TM.2.7:** Team Leads and Society Admins shall be able to directly add/remove any society member from their team.
- **FR.TM.2.8:** A member's profile shall display the list of teams they belong to.

### 4.3. Team Profile Page

- **FR.TM.3.1:** Each team shall have a dedicated profile page, accessible by its members, team lead, and society admins.
- **FR.TM.3.2:** The Team Profile page shall display:
  - Team Name and Description.
  - Assigned Team Lead.
  - List of current team members (name, profile link, and any team-specific role if implemented).
  - **Team-Level Tasks** (as described in FR.TM.4.1).
  - **Member-Level Tasks** (as described in FR.TM.5.1).
  - Team Group Chat (as described in FR.TM.6.1).
  - Team-Specific Announcements (as described in FR.TM.7.1).
- **FR.TM.3.3:** Non-team members (who are society members) can view public team profiles (excluding private features like chat/tasks).

### 4.4. Team-Level Task Management (by Society Advisor / Privileged Member)

- **FR.TM.4.1:** Society Advisors or Members with Privilege shall be able to assign tasks directly to an entire team.
- **FR.TM.4.2:** Team-level tasks shall include:
  - Task Title (required).
  - Task Description (optional).
  - Due Date (optional).
  - Status (e.g., `To Do`, `In Progress`, `Completed`, `Under Review`).
- **FR.TM.4.3:** Team-level tasks shall be visible on the respective Team Profile page for all team members, and for the Society Advisor/Privileged Member who assigned it.
- **FR.TM.4.4:** Team Leads shall be able to update the status of team-level tasks.
- **FR.TM.4.5:** Notifications shall be sent to the Team Lead and team members when a new task is assigned to their team.

### 4.5. Member-Level Task Management (by Team Lead)

- **FR.TM.5.1:** Team Leads shall be able to create tasks and assign them to specific individual members within their team.
- **FR.TM.5.2:** Member-level tasks shall include:
  - Task Title (required).
  - Task Description (optional).
  - Assigned Member (required, must be a member of the team).
  - Due Date (optional).
  - Status (e.g., `To Do`, `In Progress`, `Completed`, `Under Review`).
- **FR.TM.5.3:** Member-level tasks shall be visible on the Team Profile page and on the assigned member's personal "My Tasks" view (if such a global view exists for tasks).
- **FR.TM.5.4:** Team Leads shall be able to update the status of member-level tasks.
- **FR.TM.5.5:** Assigned members shall receive notifications when a new task is assigned to them.
- **FR.TM.5.6:** Assigned members shall be able to update the status of tasks assigned to them.

### 4.6. Team Communication (Group Chat)

- **FR.TM.6.1:** Each team shall have a dedicated group chat accessible only to its members.
- **FR.TM.6.2:** Team members shall be able to send and receive text messages within their team's chat.
- **FR.TM.6.3:** Notifications shall be sent to team members for new messages in their team's chat.

### 4.7. Team Announcements

- **FR.TM.7.1:** Society Admins and Team Leads shall be able to create announcements specifically targeted to one or more teams.
- **FR.TM.7.2:** Team-targeted announcements shall be visible on the respective Team Profile page and potentially in the main announcement feed for members of those teams.
- **FR.TM.7.3:** Members of targeted teams shall receive notifications for new team-specific announcements.

---

## 5. Non-Functional Requirements

- **Performance:** The module should load team lists and task boards efficiently, even for societies with many teams or tasks.
- **Security:** Access control (e.g., who can create/manage teams, who can view private teams/chats) must be strictly enforced.
- **Usability:** The interface for creating, managing, and interacting with teams and tasks should be intuitive and user-friendly.
- **Scalability:** The system should be able to handle a growing number of societies, teams, members, and tasks.

---

## 6. Technical Considerations

- **Database Schema:** New tables for `Teams`, `TeamMembers`, `TeamTasks`, `MemberTasks`.
- **APIs:** New API endpoints for team creation, management, membership, task assignment, and chat.
- **Notifications:** Integration with existing notification system for join requests, invitations, task assignments, and announcements.
- **Real-time:** Consider real-time capabilities for chat and potentially for task updates.

---

## 7. Future Enhancements (Out of Scope for V1.0)

- Team Analytics (e.g., task completion rates, member activity).
- Team-specific file/resource sharing.
- Integration with calendar for team events/deadlines.
- Role-based permissions within a team (beyond just Team Lead).
- Kanban board view for tasks.
- Team visibility options beyond public/private (e.g., hidden).

---

## 8. Assumptions & Constraints

- Society Administrators have the necessary privileges to manage society-level configurations.
- A "Member with Privilege" is a defined role within the society that can assign team-level tasks.
- Existing notification system can be leveraged for new notification types.
- Existing chat module (if any) can be adapted for team-specific group chats.
- Users must be members of a society to join a team within that society.

---
