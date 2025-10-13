# 🔒 Secure File Transfer System

A secure cloud-based file sharing platform built with MERN (MongoDB, Express, React, Node.js) and AWS integration, designed for **hierarchical organizations such as universities, hospitals, or businesses.  
It ensures end-to-end encryption, **access control, **audit logging, and **time-limited file sharing — making it safer than typical cloud drives.

---

## 🚀 Features

### 🔐 Core Functionalities
- Secure File Upload & Download – Files are encrypted before storage and verified before download.  
- Expiry System – Files automatically expire after a set time limit.  
- Audit Logs – Every upload, download, and delete action is recorded.  
- Organization Hierarchy – Multi-level access control (e.g., Admin → Department → User).  
- Visibility Control – Define who can access each file (organization-wide, department, or specific user).  
- File Type Classification – Each file is tagged with its type (confidential, report, public, etc.).  
- Time-Limited Sharing – Generate share links that automatically expire.  

### 🧩 Additional Highlights
- JWT-based authentication and authorization.  
- Role-based access system (Admin, Manager, Employee).  
- Cloud integration with AWS S3 or other secure storage.  
- Fully responsive React frontend with dashboards and data tables.  
- Activity tracking and logs for compliance and auditing.

---

## 🏗 Tech Stack

| Category | Technology |
|-----------|-------------|
| Frontend | React.js, Axios, Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB (Mongoose ODM) |
| Cloud Storage | AWS S3 / Cloud Provider |
| Authentication | JWT Tokens + Bcrypt |
| Encryption | AES-256 / Crypto module |
| Version Control | Git & GitHub |

---

## 📁 Folder Structure