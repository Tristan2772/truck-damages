import { findAllTrucks } from "~/lib/db/queries/trucks";
import defineAuthenticatedEventHandler from "~/utils/define-authenticated-event-handler";

export default defineAuthenticatedEventHandler(async () => {
  return findAllTrucks();
});
