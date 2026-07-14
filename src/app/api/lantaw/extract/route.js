import { NextResponse } from 'next/server'
import { writeFile, unlink } from 'fs/promises'
import { join } from 'path'
import { tmpdir } from 'os'
import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

export async function POST(request) {
    let tempFilePath = null;

    try {
        const formData = await request.formData()
        const file = formData.get('file')

        if (!file) {
            return NextResponse.json({ error: "No file uploaded." }, { status: 400 })
        }

        // 1. Save file to temporary directory
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)
        
        // Generate a unique temp file name preserving the original extension
        const originalName = file.name || 'uploaded_file'
        const extension = originalName.includes('.') ? `.${originalName.split('.').pop()}` : ''
        const tempFileName = `lantaw_extract_${Date.now()}_${Math.round(Math.random() * 1000)}${extension}`
        tempFilePath = join(tmpdir(), tempFileName)
        
        await writeFile(tempFilePath, buffer)

        // 2. Execute Python script
        // Path to the Python script relative to the project root
        const scriptPath = join(process.cwd(), 'src', 'lantaw', 'utilities', 'LantawScanandAnalysis.py')
        
        // Use 'python' or 'python3' depending on the environment, assuming 'python' for Windows
        const command = `python "${scriptPath}" "${tempFilePath}"`
        
        const { stdout, stderr } = await execAsync(command)

        if (stderr) {
            console.error("Python stderr (Extraction):", stderr)
        }

        // 3. Parse JSON output
        let result
        try {
            result = JSON.parse(stdout.trim())
        } catch (parseError) {
            console.error("Failed to parse Python output:", stdout)
            return NextResponse.json({ error: "Extraction process failed to return valid JSON." }, { status: 500 })
        }

        // 4. Return result
        if (!result.success) {
             return NextResponse.json({ error: result.error || "Extraction failed." }, { status: 400 })
        }

        return NextResponse.json({ data: result })

    } catch (err) {
        console.error("Lantaw Extract API Error:", err)
        return NextResponse.json({ error: err.message || "An internal error occurred during extraction." }, { status: 500 })
    } finally {
        // 5. Cleanup temporary file
        if (tempFilePath) {
            try {
                await unlink(tempFilePath)
            } catch (cleanupError) {
                console.error("Failed to clean up temp file:", cleanupError)
            }
        }
    }
}
