import { app, errorHandler } from 'mu';
import flatten from 'lodash.flatten';
import bodyParser from 'body-parser';
import jsonConfig from '/config/config.json';
import {
  ERROR_EMAIL_SUBJECT,
  ERROR_EMAIL_CONTENT,
  FAILED_JOB_EMAIL_SUBJECT,
  FAILED_JOB_EMAIL_CONTENT,
  REPORT_TASK_EMAIL_SUBJECT,
  REPORT_TASK_EMAIL_CONTENT,
  TYPE_PREFIX,
  ERROR_TYPE,
  STATUS_PREFIX,
  STATUS_FAILED,
  TASK_OPERATION_PREFIX,
  REPORT_GENERATION_TASK_OPERATION
} from './lib/constants';
import {
  getMessage,
  getJobInformation,
  getInputContainers,
  createWarningEmail
} from './lib/queries';

app.use(bodyParser.json({ type: function(req) { return /^application\/json/.test( req.get('content-type') ); } }));

app.get('/', function( req, res ) {
  res.send('Hello from delta-producer-report-generator :)');
} );

app.post('/delta', async function( req, res ) {
  const delta = req.body;
  const inserts = flatten(delta.map(changeSet => changeSet.inserts));

  const error = filterSubjectInTriples(inserts, TYPE_PREFIX, ERROR_TYPE);
  const failedJob = filterSubjectInTriples(inserts, STATUS_PREFIX, STATUS_FAILED);
  const reportGenerationTask = filterSubjectInTriples(inserts, TASK_OPERATION_PREFIX, REPORT_GENERATION_TASK_OPERATION);

  if (error) {
    const message = await getMessage(error);
    await createWarningEmail(ERROR_EMAIL_SUBJECT, ERROR_EMAIL_CONTENT(error, message));
    console.log(`Email for error ${error} created`);
    res.send({message: `Email for error ${error} created`});
  } else if (failedJob) {
    const { type, error } = await getJobInformation(failedJob);
    if (jsonConfig.monitoredJobTypes.find(t => t == type)) {
      await createWarningEmail(FAILED_JOB_EMAIL_SUBJECT, FAILED_JOB_EMAIL_CONTENT(failedJob, error));
      console.log("Email for failed job created");
      res.send({message: `Email for failed job created`});
    } else {
      console.log(`Job operation ${type} of job ${failedJob} is not monitored, skipping.`);
      res.status(204).send();
    }
  } else if (reportGenerationTask) {
    const inputContainers = await getInputContainers(reportGenerationTask);
    //if (inputContainers && inputContainers.length) {
      await createWarningEmail(REPORT_TASK_EMAIL_SUBJECT, REPORT_TASK_EMAIL_CONTENT(reportGenerationTask));
      console.log("Email for report generation created");
      res.send({message: `Email for report generation created`});
    //} else {
    //  console.log(`Report generation task ${reportGenerationTask} doesn't have input containers, skipping.`);
    //  res.status(204).send();
    //}

  } else {
    console.log('Incoming deltas do not contain anything to be reported, skipping.');
    res.status(204).send();
  }
});

app.use(errorHandler);

// -------------------- Internal logic ----------------------------

function filterSubjectInTriples(triples, predicate, object) {
  const subjects = triples.filter( triple => {
    return triple.predicate.type == 'uri'
      && triple.predicate.value == predicate
      && triple.object.type == 'uri'
      && triple.object.value == object;
  }).map(triple => triple.subject.value);

  return subjects.length ? subjects[0] : null;  // assume max one per deltas
}
