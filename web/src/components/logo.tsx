import { Link } from "react-router";

export const Logo = () => {
  const isAuthenticated = false;
  return (
    <Link to={isAuthenticated ? "/dashboard" : "/"}>
      <img
        src="/assets/logo-sociohub.svg"
        alt="SocioHub-Logo"
        className="lg:w-[120px] w-[100px]"
      />
    </Link>
  );
};
