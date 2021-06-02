import { filterSubjectInTriples } from '../lib/utils';
import { createWarningEmail, getErrorMessage } from '../lib/queries';
import { TYPE_PREDICATE, ERROR_TYPE } from '../lib/constants';

//The errors may occur at random moments in the process. They (currently) don't fit in the task model
export async function run(triples){
  const errors = filterSubjectInTriples(triples, TYPE_PREDICATE, ERROR_TYPE);
  for(const error of errors){
    const message = await getErrorMessage(error);
    const emailContent = generateEmailContent(error, message);
    await createWarningEmail(emailContent.subject, emailContent);
  }
}

function generateEmailContent(uri, message) {
  return {
    subject: `An error occured in the delta-producer process`,
    text: `
      Hello,

      An error related to deltas has happened:
        - Uri: ${uri}
        - Message: "${message}"

      Have a nice day,
      Redpencil.io
    `,
    html: `
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
