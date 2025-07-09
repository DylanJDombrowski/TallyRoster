// app/components/theme-style.tsx
"use client";

interface ThemeStyleProps {
  primaryColor: string;
  secondaryColor: string;
  primaryFgColor: string;
  organizationName?: string;
}

export function ThemeStyle({ primaryColor, secondaryColor, primaryFgColor, organizationName }: ThemeStyleProps) {
  // This creates a standard <style> tag with the CSS variables.
  // It's a client component, which satisfies Vercel, but it contains no
  // client-side hooks, so it renders instantly with the server-provided props.
  return (
    <style>
      {`
      :root {
        --color-primary: ${primaryColor};
        --color-secondary: ${secondaryColor};
        --color-primary-foreground: ${primaryFgColor};${organizationName ? `\n        --organization-name: "${organizationName}";` : ""}
      }
    `}
    </style>
  );
}
