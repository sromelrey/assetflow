# Asset Flow

**Asset Flow** is a centralized asset management system designed to track, manage, and maintain company assets such as monitors, peripherals, laptops, and other equipment across web and mobile platforms.

---

## 🧩 Project Structure

The project is composed of three main applications:

### 🌐 Asset Flow Portal
**Path:** `./asset-flow-portal`  
**Tech Stack:** Next.js  

**Description:**  
Web-based portal used by administrators and employees to manage assets, view assignments, and update asset information.

---

### 🔌 Asset Flow API
**Path:** `./asset-flow-api`  
**Tech Stack:** NestJS  

**Description:**  
Backend service responsible for authentication, authorization (RBAC), business logic, and data management for all Asset Flow applications.

---

### 📱 Asset Flow Mobile
**Path:** `./asset-flow-mobile`  
**Tech Stack:** React Native (Expo)  

**Description:**  
Mobile application used to scan asset barcodes/QR codes, update asset status, and synchronize data with the Asset Flow API.

---

## 🚀 Goal
To provide a scalable, secure, and easy-to-use asset management solution accessible via web and mobile devices.
