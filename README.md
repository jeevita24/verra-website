# VERRA — Women's Clothing Website

A responsive website for VERRA, a women's clothing brand in Goa, India.

## Static GitHub Pages deployment

This site is designed to run on GitHub Pages. GitHub Pages serves static files
only, so it does **not** execute the files in `api/` as serverless functions.

The browser loads `supabase-config.js`, which contains only the Supabase project
URL and browser-safe publishable/anon key. The publishable/anon key is designed
to be publicly available; it is safe to commit when Supabase Row Level Security
and Auth policies are configured correctly. **Never** put a service-role key,
database password, JWT signing secret, SMTP credential, or any other privileged
secret in this repository or in `supabase-config.js`.

## Password reset setup

1. In Supabase Dashboard, open **Authentication → URL Configuration**.
2. Set the Site URL to the production site URL.
3. Add the exact production reset callback URL to **Redirect URLs**:
   `https://officialverra.in/reset-password.html`
4. Keep the reset email template's confirmation URL pointed at Supabase's
   `{{ .ConfirmationURL }}` so Supabase can create and validate the recovery
   token.

The Account page calls Supabase Auth directly to send the recovery email. The
email link returns to `reset-password.html`, where Supabase restores the
recovery session and the page calls `auth.updateUser({ password })`.

## Local preview

Serve the repository through an HTTP server rather than opening HTML files
with `file://`, for example:

```sh
python3 -m http.server 8000
```

Then open `http://localhost:8000/account.html`. Add the corresponding local
reset callback URL to Supabase Redirect URLs only when testing locally.
