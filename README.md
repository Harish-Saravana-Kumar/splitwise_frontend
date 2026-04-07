# Splitwise Frontend

This project is the frontend application for the Splitwise backend API.

It provides a clean, fast, and user-friendly interface to manage groups, add expenses, track balances, and settle dues.

---

## Purpose

This app is built to work with your backend service and consumes backend APIs for:

- authentication,
- group management,
- expense management,
- balance calculations,
- settlement tracking,
- dashboard summaries.

---

## How The App Works

1. User registers or logs in.
2. JWT token is stored in frontend state and sent with protected API requests.
3. User creates groups and adds members.
4. Expenses are added with supported split types: EQUAL, EXACT, PERCENTAGE, SHARES.
5. Balances and settlement suggestions are shown for each group.
6. Eligible users can settle dues.
7. Dashboard shows totals, group summaries, and person-to-person balances.

---

## Frontend UI and UX Improvements

The frontend has been improved for better usability and smoother user flow:

- Dashboard-first navigation after login/register.
- Header navigation with quick access to Dashboard and Groups.
- Profile popover in header with user details and logout.
- Better group detail layout with tabs for Expenses, Balances, Settlements.
- Members side panel with name and user ID visibility.
- Permission-aware actions (delete/settle visibility and behavior aligned with backend rules).
- Improved Add Expense modal layout and responsive alignment.
- Clear split status labels such as paid by, owes, and settled.
- Balances view with filters:
  - Balance Debts,
  - Settlement Suggestions,
  - Expense-Wise Member Splits.
- Improved loading states and feedback using skeletons and toast notifications.
- Refined shared button interactions and hover effects for consistency.

---

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Zustand
- Axios

---

## Run Locally

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Build for production:

```bash
npm run build
```

Preview build:

```bash
npm run preview
```

---

## Backend Connection

The Vite dev server proxies API requests to backend:

- frontend request base: `/api`
- backend target (dev): `http://localhost:8080`

Make sure backend is running before testing authenticated flows.
