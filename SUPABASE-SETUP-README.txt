BUILDMYWEBPAGE.NET — SUPABASE CONNECTION

Project URL:
https://tnrmgksnxofxdhciuyzc.supabase.co

The browser uses the supplied sb_publishable_ key.
Never put a service_role or sb_secret_ key in the website.

ADDED
- Email OTP sign-in on catalog/builder.html
- Save/update projects
- Save component selections
- Save guided-builder features
- My Projects list
- Load project back into the builder
- Existing localStorage retained as the pre-login draft
- Signed-in contact requests stored in contact_requests
- Unsigned contact requests keep the existing mailto fallback

TEST
1. Serve the site through Cloudflare or a local web server.
2. Open catalog/builder.html.
3. Enter an email and request a verification code.
4. Verify the code.
5. Press Save Project.
6. Check projects, project_selections, project_features in Supabase.
7. Change the design and Save again.
8. Load the project from My Projects.
9. Attach it to Contact Request and submit while signed in.
10. Check contact_requests and confirm the project status becomes submitted.

NOTE
Database submission is now connected. Automatic notification email to Fleming Solutions is not yet configured; that is best handled next with a Supabase Edge Function / email provider.

AUTOSAVE
- localStorage remains the instant local draft/cache.
- After sign-in, catalog selections and edits are debounced and saved to Supabase automatically.
- The first autosave creates the user's active project if one does not exist.
- Manual Save Project remains available as a retry/explicit save.
- Effects use the EF-xx prefix consistently in cloud snapshots and restore logic.

ACCOUNT CREATION WIZARD (2026-08)
- Create Account is a 3-step wizard: Account, Business, First Project.
- Signup uses Supabase email/password auth with Confirm Email enabled.
- Profile fields are sent in auth user metadata for public.handle_new_user().
- Project details are held locally until email confirmation completes.
- After the confirmation link returns to /catalog/builder.html, the pending project and current builder selections are saved automatically.
- Existing users sign in with email/password.
