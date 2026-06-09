# Security Specification: NCU Gym Firebase Rules Spec

This document details the Zero-Trust Attribute-Based Access Control (ABAC) specifications for modern Firebase Firestore structures matching the NCU Gym administration goals.

## Core Roles
- **Super Administrator**: Defined statically as `judyyang.minoyang@gmail.com`. Has full read/write privileges over all configurations and can assign or revoke staff memberships.
- **Staff (工讀生)**: Assigned dynamically by the Super Administrator. Staff records are stored inside `/staff_members/{email}`. Staff members are authorized to update real-time gym stats `/config/gymState` but cannot self-assign roles or modify staff directory configurations.
- **Guest (訪客/一般同學)**: Unauthenticated or standard authenticated student. Can read the public `/config/gymState` but has absolutely zero write permissions.

---

## 1. Data Invariants & Access Logic

1. **Rule of Public Visibility**: `/config/gymState` can be read by anyone, including anonymous/unauthenticated users. No active access token is required to view gym data.
2. **Rule of Verified Operations**: Any write to the database (modifying gym occupancy, updating equipment, deleting feedbacks) requires a Google authenticated email where `request.auth.token.email_verified == true`.
3. **Rule of Delegated Staffing**: Only the Super Admin (`judyyang.minoyang@gmail.com`) is authorized to write to `/staff_members/{email}`.
4. **Rule of State Integrity**: All updates to `gymState` must adhere to correct structural payloads.

---

## 2. The "Dirty Dozen" Malicious Payloads

The following 12 payloads represent malicious attempts to bypass security structures, which must be strictly blocked with `PERMISSION_DENIED`:

| Test ID | Targeted Resource | Role Tested | Description of Attack Payload | Expected Result |
|---|---|---|---|---|
| D01 | `/config/gymState` | Unauthenticated | Attempting anonymously to reset gym headcount to 0 or 50. | `PERMISSION_DENIED` |
| D02 | `/config/gymState` | General Student | Standard authenticated user (e.g., `student@u.ncu.edu.tw`) trying to push a custom announcement. | `PERMISSION_DENIED` |
| D03 | `/staff_members/attacker@g.com` | Unauthenticated | Attempting anonymously to write a fake staff record to authorize oneself. | `PERMISSION_DENIED` |
| D04 | `/staff_members/attacker@g.com` | General Student | Attempting to create a self-assigned staff document to gain admin console rights. | `PERMISSION_DENIED` |
| D05 | `/staff_members/judyyang.minoyang-gmail.com` | Staff Member | Dynamic staff member tries to overwrite or delete the Super Administrator's record. | `PERMISSION_DENIED` |
| D06 | `/staff_members/someone@g.com` | Staff Member | A staff member trying to assign staff access to another friend. | `PERMISSION_DENIED` |
| D07 | `/config/gymState` | Attacker (Spoofed Admin) | Google user with email `judyyang.minoyang@gmail.com` but `email_verified: false` attempts to write data. | `PERMISSION_DENIED` |
| D08 | `/config/gymState` | Staff Member | Staff member attempts to modify the schema structure by injecting a non-standard field `superSecretSystemField`. | `PERMISSION_DENIED` |
| D09 | `/config/gymState` | Staff Member | Attempting to overwrite the configuration document with null keys. | `PERMISSION_DENIED` |
| D10 | `/staff_members/{malformed_id}` | Super Admin | Super Admin attempts to create other staff members using invalid unicode junk characters for document ID. | `PERMISSION_DENIED` |
| D11 | `/config/gymState` | Attacker (Spoofed Email) | Attacker attempting to spoof dynamic claims in auth payload to gain access. | `PERMISSION_DENIED` |
| D12 | `/config/gymState` | General Student | Student attempts to delete the entire `gymState` configuration doc. | `PERMISSION_DENIED` |

---

## 3. Test Runner Definition

For real-time testing, verification of these 12 invariants represents the complete secure state tree.
All operations executing unauthorized writes must fail.
