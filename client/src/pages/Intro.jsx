import React from 'react';
import { Box, Container, Card, Typography, Stack, Button } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';

// Define a custom theme with a nice color palette
const theme = createTheme({
  palette: {
    primary: {
      main: '#6200EA', // Deep Purple
    },
    secondary: {
      main: '#00BFA5', // Teal
    },
    background: {
      default: 'linear-gradient(135deg, #F5F5F5 0%, #E0E0E0 100%)', // Gradient background
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 700,
    },
    h6: {
      fontWeight: 500,
    },
  },
});

const Intro = () => {
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="md">
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            maxHeight: '100vh',
            bgcolor: 'background.default',
            py: 5,
          }}
        >
          <Card
            sx={{
              p: 4,
              boxShadow: 3,
              borderRadius: 2,
              bgcolor: 'white',
              maxWidth: '400px',
              width: '100%',

            }}
          >
            <Typography variant="h4" component="h1" gutterBottom>
              Welcome to BuzzMeet
            </Typography>
            <Typography variant="body1" color="text.secondary" mb={4}>
              Your ultimate platform for hosting and joining meetings effortlessly.
            </Typography>
            <Stack spacing={2} direction="column" alignItems="center">
              <Button variant="contained" color="primary" fullWidth>
                Host a meeting
              </Button>
              <Button variant="outlined" color="secondary" fullWidth>
                Join a meeting
              </Button>
            </Stack>
          </Card>
        </Box>
      </Container>
    </ThemeProvider>
  );
};

export default Intro;
