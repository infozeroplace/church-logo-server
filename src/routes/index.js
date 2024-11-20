import express from "express";

import { PrivateRoutes } from "./private/index.js";
import { PublicRoutes } from "./public/index.js";
import { SecureRoutes } from "./secure/index.js";
const routes = express.Router();

// Defining an array of module routes to be mounted on the router
const moduleRoutes = [
  {
    path: "/public",
    route: PublicRoutes,
  },
  {
    path: "/secure",
    route: SecureRoutes,
  },
  {
    path: "/private",
    route: PrivateRoutes,
  },
];

// Iterate over the moduleRoutes array and mount each route on the router
moduleRoutes.forEach((route) => routes.use(route?.path, route?.route));

export default routes;
