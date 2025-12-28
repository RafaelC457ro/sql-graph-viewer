import { Link } from "react-router-dom";

export function NotFound() {
  return (
    <div className="container mx-auto p-8 text-center relative z-10">
      <h1 className="text-4xl font-bold mb-4">404</h1>
      <p className="text-muted-foreground mb-6">
        The page you're looking for doesn't exist.
      </p>
      <Link
        to="/"
        className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Go to Home
      </Link>
    </div>
  );
}
