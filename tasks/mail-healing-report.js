import { filterSubjectInTriples } from '../lib/utils';
import { isTask, updateTaskStatus, loadTask } from '../lib/task';
import { loadJob } from '../lib/job';
import { sparqlEscapeUri } from 'mu';
import { querySudo as query } from '@lblod/mu-auth-sudo';
import { createWarningEmail } from '../lib/queries';
import {
  PREFIXES,
  STATUS_BUSY,
  STATUS_FAILED,
  STATUS_SUCCESS,
  STATUS_SCHEDULED,
  STATUS_PREDICATE,
  REPORT_GENERATION_TASK_OPERATION
} from '../lib/constants';

export async function run(triples){
  const reportGenerationTasks = filterSubjectInTriples(triples, STATUS_PREDICATE, STATUS_SCHEDULED);
  for(const taskSubject of reportGenerationTasks){
    if(await isTask(taskSubject)){
      await processReportTask(taskSubject);
    }
  }
}

async function processReportTask(taskSubject){
  const task = await loadTask(taskSubject);

  if(task.operation == REPORT_GENERATION_TASK_OPERATION){
    try {
      await updateTaskStatus(task, STATUS_BUSY);

      for(const container of task.inputContainers){
        const hasReport = await hasInputContainerReport(container);
        if(hasReport){
          const job = await loadJob(task.job);
          const emailContent = generateEmailContent(task.task, job.operation);
          await createWarningEmail(emailContent.subject, emailContent);
        }
      }

      await updateTaskStatus(task, STATUS_SUCCESS);

    }
    catch(error){
      console.error(`Error processing task: ${taskSubject}`);
      console.error(error);
      await updateTaskStatus(task, STATUS_FAILED);
    }
  }
}

async function hasInputContainerReport(containerUri){
  const queryStr = `
     ${PREFIXES}
     ASK {
       ${sparqlEscapeUri(containerUri)} task:hasFile ?report
     }
  `;
  const result = await query(queryStr);
  return result.boolean;
}

function generateEmailContent(taskUri, jobOperationUri) {
  return {
    subject: `Delta healing report for ${jobOperationUri}`,
    text: `
      Hello,

      Deltas have been healed in task ${taskUri}, you might want to check it in the jobs dashboard.

      Have a nice day,
      Redpencil.io
    `,
    html: `
      <p>Hello,</p>

      <p>Deltas have been healed in task ${taskUri}, you might want to check it in the jobs dashboard.</p>

      <p>Have a nice day,</p>
      <p>Redpencil.io</p>
    `
  };
};
