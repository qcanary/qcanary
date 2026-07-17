import { supabase } from './supabase';
import { getResend, getResendFromAddress } from './resend';
import { calculateQueueHealthScores, type QueueHealthScore } from './healthScore';
import { logger } from './logger';

interface QueueSummary {
  queueName: string;
  totalJobs: number;
  completed: number;
  failed: number;
  failureRate: number;
  avgDurationMs: number | null;
  p95DurationMs: number | null;
}

function gradeColor(grade: string): string {
  switch (grade) {
    case 'A': return '#059669';
    case 'B': return '#D97706';
    case 'C': return '#EA580C';
    case 'D': case 'F': return '#DC2626';
    default: return '#6B7280';
  }
}

function buildWeeklyDigestHtml(
  scores: QueueHealthScore[],
  projectName: string,
  totalJobs: number,
  totalFailed: number,
  successRate: number
): string {
  const rows = scores.map((s) => `
    <tr>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;font-family:monospace;font-size:13px">${s.queueName}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:center">
        <span style="display:inline-block;padding:2px 8px;border-radius:12px;font-size:11px;font-weight:600;color:white;background:${gradeColor(s.grade)}">${s.grade}</span>
      </td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px">${(s.failureRate * 100).toFixed(1)}%</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px">${s.avgDurationMs ? s.avgDurationMs.toFixed(0) + 'ms' : '—'}</td>
      <td style="padding:10px 12px;border-bottom:1px solid #eee;text-align:right;font-size:13px">${s.throughput.toLocaleString()}</td>
    </tr>
  `).join('');

  const worstGrade = scores.length > 0 ? scores[0].grade : 'A';
  const statusColor = worstGrade === 'A' || worstGrade === 'B' ? '#059669' : '#DC2626';
  const statusMessage = worstGrade === 'A' || worstGrade === 'B'
    ? 'All queues are healthy this week.'
    : `Some queues need attention (worst grade: ${worstGrade}).`;

  const weekStart = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
  const weekEnd = new Date();

  return `
    <div style="font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;max-width:600px;margin:0 auto;padding:20px">
      <div style="margin-bottom:24px">
        <h1 style="margin:0;font-size:20px;font-weight:600;color:#0A0A0A">Weekly Queue Report</h1>
        <p style="margin:4px 0 0;font-size:13px;color:#6B7280">${projectName} &mdash; ${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} to ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
      </div>

      <!-- Summary cards -->
      <div style="display:flex;gap:12px;margin-bottom:24px">
        <div style="flex:1;padding:16px;background:#F9FAFB;border-radius:8px;text-align:center">
          <div style="font-size:24px;font-weight:700;color:#0A0A0A">${totalJobs.toLocaleString()}</div>
          <div style="font-size:11px;color:#6B7280;margin-top:4px">Total Jobs</div>
        </div>
        <div style="flex:1;padding:16px;background:#F9FAFB;border-radius:8px;text-align:center">
          <div style="font-size:24px;font-weight:700;color:${successRate >= 99 ? '#059669' : successRate >= 95 ? '#D97706' : '#DC2626'}">${successRate.toFixed(1)}%</div>
          <div style="font-size:11px;color:#6B7280;margin-top:4px">Success Rate</div>
        </div>
        <div style="flex:1;padding:16px;background:#F9FAFB;border-radius:8px;text-align:center">
          <div style="font-size:24px;font-weight:700;color:${totalFailed > 0 ? '#DC2626' : '#059669'}">${totalFailed.toLocaleString()}</div>
          <div style="font-size:11px;color:#6B7280;margin-top:4px">Failures</div>
        </div>
      </div>

      <!-- Status message -->
      <div style="padding:12px 16px;background:${statusColor}10;border-left:3px solid ${statusColor};margin-bottom:24px;border-radius:0 4px 4px 0">
        <p style="margin:0;font-size:13px;color:${statusColor};font-weight:500">${statusMessage}</p>
      </div>

      <!-- Queue table -->
      <h2 style="margin:0 0 12px;font-size:14px;font-weight:600;color:#0A0A0A">Queue Performance</h2>
      <table style="width:100%;border-collapse:collapse;border:1px solid #E5E7EB;border-radius:8px;overflow:hidden">
        <thead>
          <tr style="background:#F9FAFB">
            <th style="padding:10px 12px;text-align:left;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px">Queue</th>
            <th style="padding:10px 12px;text-align:center;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px">Grade</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px">Fail Rate</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px">Avg Duration</th>
            <th style="padding:10px 12px;text-align:right;font-size:11px;font-weight:600;color:#6B7280;text-transform:uppercase;letter-spacing:0.5px">Events</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>

      <div style="margin-top:24px;padding-top:16px;border-top:1px solid #E5E7EB;text-align:center">
        <p style="margin:0;font-size:11px;color:#9CA3AF">Sent by <a href="https://qcanary.dev" style="color:#059669;text-decoration:none">QCanary</a> &mdash; Monitor BullMQ without exposing Redis</p>
      </div>
    </div>
  `;
}

export async function sendWeeklyDigest(): Promise<{ sent: number; errors: number }> {
  const resend = getResend();
  if (!resend) {
    logger.warn('Resend not configured — skipping weekly digest');
    return { sent: 0, errors: 0 };
  }

  const fromAddress = getResendFromAddress();
  let sent = 0;
  let errors = 0;

  // Get all teams with their projects
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name');

  if (teamsError || !teams) {
    logger.error({ err: teamsError }, 'Failed to load teams for weekly digest');
    return { sent: 0, errors: 1 };
  }

  const typedTeams = teams as Array<{ id: string; name: string }>;

  for (const team of typedTeams) {
    try {
      // Get team members from Clerk
      const memberEmails = await getTeamMemberEmails(team.id);
      if (memberEmails.length === 0) continue;

      const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('team_id', team.id);

      if (!projects || projects.length === 0) continue;

      const typedProjects = projects as Array<{ id: string; name: string }>;

      for (const project of typedProjects) {
        const scores = await calculateQueueHealthScores(project.id);
        if (scores.length === 0) continue;

        // Calculate summary stats
        let totalJobs = 0;
        let totalFailed = 0;
        for (const score of scores) {
          totalJobs += score.throughput;
          totalFailed += Math.round(score.failureRate * score.throughput);
        }
        const successRate = totalJobs > 0 ? ((totalJobs - totalFailed) / totalJobs) * 100 : 100;

        const html = buildWeeklyDigestHtml(scores, project.name, totalJobs, totalFailed, successRate);

        // Send to all team members
        for (const email of memberEmails) {
          const { error: emailError } = await resend.emails.send({
            from: fromAddress,
            to: email,
            subject: `[QCanary] Weekly report — ${project.name} (${successRate.toFixed(1)}% success)`,
            html,
          });

          if (emailError) {
            logger.error({ err: emailError, projectId: project.id, email }, 'Failed to send weekly digest');
            errors++;
          } else {
            sent++;
          }
        }
      }
    } catch (err) {
      logger.error({ err, teamId: team.id }, 'Failed to generate weekly digest for team');
      errors++;
    }
  }

  return { sent, errors };
}

async function getTeamMemberEmails(teamId: string): Promise<string[]> {
  try {
    // Get Clerk user IDs from team_members table
    const { data: members, error } = await supabase
      .from('team_members' as never)
      .select('user_id')
      .eq('team_id', teamId);

    if (error || !members) return [];

    const userIds = (members as Array<{ user_id: string }>).map(m => m.user_id);
    if (userIds.length === 0) return [];

    // Get emails from Clerk via API
    const clerkSecretKey = process.env.CLERK_SECRET_KEY;
    if (!clerkSecretKey) return [];

    const emails: string[] = [];
    for (const userId of userIds) {
      try {
        const response = await fetch(`https://api.clerk.com/v1/users/${userId}`, {
          headers: {
            'Authorization': `Bearer ${clerkSecretKey}`,
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const user = await response.json() as { email_addresses?: Array<{ email_address: string }> };
          const primaryEmail = user.email_addresses?.[0]?.email_address;
          if (primaryEmail) emails.push(primaryEmail);
        }
      } catch {
        // Skip failed lookups
      }
    }

    return emails;
  } catch {
    return [];
  }
}
