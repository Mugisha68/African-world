<<<<<<< HEAD
# Africa-to-the-world

## Running the AI trip assistant locally

Africa & The World is a site for exploring African history, culture, and
literature.

The chat sends messages to the Vercel serverless function at `/api/trip-chat`,
which calls Google's Gemini API. The Gemini API key stays on the server and is
never sent to the browser. The chat panel opens automatically whenever the
website starts; visitors can close it and reopen it with the **Ask AI** button.
A static-only server (such as VS Code Live Server) cannot run this API.

1. Install Node.js LTS and create a key in [Google AI Studio](https://aistudio.google.com/apikey).
2. Run `npm run configure:ai` in the project folder and enter your key when
   prompted. The input is hidden, and the script saves it to `.env.local`
   without displaying it. That file is ignored by Git; do not share it.
3. Stop the current server with **Ctrl+C**, then run `npm start`. Open
   `http://127.0.0.1:5500`, select a destination,
   and send a message in **AI Travel Chat**.

The local start command runs the site and its `/api/trip-chat` function
together. You do not need to link a Vercel project to run it locally.

## Deploying

Deploy this project to Vercel and add `GEMINI_API_KEY` in the project's
Production (and Preview, if used) environment variables. Redeploy after
changing environment variables. The deployed site serves the same `/api/trip-chat`
function, so the chat works on the same origin as the site.

The chat is intended for general country background and itinerary ideas. It
does not have live browsing and cannot verify current security advisories,
visas, or immigration document rules. Travelers must confirm those with their
own government's travel advisory and the destination's official embassy or
immigration authority.

For local testing, use `http://127.0.0.1:5500` from `npm start`, not VS Code
Live Server or a `file://` URL; those cannot run the API function.
=======
# African-world
>>>>>>> origin/main
