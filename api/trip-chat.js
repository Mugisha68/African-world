const ALLOWED_COUNTRIES = new Set([
    "Algeria",
    "Angola",
    "Benin",
    "Botswana",
    "Burkina Faso",
    "Burundi",
    "Cabo Verde",
    "Cameroon",
    "Central African Republic",
    "Chad",
    "Comoros",
    "Republic of the Congo",
    "Côte d'Ivoire",
    "Democratic Republic of the Congo",
    "Djibouti",
    "Egypt",
    "Equatorial Guinea",
    "Eritrea",
    "Eswatini",
    "Ethiopia",
    "Gabon",
    "The Gambia",
    "Ghana",
    "Guinea",
    "Guinea-Bissau",
    "Kenya",
    "Lesotho",
    "Liberia",
    "Libya",
    "Madagascar",
    "Malawi",
    "Mali",
    "Mauritania",
    "Mauritius",
    "Morocco",
    "Mozambique",
    "Namibia",
    "Niger",
    "Nigeria",
    "Rwanda",
    "São Tomé and Príncipe",
    "Senegal",
    "Seychelles",
    "Sierra Leone",
    "Somalia",
    "South Africa",
    "South Sudan",
    "Sudan",
    "Tanzania",
    "Togo",
    "Tunisia",
    "Uganda",
    "Zambia",
    "Zimbabwe"
]);

const ALLOWED_INTERESTS = new Set([
    "history and heritage",
    "culture and food",
    "nature and wildlife",
    "coast and relaxation"
]);

const MAX_REQUEST_BYTES = 12_000;
const MAX_HISTORY_ITEMS = 8;
const MAX_HISTORY_TEXT_LENGTH = 1_500;
const MAX_MESSAGE_LENGTH = 1_500;

function sendJson(res, status, body) {
    res.status(status);
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.send(JSON.stringify(body));
}

function isSameOrigin(req) {
    const origin = req.headers.origin;
    const forwardedHost = req.headers["x-forwarded-host"];
    const requestHost = (
        Array.isArray(forwardedHost) ? forwardedHost[0] : forwardedHost
    )?.split(",")[0]?.trim() || req.headers.host;

    if (typeof origin !== "string" || !requestHost) {
        return false;
    }

    try {
        return new URL(origin).host === requestHost;
    } catch {
        return false;
    }
}

function validHistory(history) {
    return Array.isArray(history) &&
        history.length <= MAX_HISTORY_ITEMS &&
        history.every((turn) =>
            turn &&
            typeof turn === "object" &&
            ["user", "model"].includes(turn.role) &&
            typeof turn.text === "string" &&
            turn.text.trim().length > 0 &&
            turn.text.length <= MAX_HISTORY_TEXT_LENGTH
        );
}

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendJson(res, 405, { error: "Use POST to send a chat message." });
    }

    if (!isSameOrigin(req)) {
        return sendJson(res, 403, { error: "This request is not allowed." });
    }

    if (
        typeof req.headers["content-type"] !== "string" ||
        !req.headers["content-type"].toLowerCase().startsWith("application/json")
    ) {
        return sendJson(res, 415, { error: "Send a JSON request." });
    }

    if (!process.env.GEMINI_API_KEY) {
        console.error("GEMINI_API_KEY is not configured.");
        return sendJson(res, 503, {
            error: "The travel assistant is not configured. Run npm run configure:ai with a Gemini API key, then restart npm start."
        });
    }

    let body = req.body;

    if (typeof body === "string") {
        if (Buffer.byteLength(body, "utf8") > MAX_REQUEST_BYTES) {
            return sendJson(res, 413, { error: "Your message is too large." });
        }

        try {
            body = JSON.parse(body);
        } catch {
            return sendJson(res, 400, { error: "The request JSON is invalid." });
        }
    } else if (body && typeof body === "object") {
        if (Buffer.byteLength(JSON.stringify(body), "utf8") > MAX_REQUEST_BYTES) {
            return sendJson(res, 413, { error: "Your message is too large." });
        }
    }

    if (!body || typeof body !== "object" || Array.isArray(body)) {
        return sendJson(res, 400, { error: "The request body is invalid." });
    }

    const { message, country, durationDays, interest, history } = body;

    if (
        typeof message !== "string" ||
        !message.trim() ||
        message.length > MAX_MESSAGE_LENGTH ||
        typeof country !== "string" ||
        !ALLOWED_COUNTRIES.has(country) ||
        !Number.isInteger(durationDays) ||
        durationDays < 1 ||
        durationDays > 30 ||
        typeof interest !== "string" ||
        !ALLOWED_INTERESTS.has(interest) ||
        !validHistory(history)
    ) {
        return sendJson(res, 400, {
            error: "Check your message and trip selections, then try again."
        });
    }

    const systemInstruction = [
        "You are a helpful travel-planning assistant for an educational Africa history website.",
        "Be concise, respectful, practical, and sensitive to local context.",
        `The visitor is planning a ${durationDays}-day trip to ${country} focused on ${interest}.`,
        "Help with itinerary ideas, historical and cultural context, packing considerations, and questions to ask local guides.",
        "You do not have live web access in this request. Never claim to know or have verified the current security situation, advisories, visa rules, immigration documents, health requirements, transport disruptions, opening hours, or prices.",
        "For security advice, direct the visitor to their own government's current travel advisory and the destination's official authorities.",
        "For visas and entry documents, explain that requirements depend on passport nationality and travel dates; direct them to the destination's embassy, immigration authority, and airline.",
        "Clearly distinguish general background knowledge from information the visitor must verify. Never present guesses as current facts."
    ].join(" ");

    const contents = [
        ...history.map((turn) => ({
            role: turn.role,
            parts: [{ text: turn.text }]
        })),
        {
            role: "user",
            parts: [{ text: message.trim() }]
        }
    ];

    let geminiResponse;

    try {
        geminiResponse = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-goog-api-key": process.env.GEMINI_API_KEY
                },
                body: JSON.stringify({
                    systemInstruction: {
                        parts: [{ text: systemInstruction }]
                    },
                    contents,
                    generationConfig: {
                        maxOutputTokens: 700,
                        temperature: 0.5
                    }
                }),
                signal: AbortSignal.timeout(25_000)
            }
        );
    } catch (error) {
        console.error("Gemini request failed.", error);
        return sendJson(res, 502, {
            error: "The travel assistant could not connect. Please try again."
        });
    }

    if (!geminiResponse.ok) {
        console.error(
            `Gemini returned HTTP ${geminiResponse.status}.`
        );
        return sendJson(res, 502, {
            error: "The travel assistant is temporarily unavailable. Please try again."
        });
    }

    let geminiData;

    try {
        geminiData = await geminiResponse.json();
    } catch (error) {
        console.error("Gemini returned invalid JSON.", error);
        return sendJson(res, 502, {
            error: "The travel assistant returned an invalid response. Please try again."
        });
    }

    const reply = geminiData.candidates?.[0]?.content?.parts
        ?.map((part) => part.text)
        .filter((text) => typeof text === "string")
        .join("")
        .trim();

    if (!reply) {
        console.error("Gemini response did not contain a text reply.");
        return sendJson(res, 502, {
            error: "The travel assistant couldn't create a reply. Please try again."
        });
    }

    return sendJson(res, 200, { reply });
};
