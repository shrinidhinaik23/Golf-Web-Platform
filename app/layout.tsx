import "./globals.css";
import SiteNavbar from "../components/layout/SiteNavbar";
import Script from "next/script";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Script
          id="razorpay-checkout"
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <div className="page-wrap">
          <SiteNavbar />
          {children}
        </div>
      </body>
    </html>
  );
}