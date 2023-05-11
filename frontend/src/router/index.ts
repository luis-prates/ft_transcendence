import { createWebHistory, createRouter, type RouteRecordNormalized, type RouteRecordRaw } from "vue-router";
import LoginPage from "@/pages/LoginPage.vue";
import HomePage from "@/pages/HomePage.vue";
// import About from "@/views/About.vue";

const routes_login = [
  {
    path: "/:catchAll(.*)",
    name: "login",
    component: LoginPage,
    props: (route: any) => ({ code: route.query.code }),
  },
];

const routes = [
  {
    path: "/",
    name: "home",
    component: HomePage,
  },
  //   {
  //     path: "/about",
  //     name: "About",
  //     component: About,
  //   },
];

const router = createRouter({
  history: createWebHistory(),
  routes: routes,
});

class Router {
  public static ROUTE_LOGIN = routes_login;
  public static ROUTE_ALL = routes;

  public static clearAll() {
    const routes = router.getRoutes();
    routes.forEach((route: RouteRecordNormalized) => {
      if (route.name) router.removeRoute(route.name);
    });
  }

  public static push(path: string) {
    router.push(path);
  }

  public static getRouter() {
    return router;
  }

  public static setRoute(route: RouteRecordRaw[]) {
    Router.clearAll();
    Router.addRoute(route);
  }
  public static addRoute(route: RouteRecordRaw[]) {
    route.forEach((route: RouteRecordRaw) => router.addRoute(route));
  }
}

// const ro = new Router();

// export default router;
export default Router;
