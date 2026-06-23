

## Remove Lovable Branding from Google Sign-In

When you sign in with Google, the consent screen shows "Lovable" because SpendWise uses Lovable's managed Google OAuth credentials. To show your own app name ("SpendWise"), you need to set up your own Google OAuth credentials.

### What's needed

**1. Create your own Google OAuth credentials (done by you in Google Cloud Console)**
- Go to [Google Cloud Console](https://console.cloud.google.com/)
- Create a project named "SpendWise"
- Configure the OAuth consent screen with your app name, logo, and authorized domains
- Create OAuth Client ID (Web application type)
- Add the redirect URL from Lovable Cloud's Auth Settings for Google

**2. Add your credentials to Lovable Cloud**
- Open Lovable Cloud → Users → Auth Settings → Google
- Enter your own Client ID and Client Secret

**3. No code changes needed**
The existing `lovable.auth.signInWithOAuth("google")` code works the same way with custom credentials.

### How to get the redirect URL

<lov-actions>
  <lov-open-backend>View Cloud Dashboard</lov-open-backend>
</lov-actions>

Open the Cloud dashboard, go to Users → Auth Settings, expand Google, and copy the redirect URL shown there. Use that as the "Authorized redirect URI" in your Google Cloud Console OAuth client.

### Summary
This is a configuration-only change — no code modifications required. Once you add your own Google OAuth credentials, the consent screen will show "SpendWise" instead of "Lovable".

