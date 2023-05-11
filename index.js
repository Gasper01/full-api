import App from './src/app';
const port = process.env.PORT || 400;

App.listen(port, () => {
  console.log(`Server listen on port ${port}`);
});
