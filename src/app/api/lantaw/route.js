import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.NEXT_SERVICE_ROLE_KEY
const GEMINI_API_KEY = process.env.GEMINI_LANTAW_AI
const PRIMARY_MODEL = process.env.GEMINI_LANTAW_MODEL || 'gemini-3.5-flash'
const BACKUP_MODEL = process.env.GEMINI_LANTAW_BACKUP_MODEL || 'gemini-2.5-flash'

// Initialize Supabase with service role for backend access
const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// --- LantawThinking: Guardrails ---
function getGuardrails() {
    return (
        "\n\n--- STRICT DOMAIN RESTRICTIONS & GUARDRAILS ---\n" +
        "1. NO WEB SEARCHING: You do not have internet access. You cannot browse the web to fetch live external data.\n" +
        "2. FACTUAL DATA SOURCING: When answering questions that require specific facts, statistics, or database records, you MUST pull EXCLUSIVELY from the provided 'CONTEXT DATA' (Inventory, Telemetry, Incidents, etc.). Do not invent or assume any factual data outside of this context.\n" +
        "3. CREATIVE AND GUIDANCE EXCEPTIONS: You ARE fully allowed to use your own internal reasoning and knowledge to generate content such as drafting emails, writing guidance protocols, summarizing information, or providing general disaster management advice, provided you do not pretend to have live external facts.\n" +
        "4. DENIAL OF UNRELATED QUERIES: If the user's query is completely nonsense or blatantly off-topic (e.g., asking about unrelated pop culture or general trivia), politely reject it by stating you are Lantaw AI, a specialized assistant for FloodWatch.\n" +
        "5. NO HALLUCINATIONS: Do not invent database records, sensor readings, or fake incident reports under any circumstances."
    )
}

// --- LantawPrompt: Build the system persona ---
function buildSystemPersona() {
    return (
        "You are Lantaw AI, the intelligent assistant for the FloodWatch Disaster Management Platform. " +
        "Provide accurate, actionable, and concise insights regarding flood monitoring, weather data, and safety protocols. " +
        "Do not use conversational filler. Be direct and strictly professional."
    )
}

// --- LantawFormatting: Formatting rules ---
function getFormattingRules() {
    return (
        "\n\n--- FORMAT INSTRUCTIONS ---\n" +
        "Format your response using clean Markdown. Use headings (##, ###) to separate sections, bullet points for lists, and bold text (**text**) for emphasis. Keep paragraphs short, structured, and easy to read."
    )
}

// --- LantawTableFormatting: Chart/Table instructions ---
function getChartInstructions() {
    return (
        "\n\n--- VISUALIZATION FORMAT INSTRUCTIONS ---\n" +
        "If the user requests data visualization, charts, or graphs, you MUST return a RAW JSON object. " +
        "Do NOT include markdown formatting, markdown code blocks, or conversational text.\n\n" +
        "You are RESTRICTED to ONLY the following chart types: 'bar', 'area', or 'pie'.\n\n" +
        "The JSON must strictly follow this structure:\n" +
        '{ "visualization": "chart", "type": "<chart_type>", "title": "<Chart Title>", "description": "<Brief description>", ' +
        '"chart_config": { "<dataKey>": { "label": "<Label>", "color": "hsl(var(--chart-1))" } }, ' +
        '"chart_data": [ { "label": "Category 1", "<dataKey>": 150 } ] }\n'
    )
}

// --- LantawSources: Fetch all context data ---
async function getAllContextData() {
    const results = {}

    try {
        const [inventory, weather, incidents, airQuality, distress, utilities] = await Promise.all([
            supabaseAdmin.from('pdrrmo_inventory').select('*').limit(15),
            supabaseAdmin.from('weather_telemetry').select('*').order('fetched_at', { ascending: false }).limit(10),
            supabaseAdmin.from('incident_report').select('*').order('created_at', { ascending: false }).limit(10),
            supabaseAdmin.from('air_quality').select('*').order('recorded_at', { ascending: false }).limit(10),
            supabaseAdmin.from('distress_signals').select('*').order('created_at', { ascending: false }).limit(10),
            supabaseAdmin.from('utilities').select('*').limit(15),
        ])

        results.pdrrmo_inventory_snapshot = inventory.data || []
        results.recent_weather = weather.data || []
        results.recent_incidents = incidents.data || []
        results.recent_air_quality = airQuality.data || []
        results.active_distress_signals = distress.data || []
        results.utilities_snapshot = utilities.data || []
    } catch (err) {
        console.error("Error fetching Lantaw sources:", err)
    }

    return results
}

// --- Gemini API call with backup model fallback ---
async function callGemini(prompt, model) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`

    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 4096,
            }
        })
    })

    if (!response.ok) {
        const errorBody = await response.text()
        throw new Error(`Gemini API error (${model}): ${response.status} - ${errorBody}`)
    }

    const data = await response.json()
    return data?.candidates?.[0]?.content?.parts?.[0]?.text || "I could not generate a response."
}

// --- Main API route handler ---
export async function POST(request) {
    try {
        const { prompt, conversationId, userId } = await request.json()

        if (!prompt || prompt.trim().length < 2) {
            return NextResponse.json({ error: "Prompt is too short." }, { status: 400 })
        }

        // Step 1: LantawThinking — Pre-filter (basic check)
        // Short queries are allowed through, the AI guardrails handle nuanced rejection

        // Step 2: LantawSources — Crawl the database for context
        const contextData = await getAllContextData()
        const contextString = JSON.stringify(contextData, null, 2)

        // Step 3: Build the full prompt using LantawPrompt structure
        const fullPrompt = [
            buildSystemPersona(),
            getGuardrails(),
            `\n--- CONTEXT DATA ---\n${contextString}`,
            getFormattingRules(),
            getChartInstructions(),
            `\n--- USER QUERY ---\n${prompt.trim()}`
        ].join('\n')

        // Step 4: LantawConnect — Call Gemini with primary model, fallback to backup
        let aiResponse
        try {
            aiResponse = await callGemini(fullPrompt, PRIMARY_MODEL)
        } catch (primaryError) {
            console.warn(`Primary model (${PRIMARY_MODEL}) failed, falling back to ${BACKUP_MODEL}:`, primaryError.message)
            try {
                aiResponse = await callGemini(fullPrompt, BACKUP_MODEL)
            } catch (backupError) {
                console.error(`Backup model (${BACKUP_MODEL}) also failed:`, backupError.message)
                return NextResponse.json({ error: "Both AI models are currently unavailable. Please try again later." }, { status: 503 })
            }
        }

        // Step 5: LantawFormatting — Clean the output
        // Remove excessive newlines
        aiResponse = aiResponse.replace(/\n{3,}/g, '\n\n').trim()

        // Step 6: Save the interaction to ai_chatbot_conversation
        if (userId) {
            // Generate a title from the first prompt if this is a new conversation
            let title = prompt.trim().substring(0, 80)
            if (title.length >= 80) title += "..."

            await supabaseAdmin.from('ai_chatbot_conversation').insert({
                user_id: userId,
                user_prompt: prompt.trim(),
                ai_output: aiResponse,
                ai_source: 'FloodWatch Database Context',
                conversation_id: conversationId,
                conversation_title: title,
            })
        }

        return NextResponse.json({ response: aiResponse })
    } catch (err) {
        console.error("Lantaw API Error:", err)
        return NextResponse.json({ error: "An internal error occurred." }, { status: 500 })
    }
}
