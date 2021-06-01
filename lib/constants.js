export const STATUS_FAILED = 'http://redpencil.data.gift/id/concept/JobStatus/failed';

export const EMAIL_GRAPH = 'http://mu.semte.ch/graphs/system/email';

export const EMAIL_URI_PREFIX = 'http://data.lblod.info/id/emails/';

export const JOB_OPERATION = 'http://lblod.data.gift/id/jobs/concept/JobOperation/downloadUrlWarning';
export const CHECK_FAILED_URL_DOWNLOADS_OPERATION = 'http://lblod.data.gift/id/jobs/concept/JobOperation/checkFailedUrlDownloads';

export const TYPE_PREDICATE = 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type';
export const ERROR_TYPE = 'http://redpencil.data.gift/vocabularies/deltas/Error';
export const STATUS_PREDICATE = 'http://www.w3.org/ns/adms#status';
export const TASK_OPERATION_PREDICATE = 'http://redpencil.data.gift/vocabularies/tasks/operation';
export const REPORT_GENERATION_TASK_OPERATION = 'http://redpencil.data.gift/id/jobs/concept/TaskOperation/deltas/healing/reportGeneration';

export const PREFIXES = `
  PREFIX mu: <http://mu.semte.ch/vocabularies/core/>
  PREFIX task: <http://redpencil.data.gift/vocabularies/tasks/>
  PREFIX oslc: <http://open-services.net/ns/core#>
  PREFIX nmo: <http://www.semanticdesktop.org/ontologies/2007/03/22/nmo#>
`;

export const ERROR_EMAIL_SUBJECT = 'Delta error report';
export const FAILED_JOB_EMAIL_SUBJECT = 'Failed delta job report';
export const REPORT_TASK_EMAIL_SUBJECT = 'Delta healing report';

export const ERROR_EMAIL_CONTENT = function(uri, message) {
  return {
    TEXT: `
      Hello,

      An error related to deltas has happened:
        - Uri: ${uri}
        - Message: "${message}"

      Have a nice day,
      Redpencil.io
    `,
    HTML: `
      <p>Hello,</p>

      <p>
        An error related to deltas has happened:
        <ul>
          <li>Uri: ${uri}</li>
          <li>Message: "${message}"</li>
        </ul>
      </p>

      <p>Have a nice day,</p>
      <p>Redpencil.io</p>
    `
  };
};

export const FAILED_JOB_EMAIL_CONTENT = function(failedJob, error) {
  return {
    TEXT: `
      Hello,

      A job related to deltas has failed:
        - Uri: ${failedJob}
        - Message: "${error}"

      Have a nice day,
      Redpencil.io
    `,
    HTML: `
      <p>Hello,</p>

      <p>
        A job related to deltas has failed:
        <ul>
          <li>Uri: ${failedJob}</li>
          <li>Message: "${error}"</li>
        </ul>
      </p>

      <p>Have a nice day,</p>
      <p>Redpencil.io</p>
    `
  };
};

export const REPORT_TASK_EMAIL_CONTENT = function(task) {
  return {
    TEXT: `
      Hello,

      Deltas have been healed in task ${task}, you might want to check it in the job controller.

      Have a nice day,
      Redpencil.io
    `,
    HTML: `
      <p>Hello,</p>

      <p>Deltas have been healed in task ${task}, you might want to check it in the job controller.</p>

      <p>Have a nice day,</p>
      <p>Redpencil.io</p>
    `
  };
};
