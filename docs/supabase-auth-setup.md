# Supabase Auth Setup

Helping Teachers is designed to remain usable without an account. Login is only for optional saved features, such as saved preferences, lists, schedules, and tool settings.

## 1. Create a Supabase project

Create a project in Supabase, then copy these public values from Project Settings > API:

- Project URL
- anon public key

Paste them into `js/auth-config.js` and set `enabled` to `true`:

```js
window.HELPING_TEACHERS_AUTH = {
  enabled: true,
  supabaseUrl: "https://YOUR_PROJECT_REF.supabase.co",
  supabaseAnonKey: "YOUR_SUPABASE_PUBLISHABLE_KEY",
  redirectTo: window.location.origin + window.location.pathname
};
```

The anon key is intended for browser use when Row Level Security policies are configured correctly. Do not put service role keys in the site.

## 2. Enable auth providers

In Supabase Auth providers, enable:

- Google
- Microsoft / Azure
- Email magic links

Add the production site URL and local development URL to the allowed redirect URLs. Common values:

```text
https://helpingteachers.io/**
http://localhost:8000/**
http://127.0.0.1:8000/**
```


## 3. Customize auth emails

Supabase's default email is generic. Before sharing the login with teachers, update the email template in:

Authentication > Emails

Recommended subject:

```text
Sign in to Helping Teachers
```

Recommended message body:

```html
<h2>Sign in to Helping Teachers</h2>
<p>Use the secure link below to finish signing in. Helping Teachers accounts are for teachers and are used only for optional saved features.</p>
<p><a href="{{ .ConfirmationURL }}">Sign in to Helping Teachers</a></p>
<p>If you did not request this email, you can ignore it.</p>
```

Spanish-friendly subject option:

```text
Sign in to Helping Teachers / Inicia sesión en Helping Teachers
```

Spanish-friendly message body:

```html
<h2>Sign in to Helping Teachers</h2>
<p>Use the secure link below to finish signing in. / Usa el enlace seguro para completar el inicio de sesión.</p>
<p><a href="{{ .ConfirmationURL }}">Sign in / Iniciar sesión</a></p>
<p>If you did not request this email, you can ignore it. / Si no solicitaste este correo, puedes ignorarlo.</p>
```

## 4. Create saved-data tables

After login works, run the SQL in `docs/supabase-database-setup.sql` from Supabase SQL Editor. It creates:

- `teacher_profiles`: one profile per signed-in teacher.
- `teacher_tool_settings`: saved tool data owned by each teacher, such as Reward Wheel rewards.

Both tables use Row Level Security so a teacher can only read and edit their own saved data.

## 5. Recommended rollout order

1. Connect auth and test magic link.
2. Save teacher profile and display name.
3. Save Reward Wheel rewards.
4. Save Name Spinner and Team Generator lists after privacy review.
5. Save Visual Schedule, Flashcards, and other lower-risk preferences.