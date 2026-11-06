# Interview answers

## 1. Server and client boundary

I use Server Components when a component just renders data into markup, and Client Components when it needs interactivity, state, or browser events. In a CRM screen, the company table is a perfect Server Component because it purely displays data. Conversely, the detail drawer and filter controls need to be Client Components to handle form inputs and dialog focus. I draw the boundary just outside the table, letting the server pass the rows down to the interactive client pieces. This keeps the static rendering fast and the interactive JavaScript bundles small.

## 2. Server fetch into TanStack Query

I fetch data on the server for the initial page load so users get an immediate, shareable view of the data. For subsequent interactions like sorting or pagination, I let TanStack Query handle fetching on the client. To prevent double-fetching, I dehydrate the server's `QueryClient` state and pass it into a `HydrationBoundary` on the client. This allows `useQuery` to seamlessly pick up the server-fetched data without making a redundant request. However, this pattern requires the server to have access to the user's session, typically via cookies.

## 3. 409 Conflict

When a 409 Conflict occurs, I preserve the user's current inputs and display a banner warning them that someone else modified the record. I include a button to fetch the latest version so they can review the changes. Clicking it updates the TanStack Query detail cache and the form's internal version ID to ensure the user's next save succeeds. I also try to display the conflicting data side-by-side with the user's draft to make the collision visually clear. The main list cache remains untouched to prevent the underlying table from abruptly flashing.

## 4. Filter, sort, and page state

I store filter, sort, and pagination state directly in the URL query string so the page can be easily refreshed and respects the browser's Back button. Actions like clicking a page use `router.push`, while typing in the search box uses a debounced `router.replace` to avoid spamming the history. The TanStack Query key is derived directly from these URL parameters, ensuring the cache always perfectly matches the address bar. The only local React state is the user's in-progress typing in the search box, which syncs to the URL once they pause.

## 5. Access token

I attach the access token dynamically inside the shared API client just before the request fires, so individual components don't have to manage headers. If a token expires mid-session, a route handler attempts to silently refresh it via an `httpOnly` cookie before retrying the call. If it fails and returns a 401, I clear the session and redirect the user to the sign-in page. Crucially, the token must never end up in the URL, server logs, TanStack query keys, or the server-rendered HTML. It should also be kept out of `localStorage` to protect against XSS attacks.

## 6. Loading, error, and empty

I use Next.js `loading.tsx` and `error.tsx` to handle page-level loading and hard rendering failures while keeping the app shell intact. Inside the page, I wrap the data table in a React Suspense boundary, but leave the search and filters outside so they remain usable while data loads. The detail drawer operates independently outside this boundary, managing its own loading and error states so a slow detail fetch doesn't replace the main table with a skeleton. Finally, an empty list isn't an error; it's a successful fetch that simply renders a helpful "no results" message inside the table structure.

## 7. Dutch and English

I manage translations by putting the locale in the URL path (like `/en` or `/nl`) and loading the corresponding dictionary on the server. The Server Components then pass only the necessary translated strings to the Client Components as props. This ensures a Dutch user's browser isn't forced to download English translation files in its JavaScript bundle. I also use the standard `Intl` API on both the client and server to format dates and numbers consistently based on that active locale. Toggling the language simply navigates to the new URL prefix while keeping the query string intact.

## 8. Calling a page slow

Before calling a page slow, I measure the Time to First Byte (TTFB), how long it takes for the first data row to render, and the total JavaScript bundle size. The biggest performance killer is usually a network waterfall, where the client has to download the document, hydrate, and then make sequential API calls. To fix a slow, data-heavy page, I would first move the initial data fetch into a Server Component so the rows arrive in the initial HTML. I would also wrap the data table in a React Suspense boundary to progressively stream the UI to the user.

## 9. Testing the companies feature

I use unit tests for complex background logic like parsing query strings, sorting data, and mapping HTTP errors. I use component tests with mocked API clients to quickly verify that the UI renders correctly and handles states like a 409 conflict gracefully. I reserve end-to-end browser tests for things that virtual DOMs handle poorly, such as dialog focus traps and browser history navigation. I also use E2E to run at least one real network request against the actual route handlers to ensure the frontend and backend are communicating properly. This tiered approach keeps the test suite fast while covering all critical behaviors.
