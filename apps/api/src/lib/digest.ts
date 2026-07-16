import { supabase } from './supabase';
import { getResend, getResendFromAddress } from './resend';
import { calculateQueueHealthScores, type QueueHealthScore } from './healthScore';
import { logger } from './logger';

function gradeEmoji(grade: string): string {
  switch (grade) {
    case 'A': return '\u{1F7E2}'; // green
    case 'B': return '\u{1F7E1}'; // yellow
    case 'C': return '\u{1F7E0}'; // orange
    case 'D': case 'F': return '\u{1F534}'; // red
    default: return '\u26AA';
  }
}

function buildDigestHtml(scores: QueueHealthScore[], projectName: string): string {
  const rows = scores.map((s) => `
    <tr>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;font-family:monospace">${s.queueName}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${gradeEmoji(s.grade)} ${s.grade}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${(s.failureRate * 100).toFixed(1)}%</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${s.avgDurationMs ? s.avgDurationMs.toFixed(0) + 'ms' : '\u2014'}</td>
      <td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${s.throughput.toLocaleString()}</td>
    </tr>
  `).join('');

  const worstGrade = scores.length > 0 ? scores[0].grade : 'A';
  const statusMessage = worstGrade === 'A' || worstGrade === 'B'
    ? 'All queues are healthy.'
    : `Some queues need attention (${worstGrade} grade or worse).`;

  return `
    <div style="font-family:Inter,Arial,sans-serif;max-width:600px;margin:0 auto">
      <h2 style="color:#059669">Daily Queue Health Report</h2>
      <p style="color:#666">${projectName} &mdash; ${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      <p style="color:#333;font-weight:500">${statusMessage}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <thead>
          <tr style="background:#f8f9fa">
            <th style="padding:8px 12px;text-align:left;font-size:12px;color:#666">Queue</th>
            <th style="padding:8px 12px;text-align:center;font-size:12px;color:#666">Grade</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666">Fail Rate</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666">Avg Duration</th>
            <th style="padding:8px 12px;text-align:right;font-size:12px;color:#666">Events (24h)</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
      <p style="color:#999;font-size:12px">Sent by QCanary &mdash; <a href="https://qcanary.dev">qcanary.dev</a></p>
    </div>
  `;
}

export async function sendDailyDigest(): Promise<{ sent: number; errors: number }> {
  const resend = getResend();
  if (!resend) {
    logger.warn('Resend not configured — skipping digest');
    return { sent: 0, errors: 0 };
  }

  const fromAddress = getResendFromAddress();
  let sent = 0;
  let errors = 0;

  // Get all projects with team members who have digest enabled
  const { data: teams, error: teamsError } = await supabase
    .from('teams')
    .select('id, name');

  if (teamsError || !teams) {
    logger.error({ err: teamsError }, 'Failed to load teams for digest');
    return { sent: 0, errors: 1 };
  }

  const typedTeams = teams as Array<{ id: string; name: string }>;

  for (const team of typedTeams) {
    try {
      const { data: projects } = await supabase
        .from('projects')
        .select('id, name')
        .eq('team_id', team.id);

      if (!projects || projects.length === 0) continue;

      const typedProjects = projects as Array<{ id: string; name: string }>;

      for (const project of typedProjects) {
        const scores = await calculateQueueHealthScores(project.id);
        if (scores.length === 0) continue;

        const html = buildDigestHtml(scores, project.name);

        // TODO: Get team member emails from Clerk
        // For now, send to team notification email
        const { error: emailError } = await resend.emails.send({
          from: fromAddress,
          to: fromAddress, // Replace with actual team member emails
          subject: `[QCanary] Daily health report — ${project.name}`,
          html,
        });

        if (emailError) {
          logger.error({ err: emailError, projectId: project.id }, 'Failed to send digest email');
          errors++;
        } else {
          sent++;
        }
      }
    } catch (err) {
      logger.error({ err, teamId: team.id }, 'Failed to generate digest for team');
      errors++;
    }
  }

  return { sent, errors };
}
