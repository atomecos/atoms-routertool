import { ToolsetsDefined } from "atomservicescore";
import { AtomsRouterToolFactory } from "./lib";

export { Route, Router } from "./lib";

module.exports = {
  toolsets: "AtomsRouterTool",
  asset: AtomsRouterToolFactory,
  as: "factory"
} as ToolsetsDefined;
