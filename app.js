import { app, errorHandler } from 'mu';
import flatten from 'lodash.flatten';
import bodyParser from 'body-parser';
import sendErrorAlert from './lib/send-error-alert';
import { run as mailHealingReport } from './tasks/mail-healing-report';
import { run as mailOnError } from './tasks/mail-on-error';
import { run as mailOnFailedJob } from './tasks/mail-on-failed-job';

app.use(bodyParser.json({
  type: function(req) {
    return /^application\/json/.test(req.get('content-type'));
  }
}));

app.get('/', function(_, res) {
  res.send('Hello from delta-producer-report-generator :)');
});

app.post('/delta', async function(req, res) {
  const delta = req.body;
  const inserts = flatten(delta.map(changeSet => changeSet.inserts));

  if (!inserts.length) {
    console.log('Incoming deltas do not contain anything to be reported, skipping...');
    return res.status(204).send();
  }

  const process = async (inserts) => {
    for (const {label, task} of [
      {label: 'Healing Report', task: mailHealingReport},
      {label: 'Error Report', task: mailOnError},
      {label: 'Failed Job Report', task: mailOnFailedJob}]) {
      try {
        await task(inserts);
      } catch (error) {
        sendErrorAlert({
          message: `Something unexpected went wrong while processing task [${label}].`,
          detail: JSON.stringify({
            error: {
              message: error.message,
              stack: error.stack
            },
            inserts
          }, undefined, 2)
        });
      }
    }
  };

  // NOTE: to prevent missing delta's, we do not await the processing of the previous batch.
  process(inserts);

  console.log('Started processing delta, awaiting the next batch!');
  return res.status(204).send();
});

app.use(errorHandler);
