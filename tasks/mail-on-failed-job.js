import { filterSubjectInTriples } from '../lib/utils';
import { createWarningEmail } from '../lib/queries';
import { STATUS_PREDICATE, STATUS_FAILED } from '../lib/constants';
import { loadJob } from '../lib/job';
import jsonConfig from '/config/config.json';

//Job controller doesn't inform us on failed jobs, hence custom code here.
export async function run(triples){
  const failures = filterSubjectInTriples(triples, STATUS_PREDICATE, STATUS_FAILED);
  for(const failure of failures){
    const job = await loadJob(failure);
    if(job && jsonConfig.monitoredJobTypes.find(t => t == job.operation)){
      const emailContent = generateEmailContent(job.job, job.operation);
      await createWarningEmail(emailContent.subject, emailContent);
    }
  }
}

function generateEmailContent(jobUri, jobOperation) {
  return {
    subject: `Job in the delta-producer process ${jobOperation} failed`,
    text: `
      Hello,

      Information about the job:
        - job: ${jobUri}
        - operation: ${jobOperation}

      Have a nice day,
      Redpencil.io
    `,
    html: `
      <p>Hello,</p>

      <p>
        Information about the job::
        <ul>
          <li>job: ${jobUri}</li>
          <li>operation: ${jobOperation}</li>
        </ul>
      </p>

      <p>Have a nice day,</p>
      <p>Redpencil.io</p>
    `
  };
};
