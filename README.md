# Campus Lost and Found Portal

**Sai University — School of Computing and Data Science**  
**B.Tech Computer Science | Academic Year 2026–2027**  
**Web Technology and Internet Programming — Individual Project**

A responsive full-stack web application for reporting lost/found campus items, searching listings, submitting claims, and managing item recovery.

## Features
- Student registration, login, logout and JWT-protected routes
- Lost/found item reports with optional image upload
- Search by keyword, category, location and listing type
- Newest/oldest date sorting (additional feature)
- Claims: submit, view, approve and reject
- Student dashboard for listings and claims
- Admin dashboard with basic statistics and item status controls
- MongoDB persistence, input checks, password hashing and role checks

## Requirements
- Node.js 18 or later
- MongoDB Community Server running locally, or a MongoDB Atlas connection string
- VS Code (recommended)

## Setup on Windows
1. Extract the ZIP.
2. Open the extracted `Campus_Lost_and_Found_Portal` folder in VS Code.
3. Open Terminal → New Terminal.
4. Run `npm install`.
5. Copy `.env.example` to a new file named `.env`.
6. Edit `.env` and set a strong `JWT_SECRET`. Keep `.env` private.
7. Make sure MongoDB is running. For Atlas, replace `MONGO_URI` with your connection string.
8. Run `npm run seed` once to create the admin, demo student and 10 sample items.
9. Run `npm start`.
10. Open http://localhost:5000 in your browser.

## Demo accounts
- Admin email: `admin@saiuniversity.edu.in`
- Admin password: `Admin@12345`
- Student email: `student.demo@saiuniversity.edu.in`
- Student password: `Student@123`

Change these passwords and the JWT secret before deployment. Do not commit `.env` to GitHub.

## API overview
| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register |
| POST | `/api/auth/login` | Public | Login |
| GET | `/api/auth/me` | Student/Admin | Current user |
| GET | `/api/items` | Public | Search/browse |
| POST | `/api/items` | Student/Admin | Create report |
| GET | `/api/items/:id` | Public | Item details |
| PATCH | `/api/items/:id` | Owner/Admin | Update item |
| DELETE | `/api/items/:id` | Owner/Admin | Delete item |
| GET | `/api/items/mine` | Student/Admin | Own listings |
| POST | `/api/claims` | Student/Admin | Submit claim |
| GET | `/api/claims/mine` | Student/Admin | Own claims |
| GET | `/api/claims/received` | Student/Admin | Claims on own items |
| PATCH | `/api/claims/:id/review` | Owner/Admin | Approve/reject |
| GET | `/api/admin/stats` | Admin | Statistics |
| GET | `/api/admin/items` | Admin | All items |
| GET | `/api/admin/claims` | Admin | All claims |
| PATCH | `/api/admin/items/:id/status` | Admin | Change item status |

For protected endpoints, send header: `Authorization: Bearer YOUR_TOKEN`.

## Postman
Import `postman/Campus-Lost-and-Found.postman_collection.json`. Run health check, login, copy the returned token into the collection's `token` variable, and use an existing item ID for the item/claim tests. The collection includes successful and expected-error cases. Save screenshots of actual test results for your report.

## Folder structure
```text
Campus_Lost_and_Found_Portal/
├── public/
│   ├── index.html
│   ├── styles.css
│   └── app.js
├── src/
│   ├── middleware/
│   ├── models/
│   └── routes/
├── postman/
├── uploads/
├── .env.example
├── package.json
├── seed.js
└── server.js
```

## Important project notes
- The sample data is fictional demonstration data.
- This project is a student starter implementation. Run all tests, review the code, and make it your own before submission.
- Confirm with the instructor that date sorting is accepted as the individual additional feature.
- Add your own screenshots, GitHub URL, deployed URL, and prescribed report formatting before final submission.
- Disclose AI assistance according to university instructions. Understand every module for the viva.
