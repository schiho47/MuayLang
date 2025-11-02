# 🔐 Security & Configuration Guide

## Environment Variables Setup

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# Appwrite Configuration
EXPO_PUBLIC_APPWRITE_ENDPOINT=https://cloud.appwrite.io/v1
EXPO_PUBLIC_APPWRITE_PROJECT_ID=your_project_id
EXPO_PUBLIC_APPWRITE_DATABASE_ID=your_database_id

# Demo User for Guest Mode (View-only access)
# ⚠️ REQUIRED for guest mode to work - without this, guests will see empty data
EXPO_PUBLIC_DEMO_USER_ID=your_demo_user_id
```

⚠️ **Important**: `EXPO_PUBLIC_DEMO_USER_ID` is **required** for guest mode to display demo content. Without it, the app will still work, but guests will see empty data pages.

### How to Get Demo User ID

1. Login to [Appwrite Console](https://cloud.appwrite.io/)
2. Navigate to `Auth` → `Users`
3. Find your demo user (e.g., `sukiho47@gmail.com`)
4. Copy the User ID
5. Add it to your `.env` file

### Important Notes

⚠️ **DO NOT commit `.env` file to Git**

- The `.env` file is already in `.gitignore`
- It contains sensitive configuration
- Each developer should have their own `.env` file

✅ **Safe to commit:**

- `.env.example` (template without real values)
- Code with `process.env.EXPO_PUBLIC_*` references

❌ **Never commit:**

- `.env` (contains actual values)
- Hardcoded API keys or User IDs
- Passwords or secrets

## Guest Mode Security

### Current Implementation

Guest mode allows users to view demo content using a specific User ID:

- ✅ Read-only access to demo user's data
- ❌ Cannot create/update/delete data
- ✅ No authentication required

### Appwrite Permissions Setup

To ensure Guest mode is secure, configure your Appwrite collections with these permissions:

#### For Each Collection (Vocabulary, Training, etc.):

**Read Permissions:**

```
Role: Any
or
Role: Users (all authenticated users can read)
```

**Write Permissions (Create/Update/Delete):**

```
Role: User:[demo_user_id] (only the owner)
or
Role: User:[specific_user_id] (specific user only)
```

### Recommendations

1. **Use a Dedicated Demo Account**
   - Don't use your real account for demo
   - Create `demo@muaylang.app` or similar
   - Fill it with sample data

2. **Set Proper Permissions**
   - Read: Any user can view
   - Write: Only owner can modify
   - This prevents data tampering

3. **Monitor Usage**
   - Check Appwrite Analytics regularly
   - Watch for unusual activity
   - Rate limit if needed

4. **Alternative: Create Demo API**
   - For production, consider a separate demo endpoint
   - Return static/cached data
   - No real user data exposed

## Production Deployment

When deploying to production:

### Vercel/Netlify

Add environment variables in the dashboard:

```
EXPO_PUBLIC_DEMO_USER_ID=your_demo_user_id
```

### Expo EAS Build

Add to `eas.json`:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_DEMO_USER_ID": "your_demo_user_id"
      }
    }
  }
}
```

## FAQ

**Q: Is it safe to expose User ID?**
A: User IDs alone are not sensitive like passwords. However:

- ✅ Safe: With proper Appwrite permissions
- ❌ Unsafe: If permissions allow anyone to modify data
- 🔒 Best: Use environment variables + proper permissions

**Q: Can someone steal my data?**
A: If you set proper read/write permissions in Appwrite:

- Users can READ demo data (intended behavior)
- Users CANNOT WRITE to demo user's data (protected)

**Q: Should I use a real account?**
A: No, create a dedicated demo account:

- Use `demo@yourdomain.com`
- Fill with sample/fake data
- Never use personal information

## Contact

If you discover a security vulnerability, please email:

- **Email**: your-email@example.com
- **Response Time**: Within 48 hours

---

**Last Updated**: 2024-11-02
