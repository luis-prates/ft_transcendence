import { createWebHistory, createRouter, type RouteRecordNormalized, type RouteRecordRaw } from "vue-router";
import LoginPage from "@/pages/LoginPage.vue";
import HomePage from "@/pages/HomePage.vue";
import PingPongPage from "@/pages/PingPongPage.vue";

const routes_login = [
  {
    path: "/:catchAll(.*)",
    name: "login",
    component: LoginPage,
    props: (route: any) => ({
      token: route.query.token,
      error: route.query.error,
      firstTime: route.query.isFirstTime === "true",
    }),
  },
];

const routes = [
  {
    path: "/lobby",
    name: "Lobby",
    component: HomePage,
  },
  {
    path: "/game",
    name: "Ping Pong Game",
    component: PingPongPage,
    props: (route: any) => ({
      objectId: route.query.objectId,
    }),
  },
  {
    path: "/:catchAll(.*)",
    name: "login",
    component: LoginPage,
    props: (route: any) => ({
      token: route.query.token,
      error: route.query.error,
      firstTime: route.query.isFirstTime === "true",
    }),
  },
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
