import Navigo from 'navigo';

const Router = {
  router: null,
  getRouter() {
    if (!this.router) {
      const rootUrl = '/';
      this.router = new Navigo(rootUrl, false)
    }
    return this.router;
  }
};

export default Router;
