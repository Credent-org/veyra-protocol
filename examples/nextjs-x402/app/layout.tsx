import type { ReactNode } from "react";

export const metadata = {
  title: "Veyra x402 Next.js example",
  description: "Paid Route Handler example for Veyra x402 payments",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
