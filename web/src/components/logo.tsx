import { Link } from "react-router";

export const Logo = () => {
  const isAuthenticated = false;
  return (
    <Link to={isAuthenticated ? "/dashboard" : "/"}>
      <img src="/assets/logo-sociohub.svg" alt="SocioHub-Logo" width={120} />
    </Link>
  );
};
