const sendJson = (res, statusCode, body) => {
    res.statusCode = statusCode;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Cache-Control", "no-store");
    res.end(JSON.stringify(body));
};

module.exports = async function handler(req, res) {
    if (req.method !== "POST") {
        res.setHeader("Allow", "POST");
        return sendJson(res, 405, { error: "Method not allowed. Use POST." });
    }

    const apiKey = process.env.GROQ_API_KEY;
    if (!apiKey) {
        console.error("GROQ_API_KEY environment variable is not configured.");
        return sendJson(res, 500, {
            error: "The Groq AI API key is not configured on the server."
        });
    }

    let payload;
    try {
        if (typeof req.body === "string") {
            payload = JSON.parse(req.body);
        } else if (req.body && typeof req.body === "object") {
            payload = req.body;
        } else {
            payload = {};
        }
    } catch {
        return sendJson(res, 400, { error: "Invalid JSON in request body." });
    }

    const { message, history = [] } = payload;

    if (typeof message !== "string" || !message.trim()) {
        return sendJson(res, 400, { error: "Message is required." });
    }

    if (message.length > 2000) {
        return sendJson(res, 400, { error: "Message exceeds 2000 characters." });
    }

    const systemPrompt = [
        "You are Afrimax AI, the dedicated Africa & The World educational AI assistant.",
        "Your mission is to help visitors explore African history, culture, literature, and the Africa & The World website.",
        "You have deep knowledge of:",
        "1. Ancient & Medieval Civilizations: Kush (Meroë, Napata, Queen Amanirenas), Aksum, Ancient Egypt/Kemet, Ghana (Wagadou), Mali (Sundiata Keita, Mansa Musa, Timbuktu), Songhai (Askia the Great), Kingdom of Benin, Great Zimbabwe, and Swahili Coast maritime city-states.",
        "2. Systems of Slavery & Resistance: Transatlantic and Indian Ocean slave trades, Maroon societies, the Haitian Revolution (Toussaint Louverture), Queen Nzinga, and global abolition movements.",
        "3. Colonialism & Independence: Berlin Conference 1884, Battle of Adwa, Pan-Africanism (Nkrumah, Du Bois, Garvey), and 20th-century sovereign liberation.",
        "4. Literature & Oral Memory: Griot oral epics (Sundiata), slave narratives (Olaudah Equiano, Frederick Douglass), post-colonial masterpieces (Chinua Achebe, Toni Morrison, Jamaica Kincaid, Ngugi wa Thiong'o, Wole Soyinka, Chimamanda Ngozi Adichie).",
        "5. The Website Features: Home, About Us, History & Timeline, Literature Archive, Documentary Videos, Compare Regions Engine, Trip Planner across 54 African countries, Visual Gallery, and Contact/Support.",
        "IMPORTANT LAYOUT DESIGN RULE: Do NOT use table format or markdown tables (| col | col |) in your responses under any circumstances. Never output ASCII tables or tabular grids. Instead, always present your responses in an elegant, beautifully organized layout using clear markdown headings (### Section Title), well-spaced bullet points (• Point) with bold lead-ins, clean paragraphs, and highlighted summary lists. Be welcoming, articulate, historically accurate, respectful, and concise."
    ].join(" ");

    const messages = [
        { role: "system", content: systemPrompt },
        ...history.slice(-8).map((turn) => ({
            role: turn.role === "user" ? "user" : "assistant",
            content: turn.text || turn.content || ""
        })),
        { role: "user", content: message.trim() }
    ];

    try {
        const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "openai/gpt-oss-120b",
                messages,
                temperature: 0.6,
                max_tokens: 800
            }),
            signal: AbortSignal.timeout(20000)
        });

        if (!groqResponse.ok) {
            const errorText = await groqResponse.text().catch(() => "");
            console.error(`Groq API returned HTTP ${groqResponse.status}:`, errorText);
            return sendJson(res, 502, {
                error: `Groq AI service returned status ${groqResponse.status}. Please try again shortly.`
            });
        }

        const data = await groqResponse.json();
        const reply = data.choices?.[0]?.message?.content?.trim();

        if (!reply) {
            return sendJson(res, 502, {
                error: "Groq AI returned an empty response. Please try again."
            });
        }

        return sendJson(res, 200, { reply });
    } catch (error) {
        console.error("Groq chat request error:", error);
        return sendJson(res, 502, {
            error: error instanceof Error ? error.message : "Failed to connect to Groq AI."
        });
    }
};
