//this is for check prod branch
//hiii
//todo
2️⃣ EMPLOYEE MODULE (CORE)

Create:

Employee schema (linked to User)

Create employee (ADMIN / HR)

List employees (ADMIN / HR)

Activate / deactivate employee

3️⃣ INVENTORY MODULE

Create:

Item schema

Stock in / stock out

Low-stock alert logic

Role access:

ENGINEER → view

HR / ADMIN → manage

4️⃣ APPROVAL SYSTEM

Create:

Approval schema

Request approval (employee)

Approve / reject (HR / ADMIN)

Status tracking

5️⃣ ENGINE BREAKDOWN FEATURE

Create:

Breakdown schema (raw text + metadata)

Simple rule-based text → English output

Store original + generated summary

6️⃣ AUDIT LOGS (IMPORTANT)

Track:

Who did what

When

From which role

7️⃣ AUTH POLISH (FINAL)

Add:

Logout endpoint

Token expiry handling

Refresh token rotation check

8️⃣ ENV + SECURITY

.env validation

Helmet

Rate limiting