import type { $Fetch } from "ofetch";

declare function useCsrf(): { csrf: string };

declare module "#app" {
  type NuxtApp = {
    $csrfFetch: $Fetch;
  };
}
