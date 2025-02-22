const Intro = () => {
  return <Container>
    <Box sx={{ color:pink, width: 1, height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>

        <Card>
            <Typography variant="h3" component="h1" sx={{ color: 'white' }}>
                Welcome to Video Chat App
            </Typography>
        </Card>

    </Box>

  </Container>;
}

export default Intro;