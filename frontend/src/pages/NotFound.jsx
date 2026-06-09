import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center px-4">
        <h1 className="mb-4 text-6xl font-bold">404</h1>
        <p className="mb-6 text-xl text-muted-foreground">
          Oops! The page <span className="font-mono">{location.pathname}</span> does not exist.
        </p>
        <Link
          to="/"
          className="inline-block text-primary underline hover:text-primary/90 transition-colors"
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
