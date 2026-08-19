import { Navigate } from "react-router";
import { automationWorkflowsPath } from "#/manifests/automation-interface";

/** Legacy `/workflows` bookmark → the Automate Workflows tab. */
export default function WorkflowsRedirect() {
  return <Navigate to={automationWorkflowsPath()} replace />;
}
