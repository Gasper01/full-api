import App from './src/app';
const port = process.env.PORT || 3000;

App.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});
