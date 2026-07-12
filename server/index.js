import app from './app.js';

const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(`Express API Server running on port ${PORT}`);
});
