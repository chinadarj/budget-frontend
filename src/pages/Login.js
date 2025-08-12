import { useNavigate } from "react-router-dom";
import { Container, Box } from "@mui/material";
import AuthForm from "../components/AuthForm";

export default function Login() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => {
    navigate("/");
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 10 }}>
      <Box>
        <AuthForm onAuthSuccess={handleAuthSuccess} />
      </Box>
    </Container>
  );
}
