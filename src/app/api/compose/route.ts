import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { composeInputSchema, composeOutputSchema } from "@/lib/schemas/compose";
import { SOURCE_2_SYSTEM_PROMPT } from "@/lib/prompts/source2";

export async function POST(request: Request) {
  try {
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: "ANTHROPIC_API_KEY is not configured" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const parsed = composeInputSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid input", details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { visual_description, selected_pillar } = parsed.data;

    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: SOURCE_2_SYSTEM_PROMPT,
      messages: [
        {
          role: "user",
          content: `{Visual_Description}: ${visual_description}\n{Selected_Pillar}: ${selected_pillar}`,
        },
      ],
    });

    const textBlock = message.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") {
      return NextResponse.json(
        { error: "No text response from AI" },
        { status: 502 }
      );
    }

    let rawJson = textBlock.text.trim();
    if (rawJson.startsWith("```")) {
      rawJson = rawJson.replace(/^```(?:json)?\n?/, "").replace(/\n?```$/, "");
    }

    const jsonData = JSON.parse(rawJson);

    const validated = composeOutputSchema.safeParse(jsonData);
    if (!validated.success) {
      console.warn(
        "[Compose] Output validation warnings:",
        validated.error.flatten()
      );
      return NextResponse.json({
        data: jsonData,
        _validation_warnings: validated.error.flatten().fieldErrors,
      });
    }

    return NextResponse.json({ data: validated.data });
  } catch (error) {
    console.error("[Compose] Error:", error);

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Failed to parse AI response as JSON" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
