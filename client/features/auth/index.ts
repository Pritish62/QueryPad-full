export { LoginForm } from "./components/login-form";
export { SignOutButton } from "./components/sign-out-button";
export { authClient, signIn, signOut, useSession } from "./lib/auth-client";
export {
  authRoutes,
  protectedRoutes,
  unauthenticatedRoutes,
  isProtectedRoute,
  isUnauthenticatedRoute,
} from "./lib/auth-routes";
