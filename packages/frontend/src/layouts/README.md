# Layouts

Layout components for the application. Layouts define the structure and wrapping components for different page types.

## Structure

```
layouts/
├── MainLayout.tsx        # Main application layout
├── AuthLayout.tsx        # Authentication pages layout
└── DashboardLayout.tsx   # Dashboard layout (future)
```

## Usage

Layouts wrap page components to provide consistent structure:

```tsx
<MainLayout>
  <PageContent />
</MainLayout>