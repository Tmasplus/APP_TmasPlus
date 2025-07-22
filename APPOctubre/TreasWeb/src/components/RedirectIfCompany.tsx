import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from '../store/store';

const RedirectIfCompany = () => {
  const navigate = useNavigate();
  const authState = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (authState?.user?.usertype === "company") {
      navigate("/shiftchanger");
    }
  }, [authState, navigate]);

  return null; // No renderiza nada
};

export default RedirectIfCompany;
