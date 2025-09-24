// import { AuthProvider } from "../components/AuthProvider";
// import Navbar from "../components/Navbar";

// export const metadata = { title: "DonateNow" };

// export default function RootLayout({ children }) {
//   return (
//     <html lang="en">
//       <body style={{ margin: 0, background: "#fefce8" }}>
//         <AuthProvider>
//           <Navbar />
//           {children}
//         </AuthProvider>
//       </body>
//     </html>
//   );
// }
import AuthProvider from "../components/AuthProvider";

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}