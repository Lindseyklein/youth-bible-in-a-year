import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface DailyReading {
  week_number: number;
  day_number: number;
  title: string;
  scripture_references: string[];
  redemption_story: string | null;
}

interface WeeklyStudy {
  week_number: number;
  title: string;
  theme: string;
  discussion_questions: any[];
}

interface WeeklyChallenge {
  week_number: number;
  challenge_text: string;
  challenge_type: string;
}

function cleanText(text: string): string {
  if (!text) return "";
  return text
    .replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, "")
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/[\u2026]/g, "...")
    .normalize("NFKD")
    .replace(/[^\x00-\x7F]/g, "");
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );

    const { data: weeklyStudies, error: weekError } = await supabase
      .from("weekly_studies")
      .select("week_number, title, theme, discussion_questions")
      .order("week_number");

    const { data: dailyReadings, error: readError } = await supabase
      .from("daily_readings")
      .select("week_number, day_number, title, scripture_references, redemption_story")
      .order("week_number, day_number");

    const { data: weeklyChallenges } = await supabase
      .from("weekly_challenges")
      .select("week_number, challenge_text, challenge_type")
      .order("week_number");

    if (weekError || readError || !weeklyStudies || !dailyReadings) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch data", details: weekError || readError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const htmlContent = generateHTMLPlan(weeklyStudies, dailyReadings, weeklyChallenges || []);

    return new Response(htmlContent, {
      status: 200,
      headers: {
        ...corsHeaders,
        "Content-Type": "text/html",
        "Content-Disposition": 'inline; filename="reading-plan.html"',
      },
    });
  } catch (error) {
    console.error("PDF generation error:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate PDF", details: String(error) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});

function generateHTMLPlan(
  weeklyStudies: WeeklyStudy[],
  dailyReadings: DailyReading[],
  weeklyChallenges: WeeklyChallenge[]
): string {
  let html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Youth Bible In A Year - Complete Reading Plan</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
    h1 { text-align: center; color: #2c3e50; }
    h2 { color: #34495e; border-bottom: 2px solid #3498db; padding-bottom: 5px; margin-top: 30px; }
    h3 { color: #7f8c8d; }
    .week { page-break-after: always; margin-bottom: 40px; }
    .theme { font-style: italic; color: #7f8c8d; }
    .challenge { background: #ecf0f1; padding: 15px; border-left: 4px solid #3498db; margin: 15px 0; }
    .reading { margin: 10px 0; padding: 10px; background: #f8f9fa; }
    .scripture { color: #16a085; font-weight: bold; }
    .redemption { font-style: italic; color: #8e44ad; margin-top: 5px; }
    .questions { margin-top: 20px; }
    .questions li { margin: 10px 0; }
    @media print {
      .week { page-break-after: always; }
      body { margin: 20px; }
    }
  </style>
</head>
<body>
  <h1>Youth Bible In A Year</h1>
  <h2 style="text-align: center; border: none;">Complete 52-Week Reading Plan</h2>
  <p style="text-align: center;">With Daily Readings, Redemption Stories & Weekly Challenges</p>

  <div style="margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 5px;">
    <p>This reading plan takes you through the Bible chronologically over one year. Each week includes 7 daily readings with scripture references, redemption stories showing God's plan of salvation, weekly challenges to put faith into action, and discussion questions to deepen your understanding and encourage group conversation.</p>
  </div>
`;

  for (const week of weeklyStudies as WeeklyStudy[]) {
    const title = cleanText(week.title || "Untitled");
    const theme = cleanText(week.theme || "No theme");

    html += `
  <div class="week">
    <h2>Week ${week.week_number}: ${title}</h2>
    <p class="theme">Theme: ${theme}</p>
`;

    const weekChallenge = weeklyChallenges?.find((c) => c.week_number === week.week_number);
    if (weekChallenge?.challenge_text) {
      html += `
    <div class="challenge">
      <strong>Challenge of the Week:</strong><br>
      ${cleanText(weekChallenge.challenge_text)}
    </div>
`;
    }

    html += `    <h3>Daily Readings:</h3>\n`;

    const weekReadings = dailyReadings.filter((r) => r.week_number === week.week_number);
    for (const reading of weekReadings) {
      const readingTitle = cleanText(reading.title || "Untitled");
      html += `
    <div class="reading">
      <strong>Day ${reading.day_number}: ${readingTitle}</strong><br>
      <span class="scripture">${
        Array.isArray(reading.scripture_references)
          ? reading.scripture_references.join(", ")
          : ""
      }</span>
`;

      if (reading.redemption_story) {
        html += `
      <div class="redemption">Redemption Story: ${cleanText(reading.redemption_story)}</div>
`;
      }

      html += `    </div>\n`;
    }

    if (week.discussion_questions && Array.isArray(week.discussion_questions) && week.discussion_questions.length > 0) {
      html += `
    <div class="questions">
      <h3>Weekly Discussion Questions:</h3>
      <ol>
`;
      week.discussion_questions.forEach((q: any) => {
        const questionText = typeof q === "string" ? q : q.question || q.text || "";
        if (questionText) {
          html += `        <li>${cleanText(questionText)}</li>\n`;
        }
      });
      html += `      </ol>\n    </div>\n`;
    }

    html += `  </div>\n`;
  }

  html += `
  <div style="margin-top: 40px; padding: 20px; background: #ecf0f1; border-radius: 5px;">
    <h2>About This Plan</h2>
    <p>Youth Bible In A Year is designed to help Christian teens engage with Scripture in a structured, chronological way. This reading plan guides you through the entire Bible over 52 weeks, with daily readings and weekly discussion questions perfect for youth groups, small groups, or personal study.</p>
    <p><strong>For more resources and to access the mobile app, visit youthbibleinayear.com</strong></p>
  </div>
</body>
</html>`;

  return html;
}
