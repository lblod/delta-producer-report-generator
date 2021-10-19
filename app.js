import { app, errorHandler } from 'mu';
import flatten from 'lodash.flatten';
import bodyParser from 'body-parser';
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
  if (inserts.length) {
    for (const run of [mailHealingReport, mailOnError, mailOnFailedJob]) {
      try {
        await run(inserts);
      } catch (error) {
        console.error(`There was an error processing ${inserts.join('\n')}`);
        console.error(error);
      }
    }
  } else {
    console.log('Incoming deltas do not contain anything to be reported, skipping.');
    res.status(204).send();
  }
});

app.use(errorHandler);
