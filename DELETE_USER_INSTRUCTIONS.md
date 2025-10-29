# Delete User - Manual Instructions

If the delete script doesn't work, you can delete the user manually from Firebase Console:

## Steps:

### 1. Delete from Firestore (User Profile)
1. Go to: https://console.firebase.google.com/project/dermalr-f1f93/firestore
2. Navigate to: **Database** > **Firestore Database**
3. Find collection: `profiles`
4. Find document with your username (e.g., `anilpunia`)
5. Click the document and click **Delete**

### 2. Delete from Realtime Database (Check-ins)
1. Go to: https://console.firebase.google.com/project/dermalr-f1f93/database
2. Navigate to: **Database** > **Realtime Database**
3. Find path: `check-ins` > your username (e.g., `anilpunia`)
4. Click the item and click **Delete**

## Using the Script (Recommended)

Run the delete script from your terminal:

```bash
node delete-user.js anilpunia
```

Replace `anilpunia` with your actual username.

## After Deletion

1. Clear your browser localStorage:
   - Open browser DevTools (F12)
   - Go to: Application > Local Storage > http://localhost:3000
   - Delete all items or just `dermair_userId`

2. Refresh the landing page
3. Create a new account with the same username
4. You'll now be prompted to set a PIN!
