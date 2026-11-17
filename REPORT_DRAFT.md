# CAMPUS LOST AND FOUND PORTAL
## Project Report Draft

**Sai University — School of Computing and Data Science**  
**B.Tech Computer Science | Academic Year 2026–2027**  
**Course:** Web Technology and Internet Programming  
**Student Name:** [Your full name]  
**Register Number:** [Your register number]  
**Section:** [Your section]  
**Faculty:** [Faculty name]  
**Submission Date:** 30 November 2026

> Transfer this content into the official Sai University project-report template. Apply the prescribed cover page, font, spacing, page numbering and declaration rules. Do not submit this Markdown file as the final report unless explicitly permitted.

## 1. Abstract
The Campus Lost and Found Portal is a full-stack web application designed to help students report lost belongings and share information about items found on campus. Users can create accounts, publish lost or found item reports, search listings, submit claims and track their requests. Item owners can review claims, while administrators can monitor listings, claims and recovery status. The application uses HTML, CSS and JavaScript for the frontend, Node.js and Express.js for the backend, and MongoDB for persistent data storage.

## 2. Introduction
Students may lose personal belongings in classrooms, laboratories, libraries, cafeterias and other campus locations. A centralised digital portal can make reporting and searching easier than informal communication. This project provides a single platform for students and administrators.

## 3. Objectives
- Provide a responsive interface for lost and found reports.
- Allow students to register, log in and manage their activity.
- Store item reports and claims in a persistent database.
- Support keyword search and category/location/type filters.
- Provide claim review and item recovery status management.
- Test REST API behaviour using Postman.

## 4. Scope
The system supports student and administrator roles. Students can report items, browse listings and submit claims. Item owners can approve or reject claims. Administrators can view portal statistics and manage item status. The current project is intended for a campus demonstration and can be extended with institutional email verification and notification services.

## 5. Technology Stack
| Layer | Technology | Purpose |
|---|---|---|
| Frontend | HTML5 | Page structure and forms |
| Styling | CSS3 | Responsive interface |
| Client logic | JavaScript ES6+ | DOM, events and Fetch API |
| Backend | Node.js, Express.js | REST API and middleware |
| Database | MongoDB, Mongoose | Persistent storage |
| Authentication | bcryptjs, JSON Web Token | Password hashing and protected routes |
| API testing | Postman | Endpoint testing |
| Version control | Git, GitHub | Source management |
| Deployment | [Platform selected] | Hosting |

## 6. System Design
### 6.1 Architecture
Browser (HTML/CSS/JavaScript) → Fetch API → Express REST API → Authentication middleware → Mongoose models → MongoDB.

### 6.2 Main Modules
1. Authentication: registration, login and current-user verification.
2. Item management: create, browse, retrieve, update and delete reports.
3. Search: keyword, category, location, type and date sorting.
4. Claim management: submit and review claims.
5. User dashboard: own reports, submitted claims and received claims.
6. Admin dashboard: counts, listings, claims and item status.

### 6.3 Database Collections
**Users:** name, email, hashed password, role, timestamps.  
**Items:** title, type, category, description, location, item date, image path, status, reporting user, timestamps.  
**Claims:** item reference, claimant reference, message, status, reviewer, timestamps.

### 6.4 Relationships
- One user can create many item reports.
- One item can receive claims from multiple users.
- Each claim belongs to one item and one claimant.

## 7. Implementation
The frontend uses semantic HTML elements, responsive CSS layouts, JavaScript event listeners and Fetch API requests. The backend uses Express routes and middleware. Passwords are hashed before storage. JWT authentication protects private endpoints. Role-based middleware restricts administrator functions. Mongoose models store users, items and claims in MongoDB.

## 8. Additional Feature
**Date sorting:** Users can sort item listings by newest first or oldest first. The selected sort order is sent as a query parameter to the API, which sorts records by item date.

## 9. API Testing
Import the provided Postman collection and execute each request. Record the actual status code, response and screenshot in the final report.

| Test | Scenario | Expected result |
|---|---|---|
| 1 | Health check | 200 |
| 2 | Valid registration | 201 |
| 3 | Valid login | 200 |
| 4 | Invalid registration | 400 |
| 5 | Browse items | 200 |
| 6 | Search and date sort | 200 |
| 7 | Retrieve one item | 200 or 404 for invalid ID |
| 8 | Create report with token | 201 |
| 9 | Submit claim with token | 201 or validation response |
| 10 | Create report without token | 401 |
| 11 | View own listings | 200 |
| 12 | Admin endpoint with student token | 403 |

## 10. Screenshots
Insert actual screenshots of:
- Home page and responsive layout
- Registration and login
- Lost/found report form
- Search results and date sorting
- User dashboard
- Claim submission and review
- Admin dashboard
- MongoDB collections
- Postman test results
- Deployed application

## 11. Deployment
**Hosting platform:** [Add platform]  
**Application URL:** [Add deployed URL]  
**Database hosting:** [Local MongoDB / MongoDB Atlas]  
**GitHub repository:** [Add repository URL]

Add actual deployment steps, environment variable configuration and deployment screenshots after deployment.

## 12. Results
The application is intended to provide a centralised portal for reporting and recovering campus belongings. Enter the actual results after running the application and completing all tests. Do not claim tests passed unless they were executed successfully.

## 13. Conclusion
The Campus Lost and Found Portal demonstrates the development of a full-stack web application using frontend technologies, a REST API, authentication and a NoSQL database. It supports item reporting, searching, claim management and administration. Future improvements may include email notifications, campus-building maps, duplicate-item detection and institutional single sign-on.

## 14. References
- MDN Web Docs: https://developer.mozilla.org/
- Node.js Documentation: https://nodejs.org/docs/
- Express.js Documentation: https://expressjs.com/
- MongoDB Documentation: https://www.mongodb.com/docs/
- Mongoose Documentation: https://mongoosejs.com/docs/
- Postman Learning Center: https://learning.postman.com/

## 15. AI Use Disclosure
AI assistance was used to help plan the project structure, draft code examples and prepare documentation. The student must review, test, understand, modify and take responsibility for the submitted implementation in accordance with university policy.
