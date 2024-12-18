import React, { useState } from 'react';
import { TextField, Button, Typography, Container, Card, CardContent, Alert, Box } from '@mui/material';
import { auth, functions } from './firbase';
import { signInWithEmailAndPassword } from 'firebase/auth';


const Login = ({ setUser }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  const handleLogin = async () => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCredential.user);
      
    } catch (error) {
      setError('Invalid email or password');
      console.error('Login error:', error);
    }
  };

  return (
    <Container
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: 'linear-gradient(135deg, #f0f4f8, #d9e2ec)',
      }}
    >
      <Card
        sx={{
          width: '100%',
          maxWidth: 400,
          padding: 4,
          boxShadow: '0 10px 20px rgba(0,0,0,0.1)',
          borderRadius: 2,
        }}
      >
        <CardContent>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              mb: 4,
            }}
          >
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/TIET_New_Mark.png/1024px-TIET_New_Mark.png"
              alt="TIET Logo"
              style={{ width: 400, height: 150, marginBottom: 16 }}
            />
            <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold', color: '#1a365d' }}>
             Smart Scan
            </Typography>
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Password"
            type="password"
            variant="outlined"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            fullWidth
            onClick={handleLogin}
            sx={{
              mt: 2,
              py: 1.5,
              bgcolor: '#2c5282',
              '&:hover': {
                bgcolor: '#1a365d',
              },
            }}
          >
            Login
          </Button>
        </CardContent>
      </Card>
    </Container>
  );
};

export default Login;